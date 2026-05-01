import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { boardData } from '../../data/repositories/boardRepository';
import { Player } from '../../domain/entities/Player';
import { FirebaseGameSyncRepository } from '../../data/repositories/FirebaseGameSyncRepository.js';
import { MovePlayerUseCase } from '../../domain/usecases/MovePlayerUseCase';

const syncRepository = new FirebaseGameSyncRepository();


const GameContext = createContext();

export const GameProvider = ({ children }) => {
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
  const [focusedCard, setFocusedCard] = useState(null); // { type, index, id }
  const [boardRotation, setBoardRotation] = useState(0);
  const [confirmedMobileWarning, setConfirmedMobileWarning] = useState(false);
  const [settings, setSettings] = useState({
    sound: true,
    vibration: true
  });
  const [isRolling, setIsRolling] = useState(false);

  // Estado Online
  const [roomId, setRoomId] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);


  // Novos estados para Grandes Implementações
  const [playerAttributes, setPlayerAttributes] = useState({
    1: { memory: 20, reflection: 40, challenge: 10 },
    2: { memory: 30, reflection: 15, challenge: 50 }
  });

  const [diaryEntries, setDiaryEntries] = useState([
    { id: 1, type: 'reflexao', text: 'Iniciei a jornada com foco em autoconhecimento.', timestamp: new Date().toLocaleTimeString() }
  ]);

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

  const finishCardCreation = () => {
    setCurrentScreen('game');
  };

  const goToMenu = () => {
    setRoomId(null);
    setIsOnline(false);
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
      const id = await syncRepository.createRoom(gameState);
      setRoomId(id);
      setIsOnline(true);
      setPlayers(initialPlayers);
      setCurrentPlayerIndex(0);
      setCurrentScreen('card_creation');
      return id;
    } catch (error) {
      console.error("Erro ao criar sala:", error);
      alert("Erro ao criar sala online");
    }
  };

  const joinOnlineGame = async (id) => {
    try {
      const room = await syncRepository.joinRoom(id);
      setRoomId(id);
      setIsOnline(true);
      setPlayers(room.gameState.players);
      setCurrentPlayerIndex(room.gameState.currentPlayerIndex);
      setPlayerAttributes(room.gameState.playerAttributes);
      setCurrentScreen('game');
    } catch (error) {
      console.error("Erro ao entrar na sala:", error);
      alert("Sala não encontrada");
    }
  };

  const syncStateToFirebase = useCallback(async (overrides = {}) => {
    if (!isOnline || !roomId || isSyncing) return;
    
    const gameState = {
      players: overrides.players || players,
      currentPlayerIndex: overrides.currentPlayerIndex !== undefined ? overrides.currentPlayerIndex : currentPlayerIndex,
      lastDiceRoll: overrides.lastDiceRoll || lastDiceRoll,
      boardRotation: boardRotation,
      playerAttributes: playerAttributes
    };

    try {
      await syncRepository.updateGameState(roomId, gameState);
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
    }
  }, [isOnline, roomId, players, currentPlayerIndex, lastDiceRoll, boardRotation, playerAttributes, isSyncing]);

  useEffect(() => {
    if (isOnline && roomId) {
      const unsubscribe = syncRepository.listenToGameState(roomId, (newState) => {
        setIsSyncing(true);
        if (newState.players) setPlayers(newState.players.map(p => new Player(p.id, p.name, p.color, p.position, p.timeLeft)));
        if (newState.currentPlayerIndex !== undefined) setCurrentPlayerIndex(newState.currentPlayerIndex);
        if (newState.lastDiceRoll !== undefined) setLastDiceRoll(newState.lastDiceRoll);
        if (newState.boardRotation !== undefined) setBoardRotation(newState.boardRotation);
        if (newState.playerAttributes) setPlayerAttributes(newState.playerAttributes);
        setTimeout(() => setIsSyncing(false), 100);
      });
      return () => unsubscribe();
    }
  }, [isOnline, roomId]);

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
    
    setIsRolling(true);
    setIsMoving(true);
    setLastDiceRoll(0);
    
    // Simula tempo de "rolagem" do dado (animação do botão/shaker)
    await new Promise(r => setTimeout(r, 1500));
    
    const roll = Math.floor(Math.random() * 6) + 1;
    setLastDiceRoll(roll);
    setIsRolling(false); // Agora o resultado deve aparecer na UI
    
    if (isOnline) {
      syncStateToFirebase({ lastDiceRoll: roll });
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
    
    // Movimento passo a passo para animação
    for (let i = 0; i < steps; i++) {
      player.position = MovePlayerUseCase.execute(player.position, 1, boardData.length);
      newPlayers[currentPlayerIndex] = player;
      setPlayers([...newPlayers]);
      
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
      setShowModal({ type: tile.type, tile });
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
      setCurrentScreen,
      goToCustomCards: () => setCurrentScreen('custom_cards'),
      roomId,
      isOnline,
      createOnlineGame,
      joinOnlineGame,
      closeModal,
      isRolling
    }}>

      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
