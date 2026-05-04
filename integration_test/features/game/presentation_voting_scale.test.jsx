import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionVerificationForm } from '../../../src/features/game/presentation/components/ActionVerificationForm';
import { useGame } from '../../../src/features/game/presentation/state/useGame';
import { useAuth } from '../../../src/features/auth/presentation/state/useAuth';
import { LIKERT_SCALE } from '../../../src/features/game/domain/constants/meegaQuestions';

// Mock dos hooks
vi.mock('../../../src/features/game/presentation/state/useGame');
vi.mock('../../../src/features/auth/presentation/state/useAuth');

describe('ActionVerificationForm - Votação MEEGA+', () => {
  const mockSyncRepository = {
    updateGameState: vi.fn().mockResolvedValue({})
  };

  const mockUser = { id: 'user-1', name: 'Test User' };
  const mockParticipants = {
    'user-1': { id: 'user-1', name: 'Test User' },
    'user-2': { id: 'user-2', name: 'Other Player' }
  };
  const mockPlayers = [
    { id: 'user-1', name: 'Test User', color: '#ff0000' },
    { id: 'user-2', name: 'Other Player', color: '#00ff00' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
  });

  it('deve renderizar as 5 opções da escala Likert', () => {
    useGame.mockReturnValue({
      activeVerification: {
        playerId: 'user-2',
        cardType: 'reflexao',
        cardText: 'Uma reflexão teste',
        responses: {}
      },
      roomParticipants: mockParticipants,
      roomId: 'room-1',
      syncRepository: mockSyncRepository,
      players: mockPlayers,
      roomStatus: 'verifying_action'
    });

    render(<ActionVerificationForm />);

    const options = screen.getAllByRole('button');
    expect(options).toHaveLength(5);
    
    LIKERT_SCALE.forEach(option => {
      expect(screen.getByTitle(option.label)).toBeDefined();
    });
  });

  it('deve enviar o valor correto ao clicar em uma opção', async () => {
    useGame.mockReturnValue({
      activeVerification: {
        playerId: 'user-2',
        cardType: 'reflexao',
        cardText: 'Uma reflexão teste',
        responses: {}
      },
      roomParticipants: mockParticipants,
      roomId: 'room-1',
      syncRepository: mockSyncRepository,
      players: mockPlayers,
      roomStatus: 'verifying_action'
    });

    render(<ActionVerificationForm />);

    // Clica na opção "Concordo Totalmente" (valor 5)
    const option5 = screen.getByTitle('Concordo Totalmente');
    await fireEvent.click(option5);

    expect(mockSyncRepository.updateGameState).toHaveBeenCalledWith('room-1', {
      "activeVerification/responses": {
        'user-1': 5
      }
    });
  });

  it('deve mostrar o estado de aguardando após votar', () => {
    useGame.mockReturnValue({
      activeVerification: {
        playerId: 'user-2',
        cardType: 'reflexao',
        cardText: 'Uma reflexão teste',
        responses: { 'user-1': 4 } // Já votou
      },
      roomParticipants: mockParticipants,
      roomId: 'room-1',
      syncRepository: mockSyncRepository,
      players: mockPlayers,
      roomStatus: 'verifying_action'
    });

    render(<ActionVerificationForm />);

    expect(screen.getByText(/Sua avaliação:/)).toBeDefined();
    expect(screen.getByText('Concordo')).toBeDefined();
    expect(screen.getByText('4')).toBeDefined();
  });

  it('deve exibir o botão de desfazer se a votação não estiver concluída', () => {
    useGame.mockReturnValue({
      activeVerification: {
        playerId: 'user-2',
        cardType: 'reflexao',
        cardText: 'Uma reflexão teste',
        responses: { 'user-1': 4 }
      },
      roomParticipants: mockParticipants,
      roomId: 'room-1',
      syncRepository: mockSyncRepository,
      players: mockPlayers,
      roomStatus: 'verifying_action'
    });

    render(<ActionVerificationForm />);

    expect(screen.getByText('Alterar meu voto')).toBeDefined();
  });

  it('deve chamar a remoção da resposta ao clicar em desfazer', async () => {
    useGame.mockReturnValue({
      activeVerification: {
        playerId: 'user-2',
        cardType: 'reflexao',
        cardText: 'Uma reflexão teste',
        responses: { 'user-1': 4 }
      },
      roomParticipants: mockParticipants,
      roomId: 'room-1',
      syncRepository: mockSyncRepository,
      players: mockPlayers,
      roomStatus: 'verifying_action'
    });

    render(<ActionVerificationForm />);

    const undoBtn = screen.getByText('Alterar meu voto');
    await fireEvent.click(undoBtn);

    expect(mockSyncRepository.updateGameState).toHaveBeenCalledWith('room-1', {
      "activeVerification/responses": {}
    });
  });
});
