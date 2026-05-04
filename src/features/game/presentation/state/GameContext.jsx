import { useState, useEffect, useCallback, useRef } from 'react';
import { GameContext } from './useGame';
import { Player } from '../../domain/entities/Player';
import { FirebaseGameSyncRepository } from '../../data/repositories/FirebaseGameSyncRepository.js';
import { PassTurnUseCase } from '../../domain/usecases/PassTurnUseCase';
import { useAuth } from '../../../auth/presentation/state/useAuth';
import { useUser } from '../../../user/presentation/state/useUser';
import { useGameSync } from '../hooks/useGameSync';
import { useGameAssets } from '../hooks/useGameAssets';
import { useGameRooms } from '../hooks/useGameRooms';
import { useGameTimer } from '../hooks/useGameTimer';
import { useGameActions } from '../hooks/useGameActions';
import { useBrowserHistorySync } from '../hooks/useBrowserHistorySync';


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
  const [showModal, setShowModal] = useState(null);
  const [isBoardFullScreen, setIsBoardFullScreen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [focusedCard, setFocusedCard] = useState(null);
  const [boardRotation, setBoardRotation] = useState(0);
  const [confirmedMobileWarning, setConfirmedMobileWarning] = useState(false);
  const [settings, setSettings] = useState({
    sound: true,
    vibration: true
  });
  const [isRolling, setIsRolling] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [showDiary, setShowDiary] = useState(false);
  const [cardHistory, setCardHistory] = useState([]);
  const [showCardHistory, setShowCardHistory] = useState(false);
  
  const [playerAttributes, setPlayerAttributes] = useState({
    1: { memory: 20, reflection: 40, challenge: 10 },
    2: { memory: 30, reflection: 15, challenge: 50 }
  });

  const [atelierContext, setAtelierContext] = useState(null);
  const [detailPopup, setDetailPopup] = useState(null);
  const [turnStartTime, setTurnStartTime] = useState(null);
  const [turnDuration, setTurnDuration] = useState(120);

  const [roomId, setRoomId] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [roomStatus, setRoomStatus] = useState('waiting');
  const [myPlayerIndex, setMyPlayerIndex] = useState(-1);
  const [roomParticipants, setRoomParticipants] = useState({});
  const [readyPlayers, setReadyPlayers] = useState({});
  const [ownerId, setOwnerId] = useState(null);
  const [hostRole, setHostRole] = useState(null);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // 2. Hooks de Dados Base e Assets
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

  const {
    availableCardSets,
    activeCardSet,
    availableBoardConfigs,
    activeBoardConfig,
    setActiveBoardConfig,
    changeActiveCardSet,
    saveNewCardSet,
    updateCardSet,
    deleteCardSet,
    resetToDefault,
    changeActiveBoardConfig,
    saveNewBoardConfig,
    updateBoardConfig,
    deleteBoardConfig,
    importCardSet,
    importBoardConfig
  } = useGameAssets({
    user,
    cloudCardSets,
    syncCardSetsToCloud,
    cloudBoardConfigs,
    syncBoardConfigsToCloud,
    showSystemPopup
  });

  // 3. Funções Auxiliares (que dependem de assets)
  const getRingIndices = useCallback((ring) => {
    const getLevel = (r) => {
      if (r === 'outer' || r === 'special') return 1;
      if (r === 'middle') return 2;
      if (r === 'inner') return 3;
      return 0;
    };
    const targetLevel = getLevel(ring);
    return activeBoardConfig?.tiles
      .map((t, idx) => getLevel(t.ring) === targetLevel ? idx : -1)
      .filter(idx => idx !== -1) || [];
  }, [activeBoardConfig]);

  const showDetailPopup = useCallback((config) => {
    setDetailPopup(config);
  }, []);

  const closeDetailPopup = useCallback(() => {
    setDetailPopup(null);
  }, []);

  // 4. Hooks de Lógica Complexa (Ordem de Dependência)
  const {
    createOnlineGame,
    joinOnlineGame,
    startOnlineGame,
    startPlayingGame,
    goToMenu,
    finishCardCreation,
    handleGoToMenu,
    confirmGoToMenu
  } = useGameRooms({
    user,
    syncRepository,
    showSystemPopup,
    activeBoardConfig,
    activeCardSet,
    setPlayers,
    setCurrentPlayerIndex,
    setPlayerAttributes,
    setTurnStartTime,
    setTurnDuration,
    setActiveBoardConfig,
    setAtelierContext,
    setCurrentScreen,
    currentScreen,
    players,
    atelierContext,
    roomId, setRoomId,
    isOnline, setIsOnline,
    roomStatus, setRoomStatus,
    myPlayerIndex, setMyPlayerIndex,
    roomParticipants, setRoomParticipants,
    readyPlayers, setReadyPlayers,
    ownerId, setOwnerId,
    hostRole, setHostRole,
    showLeaveConfirm, setShowLeaveConfirm
  });

  const myPlayerIndexRef = useRef(myPlayerIndex);
  useEffect(() => { myPlayerIndexRef.current = myPlayerIndex; }, [myPlayerIndex]);

  // Forward declaration of passTurn (will be defined below)
  const passTurnRef = useRef();

  useGameTimer({
    isOnline, user, syncRepository, setPlayers,
    currentPlayerIndex, myPlayerIndex, ownerId,
    roomParticipants, currentScreen, isMoving, showModal,
    passTurn: useCallback((overrides) => passTurnRef.current?.(overrides), []),
    serverTimeOffset, setServerTimeOffset,
    turnStartTime, setTurnStartTime,
    turnDuration, setTurnDuration
  });

  const {
    rollDice,
    closeModal,
    closeFocusedCard,
    isMovingRef,
    playersRef
  } = useGameActions({
    isOnline, roomId, user, syncRepository, activeBoardConfig,
    players, setPlayers, currentPlayerIndex, myPlayerIndex,
    isMoving, setIsMoving, isRolling, setIsRolling,
    setLastDiceRoll, setShowModal, setFocusedCard, showSystemPopup,
    setCurrentScreen, setShowDiary, passTurn: (overrides) => passTurnRef.current?.(overrides), 
    getRingIndices,
    generateDiceRoll, focusedCard
  });

  const { isTurnBeingPassedRef } = useGameSync({
    isOnline, roomId, user, syncRepository, setPlayers,
    setCurrentPlayerIndex, setLastDiceRoll, setIsRolling,
    setPlayerAttributes, setTurnStartTime, setTurnDuration,
    setActiveBoardConfig, setRoomStatus, setRoomParticipants,
    setReadyPlayers, setOwnerId, setCurrentScreen, currentScreen,
    setCardHistory, activeBoardConfig, setAtelierContext,
    joinOnlineGame, isMovingRef, turnDuration, setCurrentTurn
  });

  const passTurn = useCallback((overrides = {}) => {
    if (isTurnBeingPassedRef.current) return;
    isTurnBeingPassedRef.current = true;

    const turnTime = activeBoardConfig.mechanics?.turnTime || 120;
    const basePlayers = overrides.players || players;
    const { nextIndex, updatedPlayers } = PassTurnUseCase.execute({
      players: basePlayers,
      currentPlayerIndex,
      roomParticipants,
      turnTime
    });

    setPlayers(updatedPlayers);
    setCurrentPlayerIndex(nextIndex);
    
    const newTurn = currentTurn + 1;
    setCurrentTurn(newTurn);

    const maxTurns = activeBoardConfig.mechanics?.maxTurns || 0;
    if (maxTurns > 0 && newTurn > maxTurns) {
      if (isOnline && roomId) {
        syncRepository.updateRoomStatus(roomId, 'finished');
      } else {
        showSystemPopup({
          title: 'Fim de Jogo!',
          message: `O limite de ${maxTurns} turnos foi atingido. A jornada chegou ao fim!`,
          type: 'success',
          onConfirm: () => setCurrentScreen('evaluation')
        });
      }
      return;
    }

    if (isOnline && roomId) {
      syncRepository.startTurn(roomId, nextIndex, turnTime, newTurn).catch(() => {
        isTurnBeingPassedRef.current = false;
      });
    } else {
      setTurnStartTime(Date.now());
      setTurnDuration(turnTime);
      queueMicrotask(() => { isTurnBeingPassedRef.current = false; });
    }
  }, [currentPlayerIndex, players, isOnline, roomId, activeBoardConfig, roomParticipants, isTurnBeingPassedRef, setTurnStartTime, setTurnDuration]);

  // Update ref for passTurn
  useEffect(() => { passTurnRef.current = passTurn; }, [passTurn]);

  // Sincronização com o Histórico do Navegador
  useBrowserHistorySync({
    currentScreen, setCurrentScreen,
    showModal, setShowModal,
    focusedCard, setFocusedCard,
    showCardHistory, setShowCardHistory,
    showDiary, setShowDiary,
    showLeaveConfirm, setShowLeaveConfirm
  });

  const toggleFullScreen = () => setIsBoardFullScreen(prev => !prev);

  const startGame = () => {
    if (!isOnline) {
      const turnTime = activeBoardConfig.mechanics?.turnTime || 120;
      setTurnStartTime(Date.now());
      setTurnDuration(turnTime);
    }
    setCurrentScreen('game');
  };

  const initializeGame = (newPlayers) => {
    const turnTime = activeBoardConfig.mechanics?.turnTime || 120;
    const initialPositions = activeBoardConfig.mechanics?.initialPositions || [0, 0, 0, 0];
    const shouldShowAtelier = !!activeBoardConfig.mechanics?.enableCardCreationStep;
    setPlayers(newPlayers.map((p, i) => new Player(p.id || i + 1, p.name, p.color, initialPositions[i] || 0, turnTime)));
    setCurrentPlayerIndex(0);
    setCurrentTurn(1);
    setTurnStartTime(Date.now());
    setTurnDuration(turnTime);
    if (shouldShowAtelier) {
      setAtelierContext('game_start');
      setCurrentScreen('card_creation');
    } else {
      setAtelierContext(null);
      setCurrentScreen('game');
    }
  };

  const openCardAtelier = () => {
    setAtelierContext('settings');
    setCurrentScreen('card_creation');
  };

  const rotateBoard = useCallback(() => {
    setBoardRotation(prev => (prev + 90) % 360);
  }, []);

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
      openCardAtelier,
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
      confirmGoToMenu,
      detailPopup,
      showDetailPopup,
      closeDetailPopup
    }}>

      {children}
    </GameContext.Provider>
  );
};


