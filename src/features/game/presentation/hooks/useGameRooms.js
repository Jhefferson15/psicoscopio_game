import { useEffect, useCallback } from 'react';
import { Player } from '../../domain/entities/Player';
import { BoardConfig } from '../../domain/entities/BoardConfig';

export const useGameRooms = ({
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
  passTurn,
  activeVerification,
  setActiveVerification,
  setFocusedCard,
  sharingRecipientId,
  setSharingRecipientId
}) => {


  const createOnlineGame = async (newPlayers) => {
    const turnTime = activeBoardConfig.mechanics?.turnTime || 120;
    const initialPositions = activeBoardConfig.mechanics?.randomStart 
      ? BoardConfig.getRandomOuterPositions(activeBoardConfig.tiles, newPlayers.length)
      : (activeBoardConfig.mechanics?.initialPositions || [0, 0, 0, 0, 0, 0]);
    const initialPlayers = newPlayers.map((p, i) => new Player(p.id || i + 1, p.name, p.color, initialPositions[i] || 0, turnTime));
    const gameState = {
      players: initialPlayers,
      currentPlayerIndex: 0,
      lastDiceRoll: 0,
      boardConfig: activeBoardConfig.toJSON(),
      playerAttributes: initialPlayers.reduce((acc, p, i) => {
        acc[i + 1] = { memory: 20, reflection: 20, challenge: 20 };
        return acc;
      }, {})
    };

    try {
      const id = await syncRepository.createRoom(gameState, user?.id, user?.name);
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
      const role = room.metadata?.hostRole || 'player';
      setHostRole(role);
      setRoomParticipants(room.participants || {});

      if (room.gameState) {
        const playersArray = room.gameState.players || [];
        setPlayers(playersArray.map(p => new Player(p.id, p.name, p.color, p.position, p.timeLeft, p.lastRoll, p.skipNextTurn)));

        setCurrentPlayerIndex(room.gameState.currentPlayerIndex);
        setPlayerAttributes(room.gameState.playerAttributes);

        if (room.gameState.turnStartTime) setTurnStartTime(room.gameState.turnStartTime);
        if (room.gameState.turnDuration) setTurnDuration(room.gameState.turnDuration);
        if (room.gameState.boardConfig) {
          setActiveBoardConfig(BoardConfig.fromJSON(room.gameState.boardConfig));
        }
      }

      if (room.status === 'playing') {
        setCurrentScreen('game');
      } else if (room.status === 'setup_cards' || room.status === 'card_creation') {
        const board = room.gameState?.boardConfig || activeBoardConfig;
        const mechanics = board.mechanics || {};
        if (mechanics.enableCardCreationStep === true || room.status === 'card_creation') {
          setAtelierContext(room.status === 'setup_cards' ? 'game_start' : 'missing_cards');
          setCurrentScreen('card_creation');
        } else {
          setCurrentScreen('game');
        }
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
      if (syncRepository.getActiveRoomId() === id) {
        syncRepository.clearActiveRoomId();
      }
    }
  }, [user, showSystemPopup, activeBoardConfig, syncRepository, setPlayers, setCurrentPlayerIndex, setPlayerAttributes, setTurnStartTime, setTurnDuration, setActiveBoardConfig, setAtelierContext, setCurrentScreen, setRoomId, setIsOnline, setRoomStatus, setOwnerId, setHostRole, setRoomParticipants]);

  const startOnlineGame = async () => {
    const isObserverRoom = hostRole === 'observer';
    if (ownerId !== user?.id && !isObserverRoom) return;
    
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
      const colors = ['#D84B42', '#4885CE', '#7B4BB1', '#F59E0B', '#10B981', '#6366F1'];
      const turnTime = activeBoardConfig.mechanics?.turnTime || 120;
      const initialPositions = activeBoardConfig.mechanics?.randomStart 
        ? BoardConfig.getRandomOuterPositions(activeBoardConfig.tiles, participantsArray.length)
        : (activeBoardConfig.mechanics?.initialPositions || [0, 0, 0, 0, 0, 0]);
      
      const initialPlayers = participantsArray.map((p, i) => ({
        id: p.id,
        name: p.name,
        color: colors[i % colors.length],
        position: initialPositions[i] || 0,
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
        status: 'setup_cards' 
      };

      // Sincroniza o tabuleiro atual com o Firestore antes de começar para todos
      await syncRepository.updateRoomConfig(roomId, {
        boardConfig: activeBoardConfig.toJSON(),
        cardSet: activeCardSet.toJSON()
      });

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
  }, [hostRole, ownerId, user?.id, roomId, syncRepository]);

  const createObserverRooms = async (count, batchName) => {
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
    setAtelierContext(null);
    setCurrentScreen('menu');
  }, [isOnline, roomId, user, syncRepository, setAtelierContext, setCurrentScreen, setRoomId, setIsOnline]);

  const finishCardCreation = async (createdCard = null) => {
    // Caso especial: Compartilhamento de carta (Online ou Offline)
    if (atelierContext === 'share_card') {
      const recipientId = sharingRecipientId;
      setAtelierContext(null);
      setSharingRecipientId(null);
      
      if (!createdCard) {
        // Cancelamento: Volta para o popup de seleção
        setCurrentScreen('game');
        // Reabre o seletor após um pequeno delay para a transição de tela
        setTimeout(() => {
          // Precisamos disparar a ação de SHARE_CARD novamente ou reabrir o seletor.
          // Como não temos acesso direto ao trigger original aqui, 
          // confiamos que o jogo está no estado 'game' e podemos sinalizar o retorno.
          // O ideal é limpar o estado de criação e deixar o seletor aparecer se o cardSelectionTask ainda existir
          // ou se o sistema souber que deve voltar para lá.
          // Por enquanto, apenas voltamos para o jogo.
        }, 100);
        return;
      }

      // Sucesso: Envia a carta e inicia verificação
      setCurrentScreen('game');
      
      const verificationData = {
        ...createdCard,
        id: `shared-created-${Date.now()}`,
        fromTileAction: true,
        recipientId: recipientId
      };

      setFocusedCard(verificationData);
      return;
    }

    if (isOnline) {
      try {
        await syncRepository.setUserReady(roomId, user.id);
        setAtelierContext(null);
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
      if (atelierContext === 'settings') {
        setAtelierContext(null);
        setCurrentScreen('menu');
        return;
      }
      
      const turnTime = activeBoardConfig.mechanics?.turnTime || 120;
      setTurnStartTime(Date.now());
      setTurnDuration(turnTime);
      setAtelierContext(null);
      setCurrentScreen('game');
    }
  };

  const handleGoToMenu = () => {
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

  // EFEITOS de Sala
  useEffect(() => {
    if (isOnline && user && players && players.length > 0) {
      const index = players.findIndex(p => p.id === user.id);
      if (index !== -1 && index !== myPlayerIndex) {
        // Envolve o setState em um microtask para evitar cascading renders síncronos
        queueMicrotask(() => {
          setMyPlayerIndex(index);
        });
      }
    }
  }, [isOnline, user, players, myPlayerIndex, setMyPlayerIndex]);

  useEffect(() => {
    if (isOnline && roomStatus === 'finished' && currentScreen !== 'menu' && currentScreen !== 'evaluation') {
      const timer = setTimeout(() => {
        showSystemPopup({
          title: 'Partida Encerrada',
          message: 'A partida foi finalizada. Gostaríamos de ouvir sua opinião sobre a experiência.',
          buttonText: 'Avaliar Partida',
          onConfirm: () => setCurrentScreen('evaluation')
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [roomStatus, isOnline, currentScreen, showSystemPopup, setCurrentScreen]);

  useEffect(() => {
    if (!isOnline || !roomId || (roomStatus !== 'setup_cards' && roomStatus !== 'card_creation') || hostRole !== 'observer') return;
    const participantsArray = Object.keys(roomParticipants);
    const readyIds = Object.keys(readyPlayers);
    const activeReadyCount = participantsArray.filter(id => readyIds.includes(id)).length;
    if (participantsArray.length >= 2 && activeReadyCount >= participantsArray.length) {
      const sortedIds = [...participantsArray].sort();
      if (user?.id === sortedIds[0]) {
        startPlayingGame();
      }
    }
  }, [isOnline, roomId, roomStatus, hostRole, roomParticipants, readyPlayers, user?.id, startPlayingGame]);
  
  // Monitoramento de conclusão da verificação social (ONLINE)
  useEffect(() => {
    if (!isOnline || roomStatus !== 'verifying_action' || !activeVerification || !roomId) return;
    
    const responses = activeVerification.responses || {};
    
    // Todos os jogadores (não observadores) devem responder, incluindo quem está na vez
    const requiredVoters = Object.values(roomParticipants).filter(p => !p.isObserver);
    const participantsIds = requiredVoters.map(p => p.id.toString());
    const responsesIds = Object.keys(responses);
    
    // Todos responderam?
    if (participantsIds.length > 0 && responsesIds.length >= participantsIds.length) {
      // Somente o jogador da vez finaliza (pois ele tem permissão de UPDATE_STATUS)
      if (user?.id === activeVerification.playerId) {
        const finalize = async () => {
          try {
             // 1. Salva no Firestore
             await syncRepository.saveActionEvaluation({
                roomId,
                playerId: activeVerification.playerId,
                cardType: activeVerification.cardType,
                cardText: activeVerification.cardText,
                responses: activeVerification.responses,
                timestamp: Date.now()
             });
             
             // 2. Limpa verificação e volta status para playing
             await Promise.all([
                syncRepository.updateRoomStatus(roomId, 'playing'),
                syncRepository.updateGameState(roomId, { activeVerification: null })
             ]);

             
             // 3. Passa o turno
             passTurn();
          } catch(e) { 
            console.error("Erro ao finalizar verificação:", e); 
          }
        };
        
        const timer = setTimeout(finalize, 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [isOnline, roomStatus, activeVerification, roomParticipants, roomId, user?.id, passTurn, syncRepository]);

  // Monitoramento de conclusão da verificação social (OFFLINE)
  useEffect(() => {
    if (isOnline || roomStatus !== 'verifying_action' || !activeVerification) return;
    
    const responses = activeVerification.responses || {};
    
    // Todos os jogadores (não observadores) devem responder, incluindo quem está na vez
    const requiredVoters = Object.values(roomParticipants).filter(p => !p.isObserver);
    const participantsIds = requiredVoters.map(p => p.id.toString());
    const responsesIds = Object.keys(responses);
    
    // Todos responderam?
    if (participantsIds.length > 0 && responsesIds.length >= participantsIds.length) {
      const finalizeOffline = () => {
        try {
          // Limpa verificação e volta status para playing
          setRoomStatus('playing');
          setActiveVerification(null);
          
          // Passa o turno
          passTurn();
        } catch(e) {
          console.error("Erro ao finalizar verificação offline:", e);
        }
      };
      
      const timer = setTimeout(finalizeOffline, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, roomStatus, activeVerification, roomParticipants, passTurn, setRoomStatus, setActiveVerification]);



  return {
    roomId, setRoomId,
    isOnline, setIsOnline,
    roomStatus, setRoomStatus,
    myPlayerIndex, setMyPlayerIndex,
    roomParticipants, setRoomParticipants,
    readyPlayers, setReadyPlayers,
    ownerId, setOwnerId,
    hostRole, setHostRole,
    showLeaveConfirm, setShowLeaveConfirm,
    createOnlineGame,
    joinOnlineGame,
    startOnlineGame,
    startPlayingGame,
    createObserverRooms,
    goToMenu,
    finishCardCreation,
    handleGoToMenu,
    confirmGoToMenu
  };
};
