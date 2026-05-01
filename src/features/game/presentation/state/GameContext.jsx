import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { boardData } from '../../data/repositories/boardRepository';
import { Player } from '../../domain/entities/Player';
import { FirebaseGameSyncRepository } from '../../data/repositories/FirebaseGameSyncRepository.js';

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

  const [gameTime, setGameTime] = useState(60); // Segundos restantes

  const toggleFullScreen = () => setIsBoardFullScreen(prev => !prev);
  
  const startGame = () => {
    setCurrentScreen('game');
  };

  const initializeGame = (newPlayers) => {
    setPlayers(newPlayers.map((p, i) => new Player(p.id || i + 1, p.name, p.color, 0)));
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
    const initialPlayers = newPlayers.map((p, i) => new Player(p.id || i + 1, p.name, p.color, 0));
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
        if (newState.players) setPlayers(newState.players.map(p => new Player(p.id, p.name, p.color, p.position)));
        if (newState.currentPlayerIndex !== undefined) setCurrentPlayerIndex(newState.currentPlayerIndex);
        if (newState.lastDiceRoll !== undefined) setLastDiceRoll(newState.lastDiceRoll);
        if (newState.boardRotation !== undefined) setBoardRotation(newState.boardRotation);
        if (newState.playerAttributes) setPlayerAttributes(newState.playerAttributes);
        setTimeout(() => setIsSyncing(false), 100);
      });
      return () => unsubscribe();
    }
  }, [isOnline, roomId]);


  const rollDice = () => {
    if (isMoving) return;
    const roll = Math.floor(Math.random() * 6) + 1;
    setLastDiceRoll(roll);
    movePlayer(roll);
    if (isOnline) {
      syncStateToFirebase({ lastDiceRoll: roll });
    }
  };


  const movePlayer = async (steps) => {
    setIsMoving(true);
    let newPlayers = [...players];
    let player = { ...newPlayers[currentPlayerIndex] };
    
    // Simulate step by step movement for animation
    for (let i = 0; i < steps; i++) {
      player.position = Math.min(player.position + 1, boardData.length - 1);
      newPlayers[currentPlayerIndex] = player;
      setPlayers([...newPlayers]);
      await new Promise(r => setTimeout(r, 300));
      
      if (player.position === boardData.length - 1) break;
    }

    // Handle tile action
    const currentTile = boardData[player.position];
    handleTileAction(currentTile, player, newPlayers);

    setIsMoving(false);
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextIndex);

    if (isOnline) {
      syncStateToFirebase({ players: newPlayers, currentPlayerIndex: nextIndex });
    }
  };


  const handleTileAction = (tile, player, allPlayers) => {
    if (tile.type === 'reflexao' || tile.type === 'desafio') {
      setShowModal({ type: tile.type, tile });
    }

    if (tile.action === 'MOVE_2') {
       player.position = Math.min(player.position + 2, boardData.length - 1);
    } else if (tile.action === 'BACK_2') {
       player.position = Math.max(player.position - 2, 0);
    } else if (tile.action === 'SWAP_PLACE') {
       // Logic for swapping with random other player
       const otherIndex = (currentPlayerIndex + 1) % allPlayers.length;
       const tempPos = player.position;
       player.position = allPlayers[otherIndex].position;
       allPlayers[otherIndex].position = tempPos;
    }
    
    setPlayers([...allPlayers]);
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
      gameTime,
      setGameTime,
      setCurrentScreen,
      goToCustomCards: () => setCurrentScreen('custom_cards'),
      roomId,
      isOnline,
      createOnlineGame,
      joinOnlineGame
    }}>

      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
