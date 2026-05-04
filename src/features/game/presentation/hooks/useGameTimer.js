import { useEffect, useRef } from 'react';

export const useGameTimer = ({
  isOnline,
  user,
  syncRepository,
  setPlayers,
  currentPlayerIndex,
  myPlayerIndex,
  ownerId,
  roomParticipants,
  currentScreen,
  isMoving,
  showModal,
  passTurn,
  serverTimeOffset, setServerTimeOffset,
  turnStartTime, setTurnStartTime,
  turnDuration, setTurnDuration
}) => {
  const serverTimeOffsetRef = useRef(0);

  const passTurnRef = useRef(null);
  const myPlayerIndexRef = useRef(myPlayerIndex);

  useEffect(() => { passTurnRef.current = passTurn; }, [passTurn]);
  useEffect(() => { myPlayerIndexRef.current = myPlayerIndex; }, [myPlayerIndex]);

  // Sincroniza offset de tempo com o servidor
  useEffect(() => {
    return syncRepository.getServerTimeOffset((offset) => {
      serverTimeOffsetRef.current = offset;
      setServerTimeOffset(prev => Math.abs(prev - offset) > 500 ? offset : prev);
    });
  }, [syncRepository]);

  useEffect(() => {
    if (currentScreen !== 'game' || isMoving || showModal) return;
    if (!turnStartTime) return;

    const interval = setInterval(() => {
      setPlayers(prev => {
        const now = Date.now() + serverTimeOffset;
        const elapsed = Math.floor((now - turnStartTime) / 1000);
        const remaining = Math.max(0, turnDuration - elapsed);

        const newPlayers = [...prev];
        const currentPlayer = { ...newPlayers[currentPlayerIndex] };

        if (currentPlayer.timeLeft !== remaining) {
          currentPlayer.timeLeft = remaining;
          newPlayers[currentPlayerIndex] = currentPlayer;

          if (remaining <= 0) {
            clearInterval(interval);
            const isMyTurn = currentPlayerIndex === myPlayerIndexRef.current;
            const isHost = user?.id === ownerId;
            const currentParticipant = roomParticipants[currentPlayer.id];
            const isCurrentPlayerOnline = currentParticipant ? currentParticipant.isOnline : true;

            if (!isOnline || isMyTurn || isHost || !isCurrentPlayerOnline) {
              console.log("[Timer] Tempo esgotado! Tentando passar turno...");
              passTurnRef.current();
            }
          }
          return newPlayers;
        }
        return prev;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [currentScreen, isMoving, currentPlayerIndex, showModal, isOnline, turnStartTime, turnDuration, serverTimeOffset, ownerId, user?.id, roomParticipants, setPlayers]);

  return {
    serverTimeOffset,
    setServerTimeOffset,
    turnStartTime,
    setTurnStartTime,
    turnDuration,
    setTurnDuration
  };
};
