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
  roomStatus,
  currentTurn,
  passTurn,
  serverTimeOffset, setServerTimeOffset,
  turnStartTime, setTurnStartTime,
  turnDuration, setTurnDuration
}) => {
  const serverTimeOffsetRef = useRef(0);
  const lastProcessedTurnRef = useRef(-1); // Rastreia o último turno processado por este timer

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
  }, [syncRepository, setServerTimeOffset]);

  useEffect(() => {
    if (currentScreen !== 'game' || isMoving || showModal || roomStatus === 'verifying_action') return;
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
            // Se já processamos este turno, não faz nada
            if (lastProcessedTurnRef.current === currentTurn) {
              return newPlayers;
            }

            clearInterval(interval);
            lastProcessedTurnRef.current = currentTurn;

            const isMyTurn = currentPlayerIndex === myPlayerIndexRef.current;
            const isHost = user?.id === ownerId;
            const currentParticipant = roomParticipants[currentPlayer.id];
            const isCurrentPlayerOnline = currentParticipant ? currentParticipant.isOnline : true;

            const shouldPass = !isOnline || isMyTurn || (isHost && !isCurrentPlayerOnline);

            if (shouldPass) {
              console.log(`[Timer] Turno ${currentTurn} esgotado! (Sou Host: ${isHost}, Jogador Online: ${isCurrentPlayerOnline}). Passando...`);
              passTurnRef.current();
            }
          }
          return newPlayers;
        }
        return prev;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [currentScreen, isMoving, currentPlayerIndex, showModal, isOnline, turnStartTime, turnDuration, serverTimeOffset, ownerId, user?.id, roomParticipants, setPlayers, currentTurn, roomStatus]);

  return {
    serverTimeOffset,
    setServerTimeOffset,
    turnStartTime,
    setTurnStartTime,
    turnDuration,
    setTurnDuration
  };
};
