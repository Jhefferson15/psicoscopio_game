import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirebaseGameSyncRepository } from '../../../src/features/game/data/repositories/FirebaseGameSyncRepository';
import { Player } from '../../../src/features/game/domain/entities/Player';
import { BoardConfig } from '../../../src/features/game/domain/entities/BoardConfig';
import { CardSet } from '../../../src/features/game/domain/entities/CardSet';
import { Tile } from '../../../src/features/game/domain/entities/Tile';

// Mock reativo do Firebase robusto
const globalDatabase = {
  rooms: {},
  ".info": { connected: true, serverTimeOffset: 0 }
};

const listeners = [];

const triggerListeners = (path) => {
  listeners.forEach(l => {
    if (path.startsWith(l.path) || l.path.startsWith(path)) {
      const data = getFromPath(globalDatabase, l.path);
      l.callback({
        exists: () => data !== undefined && data !== null,
        val: () => data === null ? null : JSON.parse(JSON.stringify(data))
      });
    }
  });
};

const getFromPath = (obj, path) => {
  if (path === '') return obj;
  return path.split('/').reduce((prev, curr) => prev ? prev[curr] : undefined, obj);
};

const setToPath = (obj, path, value) => {
  if (value === undefined) value = null;
  const parts = path.split('/');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  const key = parts[parts.length - 1];
  if (value === null) {
    delete current[key];
  } else {
    current[key] = value;
  }
  triggerListeners(path);
};

const updateToPath = (obj, path, value) => {
  const parts = path.split('/');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  const target = parts[parts.length - 1];
  if (!current[target] || typeof value !== 'object') {
    current[target] = value;
  } else {
    // Merge raso (shallow merge) como o Firebase update()
    Object.assign(current[target], value);
  }
  triggerListeners(path);
};

vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(),
  ref: vi.fn((db, path) => ({ path: path === undefined ? '' : path })),
  set: vi.fn((ref, value) => {
    setToPath(globalDatabase, ref.path, value);
    return Promise.resolve();
  }),
  update: vi.fn((ref, value) => {
    updateToPath(globalDatabase, ref.path, value);
    return Promise.resolve();
  }),
  onValue: vi.fn((ref, callback) => {
    listeners.push({ path: ref.path, callback });
    const data = getFromPath(globalDatabase, ref.path);
    callback({
      exists: () => data !== undefined && data !== null,
      val: () => data === null ? null : JSON.parse(JSON.stringify(data))
    });
    return () => {
      const idx = listeners.findIndex(l => l.callback === callback);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }),
  serverTimestamp: vi.fn(() => Date.now()),
  onDisconnect: vi.fn(() => ({
    set: vi.fn(() => {
      // Armazena para simular depois
      return Promise.resolve();
    }),
    cancel: vi.fn(() => Promise.resolve())
  }))
}));

vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(),
  httpsCallable: vi.fn((functions, name) => {
    if (name === 'gameAction') {
      return async (requestData) => {
        const { roomId, action, data } = requestData;
        const _uid = 'test-uid'; // Simula UID autenticado

        if (action === 'START_GAME') {
          updateToPath(globalDatabase, `rooms/${roomId}`, { status: data.status || 'playing' });
          updateToPath(globalDatabase, `rooms/${roomId}/gameState`, {
            players: data.players,
            currentPlayerIndex: 0,
            turnStartTime: Date.now(),
            turnDuration: data.turnDuration || 120,
            playerAttributes: data.playerAttributes || {}
          });
        } else if (action === 'PASS_TURN') {
          const room = globalDatabase.rooms[roomId] || {};
          const gameState = room.gameState || {};
          const players = gameState.players || [];
          
          let nextIndex;
          if (typeof data.playerIndex === 'number') {
            nextIndex = data.playerIndex;
          } else {
            const currentIndex = typeof gameState.currentPlayerIndex === 'number' ? gameState.currentPlayerIndex : -1;
            nextIndex = (currentIndex + 1) % (players.length || 1);
          }
          
          updateToPath(globalDatabase, `rooms/${roomId}/gameState`, {
            currentPlayerIndex: nextIndex,
            turnStartTime: Date.now()
          });
        } else if (action === 'SYNC_STATE') {
          updateToPath(globalDatabase, `rooms/${roomId}/gameState`, data);
        } else if (action === 'JOIN_ROOM') {
          const room = globalDatabase.rooms[roomId] || {};
          // Mapeamento explícito para o teste baseado no nome para manter consistência de IDs
          let id;
          if (data.name.includes('Host')) id = 'host-123';
          else if (data.name === 'Jogador 2') id = 'guest-1';
          else if (data.name === 'Jogador 3') id = 'guest-2';
          else if (data.name === 'Jogador 4') id = 'guest-3';
          else id = `guest-${Object.keys(room.participants || {}).length + 1}`;

          updateToPath(globalDatabase, `rooms/${roomId}/participants/${id}`, {
            id,
            name: data.name,
            isOnline: true,
            lastSeen: Date.now()
          });
        } else if (action === 'UPDATE_STATUS') {
          updateToPath(globalDatabase, `rooms/${roomId}`, { status: data.status });
        }
        return { data: { success: true, _uid } };
      };
    }
    return vi.fn();
  })
}));

