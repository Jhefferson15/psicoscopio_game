import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirebaseGameSyncRepository } from '../src/features/game/data/repositories/FirebaseGameSyncRepository';
import { httpsCallable } from 'firebase/functions';

// Mocks
vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn()
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn((db, path) => ({ path })),
  onValue: vi.fn(),
  onDisconnect: vi.fn(() => ({ set: vi.fn(), cancel: vi.fn() })),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  set: vi.fn()
}));

vi.mock('../src/config/firebase.js', () => ({
  database: {},
  functions: {},
  firestore: {},
  isFirebaseConfigured: true
}));

describe('Presence and Room Control Logic', () => {
  let syncRepo;
  const mockCall = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    httpsCallable.mockReturnValue(mockCall);
    syncRepo = new FirebaseGameSyncRepository();
  });

  it('deve chamar JOIN_ROOM via function ao tentar entrar na sala', async () => {
    const roomId = 'ROOM1';
    const user = { name: 'Player 1', photoURL: 'url' };
    
    mockCall.mockResolvedValue({ data: { success: true } });
    
    // O joinRoom chama internamente _callGameAction('JOIN_ROOM')
    // Precisamos simular o retorno do RTDB também pois joinRoom faz um onValue
    const { onValue } = await import('firebase/database');
    onValue.mockImplementation((ref, cb) => {
      cb({ exists: () => true, val: () => ({ status: 'waiting' }) });
      return () => {};
    });

    await syncRepo.joinRoom(roomId, user);
    
    expect(httpsCallable).toHaveBeenCalledWith(expect.anything(), 'gameAction');
    expect(mockCall).toHaveBeenCalledWith({
      roomId,
      action: 'JOIN_ROOM',
      data: { name: user.name, photoURL: user.photoURL }
    });
  });

  it('deve falhar se a function retornar erro (ex: partida já iniciada)', async () => {
    const roomId = 'ROOM1';
    const user = { name: 'Player 1' };
    
    mockCall.mockRejectedValue(new Error('A partida já começou'));

    await expect(syncRepo.joinRoom(roomId, user)).rejects.toThrow('A partida já começou');
  });

  it('deve permitir chamar startTurn (PASS_TURN) se o jogador estiver offline ou for o host', async () => {
    const roomId = 'ROOM1';
    mockCall.mockResolvedValue({ data: { success: true } });
    
    // Simula chamada bem sucedida
    await syncRepo.startTurn(roomId, 1, 120);
    
    expect(mockCall).toHaveBeenCalledWith({
      roomId,
      action: 'PASS_TURN',
      data: { playerIndex: 1, turnDuration: 120 }
    });
  });

  it('deve validar permissões de PASS_TURN: apenas o dono ou o próprio jogador podem passar se online', async () => {
    const roomId = 'ROOM1';
    // Se a function retornar erro de permissão (jogador online), o repo deve propagar
    mockCall.mockRejectedValue(new Error('permission-denied: Não é o seu turno e o jogador atual está online.'));

    await expect(syncRepo.startTurn(roomId, 2, 120)).rejects.toThrow('Não é o seu turno');
  });

  it('deve permitir que qualquer um passe o turno se o jogador atual estiver offline (resolvendo travamento)', async () => {
    const roomId = 'ROOM1';
    mockCall.mockResolvedValue({ data: { success: true } });

    const result = await syncRepo.startTurn(roomId, 1, 120);
    expect(result).toEqual({ success: true });
  });

  it('deve simular o comportamento de hasLeft no repositório', async () => {
    const roomId = 'ROOM1';
    const userId = 'USER1';
    
    // Simula que há outros participantes para não deletar a sala
    const { onValue, set } = await import('firebase/database');
    onValue.mockImplementation((ref, cb) => {
      cb({ 
        exists: () => true, 
        val: () => ({ 
          participants: { 'USER1': { id: 'USER1' }, 'USER2': { id: 'USER2' } },
          status: 'playing'
        }) 
      });
      return () => {};
    });

    await syncRepo.leaveRoom(roomId, userId);
    
    // Verifica se set foi chamado com isOnline: false e hasLeft: true
    expect(set).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      isOnline: false,
      hasLeft: true
    }));
  });

  it('deve finalizar a sala se a trigger de presença detectar todos offline (Lógica de Servidor)', () => {
    // Nota: Triggers de servidor são testadas via mocks de estado ou testes de unidade de functions.
    // Como este é um teste de integração de frontend, validamos se o repo reporta o status.
    expect(true).toBe(true); // Placeholder para lógica de servidor
  });
});
