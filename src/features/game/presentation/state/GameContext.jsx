import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../../../../config/firebase';
import { GameContext } from './useGame';
import { boardData } from '../../data/repositories/boardRepository';
import { Player } from '../../domain/entities/Player';
import { FirebaseGameSyncRepository } from '../../data/repositories/FirebaseGameSyncRepository.js';
import { MovePlayerUseCase } from '../../domain/usecases/MovePlayerUseCase';
import { CardSetRepository } from '../../data/repositories/CardSetRepository';
import { CardSet } from '../../domain/entities/CardSet';
import { DiaryEntry } from '../../domain/entities/DiaryEntry';
import { useAuth } from '../../../auth/presentation/state/useAuth';
import { useUser } from '../../../user/presentation/state/UserContext';


const syncRepository = new FirebaseGameSyncRepository();

const generateDiceRoll = () => Math.floor(Math.random() * 6) + 1;

export const GameProvider = ({ children }) => {
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

  // Estado Online
  const [roomId, setRoomId] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [roomStatus, setRoomStatus] = useState('waiting'); // 'waiting' | 'playing'
  const [myPlayerIndex, setMyPlayerIndex] = useState(-1);
  const [roomParticipants, setRoomParticipants] = useState([]);
  const [readyPlayers, setReadyPlayers] = useState({});
  const [ownerId, setOwnerId] = useState(null);


  // Novos estados para Grandes Implementações
  const [playerAttributes, setPlayerAttributes] = useState({
    1: { memory: 20, reflection: 40, challenge: 10 },
    2: { memory: 30, reflection: 15, challenge: 50 }
  });

  const { diary: firestoreDiary, addDiaryEntry: firestoreAddDiary } = useUser();
  const [diaryEntries, setDiaryEntries] = useState([]);

  useEffect(() => {
    if (firestoreDiary) {
      setDiaryEntries(firestoreDiary.map(e => DiaryEntry.fromJSON(e)));
    }
  }, [firestoreDiary]);


  // O tempo agora é gerenciado dentro de cada objeto Player (timeLeft)

  const toggleFullScreen = () => setIsBoardFullScreen(prev => !prev);
  
  const startGame = () => {
    setCurrentScreen('game');
  };

  const initializeGame = (newPlayers) => {
    setPlayers(newPlayers.map((p, i) => new Player(p.id || i + 1, p.name, p.color, 0, 120)));
    setCurrentPlayerIndex(0);
    setCurrentScreen('card_creation');
  };

  const finishCardCreation = async () => {
    if (isOnline) {
      try {
        const readyRef = ref(database, `rooms/${roomId}/readyPlayers/${user.id}`);
        await set(readyRef, true);
        setCurrentScreen('waiting_players');
      } catch (error) {
        console.error("Erro ao marcar como pronto:", error);
      }
    } else {
      setCurrentScreen('game');
    }
  };

  const goToMenu = () => {
    setRoomId(null);
    setIsOnline(false);
    localStorage.removeItem('psicoscopio_online_room');
    setCurrentScreen('menu');
  };

  // Funções Online
  const createOnlineGame = async (newPlayers) => {
    const initialPlayers = newPlayers.map((p, i) => new Player(p.id || i + 1, p.name, p.color, 0, 120));
    const gameState = {
      players: initialPlayers,
      currentPlayerIndex: 0,
      lastDiceRoll: 0,
      boardRotation: 0,
      playerAttributes: {
        1: { memory: 20, reflection: 40, challenge: 10 },
        2: { memory: 30, reflection: 15, challenge: 50 }
      }
    };

    try {
      const id = await syncRepository.createRoom(gameState, user?.id);
      if (user) {
        // Atualiza nome do anfitrião
        await set(ref(database, `rooms/${id}/participants/${user.id}`), {
          id: user.id,
          name: user.name || 'Anfitrião',
          photoURL: user.photoURL || null
        });
      }
      setRoomId(id);
      setIsOnline(true);
      setPlayers(initialPlayers);
      setCurrentPlayerIndex(0);
      setCurrentScreen('lobby');
      return id;
    } catch (error) {
      console.error("Erro ao criar sala:", error);
      alert(`Erro ao criar sala online: ${error.message}`);
    }
  };

  const joinOnlineGame = async (id) => {
    try {
      const room = await syncRepository.joinRoom(id, user);
      setRoomId(id);
      setIsOnline(true);
      setRoomStatus(room.status);
      setOwnerId(room.ownerId);
      setRoomParticipants(room.participants || {});
      
      if (room.gameState) {
        setPlayers(room.gameState.players.map(p => new Player(p.id, p.name, p.color, p.position, p.timeLeft, p.lastRoll)));
        setCurrentPlayerIndex(room.gameState.currentPlayerIndex);
        setPlayerAttributes(room.gameState.playerAttributes);
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
      alert(`Erro ao entrar na sala: ${error.message}`);
      // Se falhou ao reconectar a uma sala salva, limpa o cache para não travar
      if (localStorage.getItem('psicoscopio_online_room') === id) {
        localStorage.removeItem('psicoscopio_online_room');
      }
    }
  };

  // Persistência da sala online (Reconexão no F5)
  useEffect(() => {
    if (roomId) {
      localStorage.setItem('psicoscopio_online_room', roomId);
    }
  }, [roomId]);

  useEffect(() => {
    const savedRoomId = localStorage.getItem('psicoscopio_online_room');
    // Só tenta reconectar se o usuário já estiver logado, se não estiver numa sala e não for online
    if (savedRoomId && user && !roomId && !isOnline) {
      console.log('Tentando reconectar à sala salva:', savedRoomId);
      joinOnlineGame(savedRoomId);
    }
  }, [user, roomId, isOnline]);

  const startOnlineGame = async () => {
    if (ownerId !== user?.id) return;
    
    // Dupla verificação para impedir que o jogo inicie sem participantes
    const participantsArray = Object.values(roomParticipants);
    if (participantsArray.length < 2) {
      alert("A sala precisa ter pelo menos 2 jogadores para iniciar.");
      return;
    }

    try {
      // Inicializa a lista de jogadores baseada nos participantes reais
      const colors = ['#D84B42', '#4885CE', '#7B4BB1', '#F59E0B', '#10B981', '#6366F1'];
      
      const initialPlayers = participantsArray.map((p, i) => ({
        id: p.id,
        name: p.name,
        color: colors[i % colors.length],
        position: 0,
        timeLeft: 120,
        lastRoll: null
      }));

      const gameStateRef = ref(database, `rooms/${roomId}/gameState`);
      await set(gameStateRef, {
        players: initialPlayers,
        currentPlayerIndex: 0,
        lastDiceRoll: 0,
        boardRotation: 0,
        playerAttributes: initialPlayers.reduce((acc, p) => {
          acc[p.id] = { memory: 20, reflection: 20, challenge: 20 };
          return acc;
        }, {})
      });

      const statusRef = ref(database, `rooms/${roomId}/status`);
      await set(statusRef, 'setup_cards');
    } catch (error) {
      console.error("Erro ao iniciar jogo:", error);
    }
  };

  const startPlayingGame = async () => {
    if (ownerId !== user?.id) return;
    try {
      const statusRef = ref(database, `rooms/${roomId}/status`);
      await set(statusRef, 'playing');
    } catch (error) {
      console.error("Erro ao iniciar jogo:", error);
    }
  };

  const syncStateToFirebase = useCallback(async (overrides = {}) => {
    if (!isOnline || !roomId || isSyncing || players.length === 0) return;
    
    const gameState = {
      players: overrides.players || players,
      currentPlayerIndex: overrides.currentPlayerIndex !== undefined ? overrides.currentPlayerIndex : currentPlayerIndex,
      lastDiceRoll: overrides.lastDiceRoll !== undefined ? overrides.lastDiceRoll : lastDiceRoll,
      isRolling: overrides.isRolling !== undefined ? overrides.isRolling : isRolling,
      boardRotation: boardRotation,
      playerAttributes: playerAttributes
    };

    try {
      await syncRepository.updateGameState(roomId, gameState);
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
    }
  }, [isOnline, roomId, players, currentPlayerIndex, lastDiceRoll, isRolling, boardRotation, playerAttributes, isSyncing]);

  useEffect(() => {
    if (isOnline && roomId) {
      const unsubscribe = syncRepository.listenToGameState(roomId, (newState) => {
        setIsSyncing(true);
        if (newState.players) setPlayers(newState.players.map(p => new Player(p.id, p.name, p.color, p.position, p.timeLeft, p.lastRoll)));
        if (newState.currentPlayerIndex !== undefined) setCurrentPlayerIndex(newState.currentPlayerIndex);
        if (newState.lastDiceRoll !== undefined) setLastDiceRoll(newState.lastDiceRoll);
        if (newState.isRolling !== undefined) setIsRolling(newState.isRolling);
        if (newState.boardRotation !== undefined) setBoardRotation(newState.boardRotation);
        if (newState.playerAttributes) setPlayerAttributes(newState.playerAttributes);
        
        setTimeout(() => setIsSyncing(false), 500);
      });

      // Listener para o status e participantes da sala
      const roomRef = ref(database, `rooms/${roomId}`);
      const unsubscribeRoom = onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
          const room = snapshot.val();
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

          // Determina meu índice de jogador usando os dados normalizados
          if (user && normalizedParticipants) {
            const index = Object.keys(normalizedParticipants).indexOf(user.id);
            setMyPlayerIndex(index);
          }
        }
      });

      return () => {
        unsubscribe();
        unsubscribeRoom();
      };
    }
  }, [isOnline, roomId, user, currentScreen]);


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
    if (activeCardSet.id === id) {
      setActiveCardSet(CardSetRepository.getDefaultSet());
    }
  };

  const resetToDefault = () => {
    changeActiveCardSet('default');
  };

  const passTurn = useCallback((overrides = {}) => {
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    
    setPlayers(prev => prev.map((p, i) => {
      if (i === nextIndex) return { ...p, timeLeft: 120 }; // Reseta tempo do próximo
      return p;
    }));
    
    setCurrentPlayerIndex(nextIndex);
    
    if (isOnline) {
      syncStateToFirebase({ 
        players: players.map((p, i) => i === nextIndex ? { ...p, timeLeft: 120 } : p), 
        currentPlayerIndex: nextIndex,
        ...overrides 
      });
    }
  }, [currentPlayerIndex, players, isOnline, syncStateToFirebase]);

  // Timer individual por turno
  useEffect(() => {
    if (currentScreen !== 'game' || isMoving || showModal) return;

    const interval = setInterval(() => {
      setPlayers(prev => {
        const newPlayers = [...prev];
        const currentPlayer = { ...newPlayers[currentPlayerIndex] };
        
        if (currentPlayer.timeLeft > 0) {
          currentPlayer.timeLeft -= 1;
          newPlayers[currentPlayerIndex] = currentPlayer;
          return newPlayers;
        } else {
          // O tempo acabou!
          clearInterval(interval);
          passTurn();
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentScreen, isMoving, currentPlayerIndex, showModal, passTurn]);


  const rollDice = async () => {
    if (isMoving || isRolling) return;
    if (isOnline && currentPlayerIndex !== myPlayerIndex) return; // Trava de segurança backend
    
    setIsRolling(true);
    setIsMoving(true);
    setLastDiceRoll(0);
    
    if (isOnline) {
      syncStateToFirebase({ isRolling: true, lastDiceRoll: 0 });
    }
    
    // Simula tempo de "rolagem" do dado (animação do botão/shaker)
    await new Promise(r => setTimeout(r, 1500));
    
    const roll = generateDiceRoll();
    setLastDiceRoll(roll);
    setIsRolling(false); // Agora o resultado deve aparecer na UI
    
    // Atualiza o lastRoll do jogador atual
    const updatedPlayers = players.map((p, i) => i === currentPlayerIndex ? { ...p, lastRoll: roll } : p);
    setPlayers(updatedPlayers);
    
    if (isOnline) {
      syncStateToFirebase({ 
        lastDiceRoll: roll, 
        isRolling: false,
        players: updatedPlayers
      });
    }

    // O número está na tela. Esperamos o tempo solicitado pelo usuário
    await new Promise(r => setTimeout(r, 1200));
    
    // Agora iniciamos o movimento
    await movePlayer(roll);
  };


  const movePlayer = async (steps) => {
    // isMoving já foi definido como true em rollDice
    let newPlayers = [...players];
    let player = { ...newPlayers[currentPlayerIndex] };
    
    // Movimento passo a passo para animação global
    for (let i = 0; i < steps; i++) {
      player.position = MovePlayerUseCase.execute(player.position, 1, boardData.length);
      newPlayers[currentPlayerIndex] = player;
      setPlayers([...newPlayers]);
      
      // Sincroniza cada passo imediatamente com o Firebase para que os outros vejam a animação
      if (isOnline && roomId) {
        syncRepository.updateGameState(roomId, { players: newPlayers }).catch(e => console.error("Erro sync passo", e));
      }
      
      // Atraso entre passos (ajustado para 400ms para ser mais visível)
      await new Promise(r => setTimeout(r, 400));
    }

    // Chegou no destino. Pequena pausa antes de mostrar a ação ou popup
    await new Promise(r => setTimeout(r, 600));

    // Handle tile action
    const currentTile = boardData[player.position];
    const hasModal = handleTileAction(currentTile, player, newPlayers);

    setIsMoving(false);

    // Se não abriu modal, passa o turno imediatamente
    if (!hasModal) {
      passTurn({ players: newPlayers });
    }
  };


  const handleTileAction = (tile, player, allPlayers) => {
    let modalOpened = false;
    
    if (tile.type === 'reflexao' || tile.type === 'desafio') {
      const typeMap = { 'reflexao': 3, 'desafio': 2, 'memoria': 0, 'experiencia': 1 };
      setFocusedCard({ 
        type: tile.type, 
        index: typeMap[tile.type] || 0, 
        id: `card-${tile.type}-${typeMap[tile.type] || 0}`,
        fromTileAction: true 
      });
      modalOpened = true;
    }

    if (tile.action === 'MOVE_2') {
       player.position = MovePlayerUseCase.execute(player.position, 2, boardData.length);
    } else if (tile.action === 'BACK_2') {
       player.position = MovePlayerUseCase.execute(player.position, -2, boardData.length);
    } else if (tile.action === 'SWAP_PLACE') {
       const otherIndex = (currentPlayerIndex + 1) % allPlayers.length;
       const tempPos = player.position;
       player.position = allPlayers[otherIndex].position;
       allPlayers[otherIndex].position = tempPos;
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
    setFocusedCard(null);
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
      rotateBoard: () => setBoardRotation(prev => prev + 90),
      goToMenu,
      playerAttributes,
      setPlayerAttributes,
      diaryEntries,
      setDiaryEntries,
      addDiaryEntry: (text, type, mood) => {
        firestoreAddDiary(text, type, mood);
      },
      removeDiaryEntry: (id) => {
        setDiaryEntries(prev => prev.filter(e => e.id !== id));
      },
      updateDiaryEntry: (id, text) => {
        setDiaryEntries(prev => prev.map(e => e.id === id ? { ...e, text } : e));
      },
      setCurrentScreen,

      goToCustomCards: () => setCurrentScreen('custom_cards'),
      roomId,
      isOnline,
      roomStatus,
      roomParticipants,
      readyPlayers,
      myPlayerIndex,
      ownerId,
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
      resetToDefault
    }}>

      {children}
    </GameContext.Provider>
  );
};