vi.mock('../../../src/config/firebase.js', () => ({
  auth: {},
  database: {},
  firestore: {},
  functions: {}, // Mock vazio para satisfazer a verificação if(!functions)
  isFirebaseConfigured: true,
  default: true
}));

describe('Teste Extensivo de Gameplay Online (Estresse e Sincronização)', () => {
  let hostRepo, guestRepos;
  let roomId;
  
  const hostUser = { id: 'host-123', name: 'Host (Dono)' };
  const guests = [
    { id: 'guest-1', name: 'Jogador 2' },
    { id: 'guest-2', name: 'Jogador 3' },
    { id: 'guest-3', name: 'Jogador 4' }
  ];

  beforeEach(() => {
    globalDatabase.rooms = {};
    listeners.length = 0;
    hostRepo = new FirebaseGameSyncRepository();
    guestRepos = guests.map(() => new FirebaseGameSyncRepository());
  });

  it('deve validar 20 rodadas, atributos, mecânicas especiais e reconexão', async () => {
    // 1. Setup do Tabuleiro Customizado
    const customTiles = [
      new Tile(0, 'normal', 'Início', '#FFF', 'outer', 0),
      new Tile(1, 'reflexao', 'Pense Bem', '#4885CE', 'outer', 45),
      new Tile(2, 'especial', 'Atalho!', '#F00', 'outer', 90, 'MOVE_INNER'),
      new Tile(3, 'desafio', 'Desafio Árduo', '#D84B42', 'outer', 135),
      new Tile(4, 'especial', 'Meditação', '#00F', 'outer', 180, 'SKIP_TURN'),
      new Tile(5, 'especial', 'Sorte!', '#F59E0B', 'outer', 225, 'DRAW_2'),
      new Tile(6, 'inner', 'Centro de Paz', '#AAA', 'inner', 0),
      new Tile(7, 'inner', 'Círculo Interno', '#AAA', 'inner', 180)
    ];

    const customBoard = new BoardConfig('ext-b', 'Tabuleiro Extensivo', customTiles, { turnTime: 60 });
    const customCards = new CardSet('ext-c', 'Cartas Extensivas', {
      reflexao: [{ id: 'r1', text: 'Reflexão +10 Memória', effect: { memory: 10 } }],
      desafio: [{ id: 'd1', text: 'Desafio +5 Reflexão', effect: { reflection: 5 } }],
      sorte: [], memoria: [], experiencia: []
    });

    // 2. Criação da Sala e Entrada
    const gameState = {
      players: [new Player(hostUser.id, hostUser.name, '#D84B42', 0)],
      currentPlayerIndex: 0,
      boardConfig: customBoard.toJSON(),
      cardSet: customCards.toJSON(),
      status: 'waiting',
      playerAttributes: { [hostUser.id]: { memory: 0, reflection: 0, challenge: 0 } }
    };

    roomId = await hostRepo.createRoom(gameState, hostUser.id);
    for (let i = 0; i < guests.length; i++) {
      await guestRepos[i].joinRoom(roomId, guests[i]);
    }

    // 3. Início Real do Jogo
    await hostRepo.startGame(roomId);
    
    const finalPlayers = [
      { id: hostUser.id, name: hostUser.name, color: '#D84B42', position: 0, timeLeft: 60 },
      ...guests.map((g, i) => ({ id: g.id, name: g.name, color: i === 0 ? '#4885CE' : '#7B4BB1', position: 0, timeLeft: 60 }))
    ];
    
    const initialAttributes = {};
    [hostUser, ...guests].forEach(u => initialAttributes[u.id] = { memory: 10, reflection: 10, challenge: 10 });

    await hostRepo.updateGameState(roomId, { 
      players: finalPlayers, 
      playerAttributes: initialAttributes 
    });

    // 4. Loop de 20 Rodadas (80 turnos simulados)
    for (let round = 1; round <= 20; round++) {
      for (let pIdx = 0; pIdx < 4; pIdx++) {
        // Simulação de Sincronização de Turno
        await hostRepo.startTurn(roomId, pIdx, 60);
        
        const currentData = getFromPath(globalDatabase, `rooms/${roomId}/gameState`);
        expect(currentData.currentPlayerIndex).toBe(pIdx);
        expect(currentData.turnStartTime).toBeDefined();

        // Simulação de Jogada Aleatória (1-6)
        const roll = Math.floor(Math.random() * 6) + 1;
        const player = currentData.players[pIdx];
        
        // Lógica de Movimento Circular Restrito ao Anel (Simplificada para o teste)
        let nextPos = (player.position + roll) % customTiles.length;
        const tile = customTiles[nextPos];

        // Processamento de Mecânicas Especiais
        let updatedAttributes = { ...currentData.playerAttributes };
        let playerState = { ...player, position: nextPos };

        if (tile.type === 'reflexao') {
          updatedAttributes[player.id].memory += 5;
        } else if (tile.type === 'desafio') {
          updatedAttributes[player.id].reflection += 5;
        }

        if (tile.action === 'MOVE_INNER') {
          playerState.position = 6; // Vai para o centro
        } else if (tile.action === 'SKIP_TURN') {
          playerState.skipNextTurn = true;
        } else if (tile.action === 'DRAW_2') {
          updatedAttributes[player.id].challenge += 10; // Bônus de sorte
        }

        const newPlayers = [...currentData.players];
        newPlayers[pIdx] = playerState;

        // Simula Race Condition: Host e Guest tentam atualizar campos diferentes
        // O repositório usa update(), então deve ser seguro
        await Promise.all([
          hostRepo.updateGameState(roomId, { players: newPlayers }),
          guestRepos[0].updateGameState(roomId, { playerAttributes: updatedAttributes })
        ]);

        // Verificação de Integridade após o movimento
        const syncedData = getFromPath(globalDatabase, `rooms/${roomId}/gameState`);
        expect(syncedData.players[pIdx].position).toBe(playerState.position);
        expect(syncedData.playerAttributes[player.id]).toEqual(updatedAttributes[player.id]);
        
        // 5. Teste de Reconexão (A cada 10 turnos, um jogador "cai")
        if ((round * 4 + pIdx) % 10 === 0) {
          const droppingIdx = (pIdx + 1) % 4;
          const droppingUser = droppingIdx === 0 ? hostUser : guests[droppingIdx - 1];
          const droppingRepo = droppingIdx === 0 ? hostRepo : guestRepos[droppingIdx - 1];
          
          // Simula saída
          await droppingRepo.leaveRoom(roomId, droppingUser.id);
          let roomAfterLeave = getFromPath(globalDatabase, `rooms/${roomId}`);
          expect(roomAfterLeave.participants[droppingUser.id]).toBeDefined();
          expect(roomAfterLeave.participants[droppingUser.id].isOnline).toBe(false);

          // Simula volta imediata
          await droppingRepo.joinRoom(roomId, droppingUser);
          let roomAfterJoin = getFromPath(globalDatabase, `rooms/${roomId}`);
          expect(roomAfterJoin.participants[droppingUser.id]).toBeDefined();
          
          // Valida se o estado de jogo não foi perdido para ele
          let guestState;
          droppingRepo.listenToGameState(roomId, (s) => { guestState = s; });
          expect(guestState.players.length).toBe(4);
          expect(guestState.playerAttributes[droppingUser.id]).toBeDefined();
        }
      }
    }

    // 6. Verificação de Integridade Final
    const roomData = getFromPath(globalDatabase, `rooms/${roomId}`);
    expect(roomData.status).toBe('playing');
    const finalState = roomData.gameState;
    // Verifica se os atributos cresceram conforme as rodadas
    Object.values(finalState.playerAttributes).forEach(attr => {
      expect(attr.memory + attr.reflection + attr.challenge).toBeGreaterThan(30);
    });
  });

  it('deve simular falha de sincronização de timer e correção automática', async () => {
    await hostRepo.createRoom({ status: 'waiting' }, hostUser.id);
    const testRoomId = Object.keys(globalDatabase.rooms)[0];

    // Simula um timestamp antigo (sessão anterior persistida)
    const oldTimestamp = Date.now() - 1000000;
    await hostRepo.updateGameState(testRoomId, { turnStartTime: oldTimestamp, turnDuration: 60 });

    // O repositório deve permitir atualizar para um novo turno
    await hostRepo.startTurn(testRoomId, 0, 60);
    
    const state = getFromPath(globalDatabase, `rooms/${testRoomId}/gameState`);
    expect(state.turnStartTime).toBeGreaterThan(oldTimestamp);
    expect(state.currentPlayerIndex).toBe(0);
  });
});
