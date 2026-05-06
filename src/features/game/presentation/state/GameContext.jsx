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
import { BoardConfig } from '../../domain/entities/BoardConfig';



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
  const [followActivePlayer, setFollowActivePlayer] = useState(false);
  const [confirmedMobileWarning, setConfirmedMobileWarning] = useState(false);
  const [settings, setSettings] = useState({
    sound: true,
    vibration: true
  });
  const [isRolling, setIsRolling] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [showDiary, setShowDiary] = useState(false);
  const [isDiaryRequired, setIsDiaryRequired] = useState(false);
  const [isDiaryAction, setIsDiaryAction] = useState(false);
  const [cardHistory, setCardHistory] = useState([]);
  const [showCardHistory, setShowCardHistory] = useState(false);
  const [drawnCards, setDrawnCards] = useState({}); // { category: [index1, index2, ...] }

  
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
  const [activeVerification, setActiveVerification] = useState(null);
  const [playerSelectionTask, setPlayerSelectionTask] = useState(null);
  const [cardSelectionTask, setCardSelectionTask] = useState(null);

  // Efeito para sincronizar participantes no modo offline
  useEffect(() => {
    if (!isOnline) {
      const participants = {};
      players.forEach(p => {
        participants[p.id] = { 
          id: p.id, 
          name: p.name, 
          color: p.color,
          isObserver: false 
        };
      });
      requestAnimationFrame(() => {
        setRoomParticipants(participants);
      });
    }
  }, [isOnline, players]);



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
    setActiveCardSet,
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
    showSystemPopup,
    setDrawnCards
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

  const drawCard = useCallback((type) => {
    const cardList = activeCardSet?.content?.[type] || [];
    if (cardList.length === 0) return { content: "Nenhuma carta disponível.", index: 0 };

    const usedIndices = drawnCards[type] || [];
    
    // Filtra índices não usados e não denunciados
    const availableIndices = cardList
      .map((card, i) => ({ card, i }))
      .filter(({ card, i }) => {
        if (usedIndices.includes(i)) return false;
        
        // Verifica se está denunciada (seja objeto ou string)
        if (typeof card === 'object' && card !== null) {
          return !card.isReported;
        }
        return true; // Strings simples não estão denunciadas (se estivessem, seriam objetos)
      })
      .map(({ i }) => i);

    let selectedIndex;
    let newUsedIndices = [...usedIndices];

    if (availableIndices.length === 0) {
      // Reinicia a contagem (reshuffle) filtrando denunciadas
      const allNonReported = cardList
        .map((card, i) => ({ card, i }))
        .filter(({ card }) => {
          if (typeof card === 'object' && card !== null) {
            return !card.isReported;
          }
          return true;
        })
        .map(({ i }) => i);

      if (allNonReported.length === 0) return { content: "Nenhuma carta disponível.", index: 0 };
      
      selectedIndex = allNonReported[Math.floor(Math.random() * allNonReported.length)];
      newUsedIndices = [selectedIndex];
    } else {
      // Sorteia um dos disponíveis
      selectedIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      newUsedIndices.push(selectedIndex);
    }

    setDrawnCards(prev => ({ ...prev, [type]: newUsedIndices }));
    const isCustom = activeCardSet?.id !== 'default';
    const rawCard = cardList[selectedIndex];
    const cardText = typeof rawCard === 'object' ? (rawCard.text || rawCard.content) : rawCard;
    
    return { 
      content: rawCard, 
      index: selectedIndex, 
      isCustom: isCustom,
      cardType: type,
      cardText: cardText,
      playerName: players[currentPlayerIndex]?.name || 'Jogador'
    };
  }, [activeCardSet, drawnCards, players, currentPlayerIndex]);


  // 4. Hooks de Lógica Complexa (Ordem de Dependência)
  const isTurnBeingPassedRef = useRef(false);
  const myPlayerIndexRef = useRef(myPlayerIndex);
  useEffect(() => { myPlayerIndexRef.current = myPlayerIndex; }, [myPlayerIndex]);

  const currentPlayerIndexRef = useRef(currentPlayerIndex);
  useEffect(() => { currentPlayerIndexRef.current = currentPlayerIndex; }, [currentPlayerIndex]);

  // Ref compartilhada de isMoving: usada pelo useGameSync antes de useGameActions ser inicializado.
  // useGameActions vai atualizar isMovingRef.current diretamente durante o movimento.
  // NUNCA remova esta ref - useGameSync depende dela para nao sobrescrever posicoes durante animacao.
  const isMovingRefForSync = useRef(false);

  // Forward declaration of passTurn (will be defined below)
  const passTurnRef = useRef();

  // Ref para evitar gravações duplicadas de cartas em sequência rápida (Anti-Loop)
  const lastRecordedCardRef = useRef({ id: null, timestamp: 0 });

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
    showLeaveConfirm, setShowLeaveConfirm,
    passTurn: (overrides) => passTurnRef.current?.(overrides),
    activeVerification,
    setActiveVerification
  });

  useGameSync({
    isOnline, roomId, user, syncRepository, setPlayers,
    setCurrentPlayerIndex, setLastDiceRoll, setIsRolling,
    setPlayerAttributes, setTurnStartTime, setTurnDuration,
    setActiveBoardConfig, setActiveCardSet, setRoomStatus, setRoomParticipants,
    setReadyPlayers, setOwnerId, setCurrentScreen, currentScreen,
    setCardHistory, activeBoardConfig, setAtelierContext,
    setActiveVerification,
    joinOnlineGame,
    isMovingRef: isMovingRefForSync,
    turnDuration, setCurrentTurn,
    isTurnBeingPassedRef
  });

  useGameTimer({
    isOnline, user, syncRepository, setPlayers,
    currentPlayerIndex, myPlayerIndex, ownerId,
    roomParticipants, currentScreen, isMoving, showModal, roomStatus,
    currentTurn,
    passTurn: useCallback((overrides) => passTurnRef.current?.(overrides), []),

    serverTimeOffset, setServerTimeOffset,
    turnStartTime, setTurnStartTime,
    turnDuration, setTurnDuration
  });

  const openDiary = useCallback((required = false) => {
    setShowDiary(true);
    setIsDiaryRequired(required);
    setIsDiaryAction(required);
  }, []);

  const closeDiary = useCallback(() => {
    setShowDiary(false);
    // Se era uma ação de diário, passa o turno após fechar
    if (isDiaryAction) {
      setIsDiaryAction(false);
      setIsDiaryRequired(false);
      if (passTurnRef.current) passTurnRef.current();
    }
  }, [isDiaryAction]);

  const {
    rollDice,
    jumpToTile,
    closeModal,
    closeFocusedCard,
    isMovingRef,
    playersRef

  } = useGameActions({
    isOnline, roomId, user, syncRepository, activeBoardConfig,
    players, setPlayers, currentPlayerIndex, myPlayerIndex,
    isMoving, setIsMoving, isRolling, setIsRolling,
    setLastDiceRoll, setShowModal, setFocusedCard, showSystemPopup,
    setCurrentScreen, currentScreen, setShowDiary, setAtelierContext, 
    setPlayerSelectionTask, setCardSelectionTask,
    openDiary, closeDiary, setIsDiaryRequired,
    passTurn: (overrides) => passTurnRef.current?.(overrides), 
    setRoomStatus, setActiveVerification,
    getRingIndices,
    generateDiceRoll, 
    focusedCard,
    drawCard
  });

  // Mantém isMovingRefForSync sincronizada com isMovingRef real
  useEffect(() => {
    if (isMovingRef) isMovingRefForSync.current = isMovingRef.current;
  }, [isMovingRef]);

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
      syncRepository.startTurn(roomId, nextIndex, turnTime, currentTurn).then(() => {
        setTimeout(() => { isTurnBeingPassedRef.current = false; }, 1000);
      }).catch(() => {
        isTurnBeingPassedRef.current = false;
      });
    } else {
      setTurnStartTime(Date.now());
      setTurnDuration(turnTime);
      setTimeout(() => { isTurnBeingPassedRef.current = false; }, 500);
    }
  }, [currentPlayerIndex, players, isOnline, roomId, activeBoardConfig, roomParticipants, currentTurn, setTurnStartTime, setTurnDuration, setCurrentTurn, setPlayers, setCurrentPlayerIndex, showSystemPopup, setCurrentScreen]);

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
    const initialPositions = activeBoardConfig.mechanics?.randomStart 
      ? BoardConfig.getRandomOuterPositions(activeBoardConfig.tiles, newPlayers.length)
      : (activeBoardConfig.mechanics?.initialPositions || [0, 0, 0, 0]);
    const shouldShowAtelier = !!activeBoardConfig.mechanics?.enableCardCreationStep;
    
    const preparedPlayers = newPlayers.map((p, i) => new Player(p.id || i + 1, p.name, p.color, initialPositions[i] || 0, turnTime));
    setPlayers(preparedPlayers);

    // Popula participantes para o modo offline para suportar verificação social
    const offlineParticipants = preparedPlayers.reduce((acc, p) => {
      acc[p.id] = { id: p.id, name: p.name, color: p.color, isOnline: true };
      return acc;
    }, {});
    setRoomParticipants(offlineParticipants);

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
    setFollowActivePlayer(prev => !prev);
  }, []);

  // Auto-rotate board to follow active player if enabled
  useEffect(() => {
    if (followActivePlayer && players[currentPlayerIndex]) {
      const tile = activeBoardConfig.tiles[players[currentPlayerIndex].position];
      if (tile) {
        // Smoothly rotate to bring the player's tile to the top (-angle)
        // Use requestAnimationFrame to avoid synchronous cascading renders lint error
        requestAnimationFrame(() => {
          setBoardRotation(-tile.angle);
        });
      }
    }
  }, [followActivePlayer, currentPlayerIndex, players, activeBoardConfig]);

  return (
    <GameContext.Provider value={{
      players,
      currentPlayerIndex,
      rollDice,
      jumpToTile,
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
      followActivePlayer,
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
      openDiary,
      closeDiary,
      isDiaryRequired,
      setIsDiaryRequired,
      isDiaryAction,
      setIsDiaryAction,

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
        if (!card) return;

        // Anti-Loop/Debounce: Evita gravar a mesma carta múltiplas vezes em menos de 1s
        const now = Date.now();
        if (lastRecordedCardRef.current.id === card.id && (now - lastRecordedCardRef.current.timestamp < 1000)) {
          return;
        }
        lastRecordedCardRef.current = { id: card.id, timestamp: now };

        const myIdx = myPlayerIndexRef.current;
        const currentIdx = currentPlayerIndexRef.current;
        
        // Busca o nome do jogador local de forma robusta
        const myPlayer = playersRef.current[myIdx];
        const playerName = myPlayer?.name || user?.displayName || 'Jogador';
        
        const cardEntry = {
          id: card.id || Date.now(),
          cardId: card.id,
          cardType: card.type,
          cardText: card.text,
          isCustom: !!card.isCustom,
          playerName,
          timestamp: now
        };

        if (isOnline && roomId) {
          // PROTEÇÃO CRÍTICA (Anti-DoS): Apenas o jogador dono do turno registra a ação.
          if (currentIdx === myIdx) {
            try {
              await syncRepository.recordCardAction(roomId, {
                cardId: card.id,
                cardType: card.type,
                cardText: card.text,
                isCustom: !!card.isCustom,
                playerName
              });
            } catch (err) {
              console.error("[GameContext] Erro ao gravar ação de carta:", err);
            }
          }
        } else {
          setCardHistory(prev => [cardEntry, ...prev]);
        }
      }, [isOnline, roomId, user?.displayName, syncRepository, setCardHistory]),

      showCardHistory,
      setShowCardHistory,
      cardHistory,

      syncRepository,
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
      closeDetailPopup,
      playerSelectionTask,
      setPlayerSelectionTask,
      cardSelectionTask,
      setCardSelectionTask,
      activeVerification,
      setActiveVerification
    }}>



      {children}
    </GameContext.Provider>
  );
};


