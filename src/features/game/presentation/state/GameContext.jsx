import { useState, useEffect, useCallback, useRef } from 'react';
import { GameContext } from './useGame';
import { Player } from '../../domain/entities/Player';
import { FirebaseGameSyncRepository } from '../../data/repositories/FirebaseGameSyncRepository.js';
import { MovePlayerUseCase } from '../../domain/usecases/MovePlayerUseCase';
import { BoardConfigRepository } from '../../data/repositories/BoardConfigRepository';
import { BoardConfig } from '../../domain/entities/BoardConfig';
import { CardSetRepository } from '../../data/repositories/CardSetRepository';
import { CardSet } from '../../domain/entities/CardSet';
import { useAuth } from '../../../auth/presentation/state/useAuth';
import { useUser } from '../../../user/presentation/state/useUser';


const syncRepository = new FirebaseGameSyncRepository();

const generateDiceRoll = (min = 1, max = 6) => Math.floor(Math.random() * (max - min + 1)) + min;

export const GameProvider = ({ children }) => {
  const [systemPopup, setSystemPopup] = useState(null);

  const showSystemPopup = useCallback((config) => {
    setSystemPopup(config);
  }, []);

  const closeSystemPopup = useCallback(() => {
    setSystemPopup(null);
  }, []);
  const { user } = useAuth();
  const [players, setPlayers] = useState([
    new Player(1, 'Jogador 1', '#D84B42', 0),
    new Player(2, 'Jogador 2', '#4885CE', 0)
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [lastDiceRoll, setLastDiceRoll] = useState(0);
  const [showModal, setShowModal] = useState(null); // { type: 'reflexao', tile: ... }
  const [isBoardFullScreen, setIsBoardFullScreen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [focusedCard, setFocusedCard] = useState(null); // { type, index, id, fromTileAction }
  const [boardRotation, setBoardRotation] = useState(0);
  const [confirmedMobileWarning, setConfirmedMobileWarning] = useState(false);
  const [settings, setSettings] = useState({
    sound: true,
    vibration: true
  });
  const [isRolling, setIsRolling] = useState(false);
  const [showDiary, setShowDiary] = useState(false);
  const [cardHistory, setCardHistory] = useState([]);
  const [showCardHistory, setShowCardHistory] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Estados para Conjuntos de Cartas
  const [availableCardSets, setAvailableCardSets] = useState(() => {
    const saved = CardSetRepository.getSavedSets();
    return [CardSetRepository.getDefaultSet(), ...saved];
  });

  const [activeCardSet, setActiveCardSet] = useState(() => {
    const saved = CardSetRepository.getSavedSets();
    const activeId = CardSetRepository.getActiveSetId();
    const defaultSet = CardSetRepository.getDefaultSet();
    const allSets = [defaultSet, ...saved];
    return allSets.find(s => s.id === activeId) || defaultSet;
  });

  // Estados para Configuração do Tabuleiro
  const [availableBoardConfigs, setAvailableBoardConfigs] = useState(() => {
    const saved = BoardConfigRepository.getSavedConfigs();
    return [BoardConfigRepository.getDefaultConfig(), ...saved];
  });

  const [activeBoardConfig, setActiveBoardConfig] = useState(() => {
    const saved = BoardConfigRepository.getSavedConfigs();
    const activeId = BoardConfigRepository.getActiveConfigId();
    const defaultConfig = BoardConfigRepository.getDefaultConfig();
    const allConfigs = [defaultConfig, ...saved];
    return allConfigs.find(c => c.id === activeId) || defaultConfig;
  });

  // Estado Online
  const [roomId, setRoomId] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [roomStatus, setRoomStatus] = useState('waiting'); // 'waiting' | 'playing'
  const [myPlayerIndex, setMyPlayerIndex] = useState(-1);
  const [roomParticipants, setRoomParticipants] = useState([]);
  const [readyPlayers, setReadyPlayers] = useState({});
  const [ownerId, setOwnerId] = useState(null);
  const [hostRole, setHostRole] = useState(null); // 'player' | 'observer'


  // Novos estados para Grandes Implementações
  const [playerAttributes, setPlayerAttributes] = useState({
    1: { memory: 20, reflection: 40, challenge: 10 },
    2: { memory: 30, reflection: 15, challenge: 50 }
  });

  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [turnStartTime, setTurnStartTime] = useState(null);
  const [turnDuration, setTurnDuration] = useState(120);

  const { 
    diary: diaryEntries, 
    addDiaryEntry: firestoreAddDiary,
    removeDiaryEntry: firestoreRemoveDiary,
    updateDiaryEntry: firestoreUpdateDiary,
    cloudCardSets,
    syncCardSetsToCloud,
    cloudBoardConfigs,
    syncBoardConfigsToCloud
  } = useUser();

  // Sincroniza cartas locais com as da nuvem ao logar
  useEffect(() => {
    if (user && cloudCardSets && cloudCardSets.length > 0) {
      const localSets = CardSetRepository.getSavedSets();
      const mergedMap = new Map();
      localSets.forEach(s => mergedMap.set(s.id, s));
      cloudCardSets.forEach(s => mergedMap.set(s.id, s));
      const mergedSets = Array.from(mergedMap.values());
      
      CardSetRepository.saveSets(mergedSets);
      queueMicrotask(() => {
        setAvailableCardSets([CardSetRepository.getDefaultSet(), ...mergedSets]);
      });
    }
  }, [user, cloudCardSets]);

  // Sincroniza tabuleiros locais com os da nuvem ao logar
  useEffect(() => {
    if (user && cloudBoardConfigs && cloudBoardConfigs.length > 0) {
      const localConfigs = BoardConfigRepository.getSavedConfigs();
      const mergedMap = new Map();
      localConfigs.forEach(c => mergedMap.set(c.id, c));
      cloudBoardConfigs.forEach(c => mergedMap.set(c.id, c));
      const mergedConfigs = Array.from(mergedMap.values());
      
      BoardConfigRepository.saveConfigs(mergedConfigs);
      queueMicrotask(() => {
        setAvailableBoardConfigs([BoardConfigRepository.getDefaultConfig(), ...mergedConfigs]);
      });
    }
  }, [user, cloudBoardConfigs]);

  // Sincroniza offset de tempo com o servidor
  useEffect(() => {
    return syncRepository.getServerTimeOffset(setServerTimeOffset);
  }, []);


  // O tempo agora é gerenciado com base em timestamps do servidor para consistência

  const toggleFullScreen = () => setIsBoardFullScreen(prev => !prev);
  
  const startGame = () => {
    // Garante que o cronometro comece ao entrar na tela de jogo (modo offline)
    if (!isOnline) {
      const turnTime = activeBoardConfig.mechanics?.turnTime || 120;
      setTurnStartTime(Date.now());
      setTurnDuration(turnTime);
    }
    setCurrentScreen('game');
  };


  const initializeGame = (newPlayers) => {
    const turnTime = activeBoardConfig.mechanics?.turnTime || 120;
    setPlayers(newPlayers.map((p, i) => new Player(p.id || i + 1, p.name, p.color, 0, turnTime)));
    setCurrentPlayerIndex(0);
    setTurnStartTime(Date.now());
    setTurnDuration(turnTime);
    setCurrentScreen('card_creation');
  };

  const finishCardCreation = async () => {
    if (isOnline) {
      try {
        await syncRepository.setUserReady(roomId, user.id);
        setCurrentScreen('waiting_players');
      } catch (error) {
        console.error("Erro ao marcar como pronto:", error);
        showSystemPopup({
          title: 'Erro de Sincronização',
          message: 'Não foi possível marcar como pronto. Verifique sua conexão.',
          type: 'error'
        });
      }
    } else {
      // Inicia o cronometro ao entrar no jogo offline
      const turnTime = activeBoardConfig.mechanics?.turnTime || 120;
      setTurnStartTime(Date.now());
      setTurnDuration(turnTime);
      setCurrentScreen('game');
    }
  };


  const handleGoToMenu = () => {
    // Só mostra confirmação se estiver em jogo ou em telas críticas de preparação de partida online
    const isCriticalGameScreen = currentScreen === 'game' || 
                                (isOnline && (currentScreen === 'lobby' || currentScreen === 'waiting_players' || currentScreen === 'card_creation'));
    
    if (isCriticalGameScreen) {
      setShowLeaveConfirm(true);
    } else {
      goToMenu();
    }
  };

  const confirmGoToMenu = () => {
    setShowLeaveConfirm(false);
    goToMenu();
  };

  const goToMenu = useCallback(async () => {
    if (isOnline && roomId && user) {
      try {
        await syncRepository.leaveRoom(roomId, user.id);
      } catch (error) {
        console.error("Erro ao sair da sala:", error);
      }
    }
    setRoomId(null);
    setIsOnline(false);
    syncRepository.clearActiveRoomId();
    setCurrentScreen('menu');
  }, [isOnline, roomId, user]);

  // Funções Online
  const createOnlineGame = async (newPlayers) => {
    const turnTime = activeBoardConfig.mechanics?.turnTime || 120;
    const initialPlayers = newPlayers.map((p, i) => new Player(p.id || i + 1, p.name, p.color, 0, turnTime));
    const gameState = {
      players: initialPlayers,
      currentPlayerIndex: 0,
      lastDiceRoll: 0,
      boardConfig: activeBoardConfig.toJSON(),
      playerAttributes: {
        1: { memory: 20, reflection: 40, challenge: 10 },
        2: { memory: 30, reflection: 15, challenge: 50 }
      }
    };

    try {
      const id = await syncRepository.createRoom(gameState, user?.id);
      setRoomId(id);
      setIsOnline(true);
      setPlayers(initialPlayers);
      setCurrentPlayerIndex(0);
      setCurrentScreen('lobby');
      return id;
    } catch (error) {
      console.error("Erro ao criar sala:", error);
      showSystemPopup({
        title: 'Falha na Conexão',
        message: `Não foi possível criar a sala online: ${error.message}`,
        type: 'error'
      });
    }
  };

  const joinOnlineGame = useCallback(async (id) => {
    try {
      const room = await syncRepository.joinRoom(id, user);
      setRoomId(id);
      setIsOnline(true);
      setRoomStatus(room.status);
      setOwnerId(room.ownerId);
      setHostRole(room.metadata?.hostRole || 'player');
      setRoomParticipants(room.participants || {});
      
      if (room.gameState) {
        const playersArray = room.gameState.players || [];
        setPlayers(playersArray.map(p => new Player(p.id, p.name, p.color, p.position, p.timeLeft, p.lastRoll)));
        setCurrentPlayerIndex(room.gameState.currentPlayerIndex);
        setPlayerAttributes(room.gameState.playerAttributes);

        // Restaura dados do cronometro para o timer funcionar imediatamente apos reconexao
        if (room.gameState.turnStartTime) {
          setTurnStartTime(room.gameState.turnStartTime);
        }
        if (room.gameState.turnDuration) {
          setTurnDuration(room.gameState.turnDuration);
        }
        if (room.gameState.boardConfig) {
          setActiveBoardConfig(BoardConfig.fromJSON(room.gameState.boardConfig));
        }
      }

      if (room.status === 'playing') {
        setCurrentScreen('game');
      } else if (room.status === 'setup_cards') {
        setCurrentScreen('card_creation');
      } else {
        setCurrentScreen('lobby');
      }
    } catch (error) {
      console.error("Erro ao entrar na sala:", error);
      showSystemPopup({
        title: 'Erro de Entrada',
        message: `Não foi possível entrar na sala: ${error.message}`,
        type: 'error'
      });
      // Se falhou ao reconectar a uma sala salva, limpa o cache para nao travar
      if (syncRepository.getActiveRoomId() === id) {
        syncRepository.clearActiveRoomId();
      }
    }
  }, [user, showSystemPopup]);

  // Persistência da sala online (Reconexão no F5)
  useEffect(() => {
    if (roomId) {
      syncRepository.saveActiveRoomId(roomId);
    }
  }, [roomId]);

  useEffect(() => {
    const savedRoomId = syncRepository.getActiveRoomId();
    // Só tenta reconectar se o usuário já estiver logado, se não estiver numa sala e não for online
    if (savedRoomId && user && !roomId && !isOnline) {
      console.log('Tentando reconectar à sala salva:', savedRoomId);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      joinOnlineGame(savedRoomId);
    }
  }, [user, roomId, isOnline, joinOnlineGame]);

  const startOnlineGame = async () => {
    const isObserverRoom = hostRole === 'observer';
    if (ownerId !== user?.id && !isObserverRoom) return;
    
    // Dupla verificação para impedir que o jogo inicie sem participantes
    const participantsArray = Object.values(roomParticipants);
    if (participantsArray.length < 2) {
      showSystemPopup({
        title: 'Sala Vazia',
        message: 'A sala precisa ter pelo menos 2 jogadores para iniciar.',
        type: 'warning'
      });
      return;
    }

    try {
      // Inicializa a lista de jogadores baseada nos participantes reais
      const colors = ['#D84B42', '#4885CE', '#7B4BB1', '#F59E0B', '#10B981', '#6366F1'];
      const turnTime = activeBoardConfig.mechanics?.turnTime || 120;
      
      const initialPlayers = participantsArray.map((p, i) => ({
        id: p.id,
        name: p.name,
        color: colors[i % colors.length],
        position: 0,
        timeLeft: turnTime,
        lastRoll: null
      }));

      const initialGameState = {
        players: initialPlayers,
        turnDuration: turnTime,
        playerAttributes: initialPlayers.reduce((acc, p) => {
          acc[p.id] = { memory: 20, reflection: 20, challenge: 20 };
          return acc;
        }, {}),
        boardConfig: activeBoardConfig.toJSON(),
        status: 'setup_cards' // Status que a function deve definir
      };

      // Chamada única e atômica via Cloud Functions
      await syncRepository.startGame(roomId, initialGameState);
    } catch (error) {
      console.error("Erro ao iniciar jogo:", error);
    }
  };

  const startPlayingGame = useCallback(async () => {
    const isObserverRoom = hostRole === 'observer';
    if (ownerId !== user?.id && !isObserverRoom) return;
    try {
      await syncRepository.updateRoomStatus(roomId, 'playing');
    } catch (error) {
      console.error("Erro ao iniciar jogo:", error);
    }
  }, [hostRole, ownerId, user?.id, roomId]);

  const syncStateToFirebase = useCallback(async (overrides = {}) => {
    if (!isOnline || !roomId || isSyncing || players.length === 0) return;
    
    // isMoving e isRolling sao estados VISUAIS locais. Nao devem ser sincronizados.
    // turnStartTime e turnDuration sao gerenciados EXCLUSIVAMENTE por startTurn via
    // serverTimestamp(). Incluir aqui causaria loop: valor stale e reenviado e volta
    // via listener, resetando o guard e causando o timer disparar em loop.
    const gameState = {
      players: overrides.players || players,
      currentPlayerIndex: overrides.currentPlayerIndex !== undefined ? overrides.currentPlayerIndex : currentPlayerIndex,
      lastDiceRoll: overrides.lastDiceRoll !== undefined ? overrides.lastDiceRoll : lastDiceRoll,
      isRolling: overrides.isRolling !== undefined ? overrides.isRolling : isRolling,
      playerAttributes: playerAttributes,
      lastActionBy: user?.id || null
    };

    try {
      await syncRepository.updateGameState(roomId, gameState);
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
    }
  }, [isOnline, roomId, players, currentPlayerIndex, lastDiceRoll, playerAttributes, isSyncing, user, isRolling]);


  useEffect(() => {
    if (isOnline && roomId) {
      const unsubscribe = syncRepository.listenToGameState(roomId, (newState) => {
        setIsSyncing(true);
        if (newState.players) {
          // ANTI-ROLLBACK: Se o CLIENTE LOCAL esta em movimento, nao sobrescreve
          // as posicoes — o Firebase ainda pode ter um estado anterior ao movimento
          // em andamento. O estado final sera sincronizado ao terminar movePlayer.
          if (!isMovingRef.current) {
            setPlayers(newState.players.map(p => new Player(p.id, p.name, p.color, p.position, p.timeLeft, p.lastRoll)));
          }
        }
        if (newState.currentPlayerIndex !== undefined) setCurrentPlayerIndex(newState.currentPlayerIndex);
        if (newState.lastDiceRoll !== undefined) setLastDiceRoll(newState.lastDiceRoll);
        if (newState.isRolling !== undefined) setIsRolling(newState.isRolling);
        // isMoving NAO e sincronizado. Cada cliente gerencia sua propria animacao de movimento baseada nos players.
        if (newState.playerAttributes) setPlayerAttributes(newState.playerAttributes);
        if (newState.turnStartTime !== undefined && newState.turnStartTime !== null) {
          const maxAgeMs = ((newState.turnDuration || turnDuration || 120) + 30) * 1000;
          const isStale = newState.turnStartTime > 0 && (Date.now() - newState.turnStartTime) > maxAgeMs;
          
          if (!isStale) {
            setTurnStartTime(newState.turnStartTime);
          } else {
            console.warn("[Timer] turnStartTime recebido esta desatualizado (sessao antiga). Ignorando para evitar timer zerado.");
            setTurnStartTime(null);
          }
          // Sempre reseta o guard ao receber um update de turno do servidor
          isTurnBeingPassedRef.current = false;
        }
        if (newState.turnDuration !== undefined) setTurnDuration(newState.turnDuration);
        if (newState.boardConfig) {
          setActiveBoardConfig(BoardConfig.fromJSON(newState.boardConfig));
        }

        
        setTimeout(() => setIsSyncing(false), 500);
      });

      // Listener para o status e participantes da sala
      const unsubscribeRoom = syncRepository.listenToRoomData(roomId, (room) => {
        if (!room) return;
        
        setRoomStatus(room.status || 'waiting');
        
        // Normalização para suportar salas antigas (arrays misturados com objetos)
        const rawParticipants = room.participants || {};
        const normalizedParticipants = {};
        Object.values(rawParticipants).forEach(val => {
          if (typeof val === 'string') {
            // Formato antigo (apenas o ID do usuário como string)
            normalizedParticipants[val] = { id: val, name: 'Convidado', photoURL: null };
          } else if (val && typeof val === 'object' && val.id) {
            // Formato novo (objeto com id, name, photoURL)
            normalizedParticipants[val.id] = val;
          }
        });
        
        setRoomParticipants(normalizedParticipants);
        setReadyPlayers(room.readyPlayers || {});
        setOwnerId(room.ownerId || null);
        
        if (room.status === 'playing' && (currentScreen === 'lobby' || currentScreen === 'card_creation' || currentScreen === 'waiting_players')) {
          setCurrentScreen('game');
        }
        
        if (room.status === 'setup_cards' && currentScreen === 'lobby') {
          setCurrentScreen('card_creation');
        }
      });

      // Monitoramento de Presença
      const unsubscribePresence = syncRepository.updatePlayerPresence(roomId, user?.id);

      // Listener para o histórico da sala (cartas sorteada)
      const unsubscribeHistory = syncRepository.listenToRoomHistory(roomId, (history) => {
        if (history && history.cards) {
          const sortedCards = Object.values(history.cards).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setCardHistory(sortedCards);
        }
      });

      return () => {
        unsubscribe();
        unsubscribeRoom();
        unsubscribeHistory();
        if (typeof unsubscribePresence === 'function') unsubscribePresence();
      };
    }
  }, [isOnline, roomId, user, currentScreen, turnDuration]);

  // Sincroniza meu índice de jogador com base no ID do usuário logado
  useEffect(() => {
    if (isOnline && user && players.length > 0) {
      const index = players.findIndex(p => p.id === user.id);
      if (index !== -1 && index !== myPlayerIndex) {
        console.log(`Meu índice de jogador identificado: ${index} (${user.name})`);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMyPlayerIndex(index);
      }
    }
  }, [isOnline, user, players, myPlayerIndex]);

  // Monitoramento de partida encerrada
  useEffect(() => {
    if (isOnline && roomStatus === 'finished' && currentScreen !== 'menu') {
      const timer = setTimeout(() => {
        showSystemPopup({
          title: 'Partida Encerrada',
          message: 'A partida foi finalizada pois todos os jogadores saíram ou o tempo expirou.',
          buttonText: 'Voltar ao Menu',
          onConfirm: goToMenu
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [roomStatus, isOnline, currentScreen, showSystemPopup, goToMenu]);

  // Início Automático em Salas de Observador (quando todos estão prontos)
  useEffect(() => {
    if (!isOnline || !roomId || roomStatus !== 'setup_cards' || hostRole !== 'observer') return;

    const participantsArray = Object.keys(roomParticipants);
    const readyIds = Object.keys(readyPlayers);

    // Consideramos apenas os IDs que estão tanto em participants quanto em readyPlayers
    const activeReadyCount = participantsArray.filter(id => readyIds.includes(id)).length;

    if (participantsArray.length >= 2 && activeReadyCount >= participantsArray.length) {
      // Todos estão prontos. Para evitar concorrência, o jogador com o ID alfabeticamente menor inicia.
      const sortedIds = [...participantsArray].sort();
      if (user?.id === sortedIds[0]) {
        console.log("Todos os jogadores estão prontos. Iniciando partida automaticamente...");
        startPlayingGame();
      }
    }
  }, [isOnline, roomId, roomStatus, hostRole, roomParticipants, readyPlayers, user?.id, startPlayingGame]);


  const changeActiveCardSet = (id) => {
    const set = availableCardSets.find(s => s.id === id);
    if (set) {
      setActiveCardSet(set);
      CardSetRepository.setActiveSetId(id);
    }
  };

  const saveNewCardSet = (name, content) => {
    const newSet = new CardSet(Date.now().toString(), name, content);
    const saved = CardSetRepository.getSavedSets();
    const updated = [...saved, newSet];
    CardSetRepository.saveSets(updated);
    setAvailableCardSets([CardSetRepository.getDefaultSet(), ...updated]);
    if (user) syncCardSetsToCloud(updated);
    return newSet.id;
  };

  const updateCardSet = (id, content, name) => {
    if (id === 'default') return;
    const saved = CardSetRepository.getSavedSets();
    const index = saved.findIndex(s => s.id === id);
    if (index >= 0) {
      if (content) saved[index].content = content;
      if (name) saved[index].name = name;
      saved[index].updatedAt = Date.now();
      
      CardSetRepository.saveSets(saved);
      setAvailableCardSets([CardSetRepository.getDefaultSet(), ...saved]);
      if (user) syncCardSetsToCloud(saved);
      if (activeCardSet.id === id) {
        setActiveCardSet(CardSet.fromJSON(saved[index]));
      }
    }
  };

  const deleteCardSet = (id) => {
    if (id === 'default') return;
    CardSetRepository.deleteSet(id);
    const saved = CardSetRepository.getSavedSets();
    setAvailableCardSets([CardSetRepository.getDefaultSet(), ...saved]);
    if (user) syncCardSetsToCloud(saved);
    if (activeCardSet.id === id) {
      setActiveCardSet(CardSetRepository.getDefaultSet());
    }
  };

  const resetToDefault = () => {
    changeActiveCardSet('default');
  };

  // Funções de Tabuleiro
  const changeActiveBoardConfig = (id) => {
    const config = availableBoardConfigs.find(c => c.id === id);
    if (config) {
      setActiveBoardConfig(config);
      BoardConfigRepository.setActiveConfigId(id);
    }
  };

  const saveNewBoardConfig = (name, tiles, mechanics) => {
    const newConfig = new BoardConfig(Date.now().toString(), name, tiles, mechanics);
    const saved = BoardConfigRepository.getSavedConfigs();
    const updated = [...saved, newConfig];
    BoardConfigRepository.saveConfigs(updated);
    setAvailableBoardConfigs([BoardConfigRepository.getDefaultConfig(), ...updated]);
    if (user) syncBoardConfigsToCloud(updated);
    return newConfig.id;
  };

  const updateBoardConfig = (id, tiles, mechanics, name) => {
    if (id === 'default') return;
    const saved = BoardConfigRepository.getSavedConfigs();
    const index = saved.findIndex(c => c.id === id);
    if (index >= 0) {
      if (tiles) saved[index].tiles = tiles;
      if (mechanics) saved[index].mechanics = mechanics;
      if (name) saved[index].name = name;
      saved[index].updatedAt = Date.now();
      
      BoardConfigRepository.saveConfigs(saved);
      setAvailableBoardConfigs([BoardConfigRepository.getDefaultConfig(), ...saved]);
      if (user) syncBoardConfigsToCloud(saved);
      if (activeBoardConfig.id === id) {
        setActiveBoardConfig(BoardConfig.fromJSON(saved[index]));
      }
    }
  };

  const deleteBoardConfig = (id) => {
    if (id === 'default') return;
    BoardConfigRepository.deleteConfig(id);
    const saved = BoardConfigRepository.getSavedConfigs();
    setAvailableBoardConfigs([BoardConfigRepository.getDefaultConfig(), ...saved]);
    if (user) syncBoardConfigsToCloud(saved);
    if (activeBoardConfig.id === id) {
      setActiveBoardConfig(BoardConfig.getDefaultConfig());
    }
  };

  const importCardSet = (data) => {
    try {
      if (!data.name || !data.content) throw new Error("Estrutura JSON inválida para coleção de cartas.");
      const newName = `${data.name} (Importado)`;
      return saveNewCardSet(newName, data.content);
    } catch (e) {
      console.error("Erro ao importar cartas:", e);
      showSystemPopup({
        title: 'Erro na Importação',
        message: 'O arquivo JSON não parece ser uma coleção de cartas válida.',
        type: 'error'
      });
      return null;
    }
  };

  const importBoardConfig = (data) => {
    try {
      if (!data.name || !data.tiles || !data.mechanics) throw new Error("Estrutura JSON inválida para tabuleiro.");
      const newName = `${data.name} (Importado)`;
      return saveNewBoardConfig(newName, data.tiles, data.mechanics);
    } catch (e) {
      console.error("Erro ao importar tabuleiro:", e);
      showSystemPopup({
        title: 'Erro na Importação',
        message: 'O arquivo JSON não parece ser uma configuração de tabuleiro válida.',
        type: 'error'
      });
      return null;
    }
  };


  const getRingIndices = useCallback((ring) => {
    // Agrupa 'outer' e 'special' no mesmo nível de movimento
    const getLevel = (r) => {
      if (r === 'outer' || r === 'special') return 1;
      if (r === 'middle') return 2;
      if (r === 'inner') return 3;
      return 0; // center
    };

    const targetLevel = getLevel(ring);
    return activeBoardConfig.tiles
      .map((t, idx) => getLevel(t.ring) === targetLevel ? idx : -1)
      .filter(idx => idx !== -1);
  }, [activeBoardConfig]);

  // Refs para manter o timer estavel e prevenir race conditions
  const passTurnRef = useRef(null);
  const myPlayerIndexRef = useRef(myPlayerIndex);
  // Flag para prevenir double-passTurn (race condition entre timer e fim de movimento)
  const isTurnBeingPassedRef = useRef(false);

  const passTurn = useCallback((overrides = {}) => {
    // GUARD: Previne double-passTurn (race condition entre timer e fim de movimento)
    if (isTurnBeingPassedRef.current) {
      console.warn("passTurn ignorado: turno ja esta sendo passado.");
      return;
    }
    // eslint-disable-next-line react-hooks/immutability
    isTurnBeingPassedRef.current = true;

    const turnTime = activeBoardConfig.mechanics?.turnTime || 120;
    const basePlayers = overrides.players || players;
    let nextIndex = (currentPlayerIndex + 1) % basePlayers.length;
    // Verifica se o proximo jogador deve pular a vez (seja por carta ou por estar offline)
    let nextPlayer = basePlayers[nextIndex];
    let updatedPlayers = [...basePlayers];
    
    // Loop para encontrar o próximo disponível (máximo players.length tentativas)
    for (let i = 0; i < basePlayers.length; i++) {
      const nextParticipant = roomParticipants[nextPlayer.id];
      const isNextOnline = nextParticipant ? nextParticipant.isOnline : true;

      if (nextPlayer.skipNextTurn || !isNextOnline) {
        console.log(`PULANDO VEZ DE: ${nextPlayer.name} (${nextPlayer.skipNextTurn ? 'Carta' : 'Offline'})`);
        if (nextPlayer.skipNextTurn) {
          updatedPlayers = updatedPlayers.map((p, j) => 
            j === nextIndex ? { ...p, skipNextTurn: false } : p
          );
        }
        nextIndex = (nextIndex + 1) % updatedPlayers.length;
        nextPlayer = updatedPlayers[nextIndex];
      } else {
        break;
      }
    }

    // Aplica o reset de tempo e limpa o ultimo dado ao jogador que esta assumindo o turno
    updatedPlayers = updatedPlayers.map((p, i) => {
      if (i === nextIndex) return { ...p, timeLeft: turnTime, lastRoll: null };
      return p;
    });

    setPlayers(updatedPlayers);
    setCurrentPlayerIndex(nextIndex);
    
    if (isOnline && roomId) {
      // startTurn grava turnStartTime com serverTimestamp().
      // O listener onValue recebe o novo turnStartTime e reseta isTurnBeingPassedRef.
      syncRepository.startTurn(roomId, nextIndex, turnTime).catch(e => {
        console.warn("[PASS_TURN] Falha silenciosa (provavelmente já processado):", e.message);
        isTurnBeingPassedRef.current = false;
      });
      syncStateToFirebase({ 
        ...overrides,
        players: updatedPlayers, 
        currentPlayerIndex: nextIndex
      });
    } else {
      setTurnStartTime(Date.now());
      setTurnDuration(turnTime);
      // Modo offline: reseta o flag apos um tick para permitir que o estado se atualize
      queueMicrotask(() => { isTurnBeingPassedRef.current = false; });
    }
  }, [currentPlayerIndex, players, isOnline, roomId, syncStateToFirebase, activeBoardConfig, roomParticipants]);

  // Refs de passagem: as declaracoes foram movidas para antes de passTurn
  // isMovingRef: permite o listener ignorar atualizacoes de players durante animacao local
  const isMovingRef = useRef(false);
  const playersRef = useRef(players);
  
  useEffect(() => { passTurnRef.current = passTurn; }, [passTurn]);
  useEffect(() => { myPlayerIndexRef.current = myPlayerIndex; }, [myPlayerIndex]);
  useEffect(() => { playersRef.current = players; }, [players]);
  // Mantém isMovingRef sincronizado com o estado isMoving
  // eslint-disable-next-line react-hooks/immutability
  useEffect(() => { isMovingRef.current = isMoving; }, [isMoving]);

  useEffect(() => {
    if (currentScreen !== 'game' || isMoving || showModal) return;

    // Se o turnStartTime ainda nao chegou do servidor, aguarda sem decrementar
    if (!turnStartTime) {
      console.log("[Timer] Aguardando turnStartTime do servidor...");
      return;
    }

    const interval = setInterval(() => {
      setPlayers(prev => {
        // serverTimeOffset corrige a diferenca entre o relogio local e o servidor Firebase
        const now = Date.now() + serverTimeOffset;
        const elapsed = Math.floor((now - turnStartTime) / 1000);
        const remaining = Math.max(0, turnDuration - elapsed);

        const newPlayers = [...prev];
        const currentPlayer = { ...newPlayers[currentPlayerIndex] };
        
        // So atualiza o estado se o valor visual mudou (evita re-renders desnecessarios)
        if (currentPlayer.timeLeft !== remaining) {
          currentPlayer.timeLeft = remaining;
          newPlayers[currentPlayerIndex] = currentPlayer;
          
          if (remaining <= 0) {
            clearInterval(interval);
            // Autoridade para passar o turno por tempo:
            // 1. O próprio jogador da vez (se estiver online)
            // 2. O Anfitrião (Host) como backup
            // 3. Qualquer jogador online se o jogador da vez estiver offline (desconectado)
            // 4. Modo offline (sempre passa)
            const isMyTurn = currentPlayerIndex === myPlayerIndexRef.current;
            const isHost = user?.id === ownerId;
            const currentParticipant = roomParticipants[currentPlayer.id];
            const isCurrentPlayerOnline = currentParticipant ? currentParticipant.isOnline : true;
            
            if (!isOnline || isMyTurn || isHost || !isCurrentPlayerOnline) {
              console.log("[Timer] Tempo esgotado! Tentando passar turno...", { isMyTurn, isHost, isCurrentPlayerOnline });
              passTurnRef.current();
            }
          }
          return newPlayers;
        }
        
        return prev;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [currentScreen, isMoving, currentPlayerIndex, showModal, isOnline, turnStartTime, turnDuration, serverTimeOffset, ownerId, user?.id, roomParticipants]);





  const rollDice = async () => {
    if (isMoving || isRolling) return;
    if (isOnline && currentPlayerIndex !== myPlayerIndex) return; // Trava de seguranca backend
    
    setIsRolling(true);
    setIsMoving(true);
    setLastDiceRoll(0);
    
    // Sincroniza o inicio da rolagem para todos verem a animacao
    if (isOnline) {
      syncRepository.updateGameState(roomId, { isRolling: true, lastActionBy: user?.id || null }).catch(
        e => console.error("Erro sync inicio rolagem", e)
      );
    }
    
    // Simula tempo de "rolagem" do dado (animacao do botao/shaker)
    await new Promise(r => setTimeout(r, 1500));
    
    const { diceMin = 1, diceMax = 6 } = activeBoardConfig.mechanics || {};
    const roll = generateDiceRoll(diceMin, diceMax);
    setLastDiceRoll(roll);
    setIsRolling(false);
    
    // Atualiza apenas o lastRoll do jogador (nao a posicao)
    const updatedPlayers = players.map((p, i) => i === currentPlayerIndex ? { ...p, lastRoll: roll } : p);
    setPlayers(updatedPlayers);
    
    // Sincroniza o resultado e para a animacao para todos
    if (isOnline) {
      syncRepository.updateGameState(roomId, { 
        isRolling: false, 
        lastDiceRoll: roll, 
        lastActionBy: user?.id || null 
      }).catch(
        e => console.error("Erro sync dado", e)
      );
    }

    // O numero esta na tela. Aguarda antes de mover
    await new Promise(r => setTimeout(r, 1200));
    
    // Inicia o movimento com o array atualizado para evitar stale closure
    await movePlayer(roll, updatedPlayers);
  };


  const movePlayer = async (steps, startingPlayers) => {
    // Usa o array passado como parametro para evitar stale closure do estado React
    // Isso garante que as posicoes sejam calculadas a partir do estado correto
    let newPlayers = startingPlayers ? [...startingPlayers] : [...players];
    let player = { ...newPlayers[currentPlayerIndex] };
    
    // Identifica as casas do nivel atual para movimento circular restrito
    const initialTile = activeBoardConfig.tiles[player.position];
    const ringIndices = getRingIndices(initialTile.ring);
    let relativePos = ringIndices.indexOf(player.position);

    // Se por algum motivo o jogador nao estiver no anel (ex: center), mantem posicao
    if (relativePos === -1) {
      setIsMoving(false);
      passTurn();
      return;
    }

    // Movimento passo a passo para animacao global
    for (let i = 0; i < steps; i++) {
      relativePos = (relativePos + 1) % ringIndices.length;
      player.position = ringIndices[relativePos];
      
      newPlayers[currentPlayerIndex] = { ...player };
      setPlayers([...newPlayers]);
      
      // Sincroniza posicao atual para outros clientes verem a animacao
      if (isOnline && roomId) {
        syncRepository.updateGameState(roomId, {
          players: newPlayers,
          lastActionBy: user?.id || null
        }).catch(e => console.error("Erro sync passo", e));
      }
      
      await new Promise(r => setTimeout(r, 400));
    }

    // Chegou no destino. Sincronizacao final autoritativa (estado canonico)
    if (isOnline && roomId) {
      await syncRepository.updateGameState(roomId, {
        players: newPlayers,
        lastActionBy: user?.id || null
      }).catch(e => console.error("Erro sync final", e));
    }

    await new Promise(r => setTimeout(r, 600));

    // Handle tile action
    const currentTile = activeBoardConfig.tiles[player.position];
    const hasModal = handleTileAction(currentTile, player, newPlayers);

    setIsMoving(false);

    // Se nao abriu modal, passa o turno imediatamente
    if (!hasModal) {
      passTurn({ players: newPlayers });
    }
  };


  const rotateBoard = useCallback(() => {
    setBoardRotation(prev => (prev + 90) % 360);
  }, []);

  const handleTileAction = (tile, player, allPlayers) => {
    let modalOpened = false;
    
    if (tile.type === 'reflexao' || tile.type === 'desafio' || tile.action === 'DRAW_2') {
      const typeMap = { 'reflexao': 3, 'desafio': 2, 'memoria': 0, 'experiencia': 1 };
      const cardType = tile.type === 'normal' ? 'desafio' : tile.type;

      setFocusedCard({ 
        type: cardType, 
        index: typeMap[cardType] || 0, 
        id: `card-${cardType}-${Date.now()}`,
        fromTileAction: true 
      });

      if (tile.action === 'DRAW_2') {
        // Sinaliza que deve comprar outra carta após fechar esta
        setFocusedCard(prev => ({ ...prev, nextDraw: true }));
      }

      modalOpened = true;
    }

    if (tile.action === 'TEAM_CHALLENGE') {
       showSystemPopup({
         title: 'Desafio em Equipe!',
         message: 'Todos os jogadores participam. Unam suas forças para avançar!',
         type: 'info'
       });
       // Futura implementação: abrir modal específico de desafio em equipe
    }

    if (tile.action === 'MOVE_2') {
       const ringIndices = getRingIndices(tile.ring);
       const relPos = ringIndices.indexOf(player.position);
       const newRelPos = MovePlayerUseCase.execute(relPos, 2, ringIndices.length);
       player.position = ringIndices[newRelPos];
    } else if (tile.action === 'BACK_2') {
       const ringIndices = getRingIndices(tile.ring);
       const relPos = ringIndices.indexOf(player.position);
       const newRelPos = MovePlayerUseCase.execute(relPos, -2, ringIndices.length);
       player.position = ringIndices[newRelPos];
    } else if (tile.action === 'SWAP_PLACE') {
       const otherIndex = (currentPlayerIndex + 1) % allPlayers.length;
       const tempPos = player.position;
       player.position = allPlayers[otherIndex].position;
       allPlayers[otherIndex].position = tempPos;
    } else if (tile.action === 'MOVE_INNER') {
       const innerTiles = activeBoardConfig.tiles.filter(t => t.ring === 'inner');
       if (innerTiles.length > 0) {
         const target = innerTiles[Math.floor(Math.random() * innerTiles.length)];
         player.position = activeBoardConfig.tiles.findIndex(t => t.id === target.id);
       }
    } else if (tile.action === 'MOVE_OUTER') {
       const outerTiles = activeBoardConfig.tiles.filter(t => t.ring === 'outer');
       if (outerTiles.length > 0) {
         const target = outerTiles[Math.floor(Math.random() * outerTiles.length)];
         player.position = activeBoardConfig.tiles.findIndex(t => t.id === target.id);
       }
    } else if (tile.action === 'SKIP_TURN') {
       player.skipNextTurn = true;
       showSystemPopup({
         title: 'Pausa Reflexiva',
         message: `${player.name} vai pular a próxima vez para meditar.`,
         type: 'warning'
       });
    } else if (tile.action === 'SHARE_CARD') {
       showSystemPopup({
         title: 'Compartilhamento',
         message: 'Mecânica de Compartilhar Carta: Escolha uma carta para mostrar aos outros!',
         type: 'info'
       });
       // Por enquanto, apenas abre uma carta aleatória como simulação
       setFocusedCard({ 
         type: 'reflexao', 
         index: 0, 
         id: `card-share-${Date.now()}`,
         fromTileAction: true 
       });
       modalOpened = true;
    } else if (tile.action === 'CREATE_CARD') {
       showSystemPopup({
         title: 'Criatividade!',
         message: 'Mecânica Criar Carta: Use sua criatividade para inspirar os outros.',
         type: 'info'
       });
       setCurrentScreen('card_creation');
       modalOpened = true;
    } else if (tile.action === 'WRITE_DIARY') {
       showSystemPopup({
         title: 'Diário',
         message: 'Mecânica Diário: Registre seus pensamentos e reflexões.',
         type: 'info'
       });
       setShowDiary(true);
       modalOpened = true;
    }
    
    setPlayers([...allPlayers]);
    return modalOpened;
  };

  const closeModal = () => {
    setShowModal(null);
    // Após fechar o modal da casa, passa o turno
    passTurn();
  };

  const closeFocusedCard = useCallback(() => {
    const wasFromTile = focusedCard?.fromTileAction;
    const shouldDrawAnother = focusedCard?.nextDraw;
    
    setFocusedCard(null);

    if (shouldDrawAnother) {
      // Pequeno atraso para o fechamento da animação antes de abrir a próxima
      setTimeout(() => {
        setFocusedCard({
          type: 'desafio', // Segunda carta é sempre desafio por padrão ou aleatória
          index: Math.floor(Math.random() * 5),
          id: `card-extra-${Date.now()}`,
          fromTileAction: true,
          nextDraw: false
        });
      }, 300);
      return;
    }

    if (wasFromTile) {
      passTurn();
    }
  }, [focusedCard, passTurn]);

  return (
    <GameContext.Provider value={{ 
      players, 
      currentPlayerIndex, 
      rollDice, 
      isMoving, 
      lastDiceRoll,
      showModal,
      setShowModal,
      isBoardFullScreen,
      toggleFullScreen,
      currentScreen,
      startGame,
      focusedCard,
      setFocusedCard,
      boardRotation,
      setBoardRotation,
      confirmedMobileWarning,
      setConfirmedMobileWarning,
      settings,
      setSettings,
      initializeGame,
      finishCardCreation,
      rotateBoard,
      goToMenu,
      playerAttributes,
      setPlayerAttributes,
      diaryEntries,
      addDiaryEntry: (text, type, mood) => {
        firestoreAddDiary(text, type, mood);
      },
      removeDiaryEntry: (id) => {
        firestoreRemoveDiary(id);
      },
      updateDiaryEntry: (id, newData) => {
        firestoreUpdateDiary(id, newData);
      },
      setCurrentScreen,
      showDiary,
      setShowDiary,

      goToCustomCards: () => setCurrentScreen('custom_cards'),
      
      createObserverRooms: async (count, batchName) => {
        try {
          const result = await syncRepository.createRoomBatch(
            count,
            activeBoardConfig.toJSON(),
            activeCardSet.toJSON(),
            batchName
          );
          return result;
        } catch (error) {
          console.error("Erro ao criar batch de salas:", error);
          showSystemPopup({
            title: "Erro na Criação",
            message: "Não foi possível criar as salas simultâneas.",
            type: "error"
          });
          return null;
        }
      },

      recordCardDraw: useCallback(async (card) => {
        const cardEntry = {
          id: card.id || Date.now(),
          cardId: card.id,
          cardType: card.type,
          cardText: card.text,
          playerName: playersRef.current[myPlayerIndexRef.current]?.name || 'Jogador',
          timestamp: Date.now()
        };

        if (isOnline && roomId) {
          await syncRepository.recordCardAction(roomId, {
            cardId: card.id,
            cardType: card.type,
            cardText: card.text
          });
        } else {
          setCardHistory(prev => [cardEntry, ...prev]);
        }
      }, [isOnline, roomId]),

      showCardHistory,
      setShowCardHistory,
      cardHistory,

      roomId,
      isOnline,
      roomStatus,
      roomParticipants,
      readyPlayers,
      myPlayerIndex,
      ownerId,
      hostRole,
      createOnlineGame,
      joinOnlineGame,
      startOnlineGame,
      startPlayingGame,
      closeModal,
      closeFocusedCard,
      isRolling,
      activeCardSet,
      availableCardSets,
      changeActiveCardSet,
      saveNewCardSet,
      updateCardSet,
      deleteCardSet,
      resetToDefault,

      activeBoardConfig,
      availableBoardConfigs,
      changeActiveBoardConfig,
      saveNewBoardConfig,
      updateBoardConfig,
      deleteBoardConfig,
      importCardSet,
      importBoardConfig,
      systemPopup,
      showSystemPopup,
      closeSystemPopup,
      showLeaveConfirm,
      setShowLeaveConfirm,
      handleGoToMenu,
      confirmGoToMenu
    }}>

      {children}
    </GameContext.Provider>
  );
};


