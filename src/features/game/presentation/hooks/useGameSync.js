import { useEffect, useRef } from 'react';
import { Player } from '../../domain/entities/Player';
import { BoardConfig } from '../../domain/entities/BoardConfig';

export const useGameSync = ({
  isOnline,
  roomId,
  user,
  syncRepository,
  setPlayers,
  setCurrentPlayerIndex,
  setLastDiceRoll,
  setIsRolling,
  setPlayerAttributes,
  setTurnStartTime,
  setTurnDuration,
  setActiveBoardConfig,
  setRoomStatus,
  setRoomParticipants,
  setReadyPlayers,
  setOwnerId,
  setCurrentScreen,
  currentScreen,
  setCardHistory,
  activeBoardConfig,
  setAtelierContext,
  joinOnlineGame,
  isMovingRef,
  turnDuration,
  setCurrentTurn
}) => {
  const isTurnBeingPassedRef = useRef(false);

  // EFEITO 1: Listener de gameState (estado dinamico do jogo)
  useEffect(() => {
    if (!isOnline || !roomId) return;

    const unsubscribe = syncRepository.listenToGameState(roomId, (newState) => {
      if (newState.players) {
        if (!isMovingRef.current) {
          setPlayers(newState.players.map(p => new Player(p.id, p.name, p.color, p.position, p.timeLeft, p.lastRoll)));
        }
      }
      if (newState.currentPlayerIndex !== undefined) setCurrentPlayerIndex(newState.currentPlayerIndex);
      if (newState.currentTurn !== undefined) setCurrentTurn(newState.currentTurn);
      if (newState.lastDiceRoll !== undefined) setLastDiceRoll(newState.lastDiceRoll);
      if (newState.isRolling !== undefined) setIsRolling(newState.isRolling);
      if (newState.playerAttributes) setPlayerAttributes(newState.playerAttributes);
      if (newState.turnStartTime !== undefined && newState.turnStartTime !== null) {
        const maxAgeMs = ((newState.turnDuration || turnDuration || 120) + 30) * 1000;
        const isStale = newState.turnStartTime > 0 && (Date.now() - newState.turnStartTime) > maxAgeMs;
        if (!isStale) {
          setTurnStartTime(newState.turnStartTime);
        } else {
          console.warn("[Timer] turnStartTime recebido esta desatualizado. Ignorando.");
          setTurnStartTime(null);
        }
        isTurnBeingPassedRef.current = false;
      }
      if (newState.turnDuration !== undefined) setTurnDuration(newState.turnDuration);
      if (newState.boardConfig) {
        setActiveBoardConfig(BoardConfig.fromJSON(newState.boardConfig));
      }
    });

    return () => unsubscribe();
  }, [isOnline, roomId, turnDuration, syncRepository, isMovingRef, setPlayers, setCurrentPlayerIndex, setLastDiceRoll, setIsRolling, setPlayerAttributes, setTurnStartTime, setTurnDuration, setActiveBoardConfig]);

  // EFEITO 2: Listener granular de metadados da sala
  useEffect(() => {
    if (!isOnline || !roomId) return;

    const unsubscribeRoomMeta = syncRepository.listenToRoomMeta(roomId, (room) => {
      if (!room) return;

      setRoomStatus(room.status || 'waiting');

      const rawParticipants = room.participants || {};
      const normalizedParticipants = {};
      Object.values(rawParticipants).forEach(val => {
        if (typeof val === 'string') {
          normalizedParticipants[val] = { id: val, name: 'Convidado', photoURL: null };
        } else if (val && typeof val === 'object' && val.id) {
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
        const mechanics = room.metadata?.mechanics || activeBoardConfig?.mechanics || {};
        if (mechanics.enableCardCreationStep === true) {
          setAtelierContext('game_start');
          setCurrentScreen('card_creation');
        } else {
          setCurrentScreen('game');
        }
      }
    });

    return () => unsubscribeRoomMeta();
  }, [isOnline, roomId, currentScreen, activeBoardConfig, syncRepository, setRoomStatus, setRoomParticipants, setReadyPlayers, setOwnerId, setCurrentScreen, setAtelierContext]);

  // EFEITO 3: Presenca
  useEffect(() => {
    if (!isOnline || !roomId || !user?.id) return;
    const unsubscribePresence = syncRepository.updatePlayerPresence(roomId, user.id);
    return () => {
      if (typeof unsubscribePresence === 'function') unsubscribePresence();
    };
  }, [isOnline, roomId, user?.id, syncRepository]);

  // EFEITO 4: Historico de cartas
  useEffect(() => {
    if (!isOnline || !roomId) return;
    const unsubscribeHistory = syncRepository.listenToRoomHistory(roomId, (history) => {
      if (history && history.cards) {
        const sortedCards = Object.values(history.cards).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setCardHistory(sortedCards);
      }
    });
    return () => unsubscribeHistory();
  }, [isOnline, roomId, syncRepository, setCardHistory]);

  // Persistência da sala online (Reconexão no F5)
  useEffect(() => {
    if (roomId) {
      syncRepository.saveActiveRoomId(roomId);
    }
  }, [roomId, syncRepository]);

  useEffect(() => {
    const savedRoomId = syncRepository.getActiveRoomId();
    if (savedRoomId && user && !roomId && !isOnline) {
      console.log('Tentando reconectar à sala salva:', savedRoomId);
      joinOnlineGame(savedRoomId);
    }
  }, [user, roomId, isOnline, joinOnlineGame, syncRepository]);

  return { isTurnBeingPassedRef };
};
