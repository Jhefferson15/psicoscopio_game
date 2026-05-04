import { useCallback, useRef, useEffect } from 'react';
import { MovePlayerUseCase } from '../../domain/usecases/MovePlayerUseCase';
import { ProcessTileActionUseCase } from '../../domain/usecases/ProcessTileActionUseCase';

export const useGameActions = ({
  isOnline,
  roomId,
  user,
  syncRepository,
  activeBoardConfig,
  players,
  setPlayers,
  currentPlayerIndex,
  myPlayerIndex,
  isMoving,
  setIsMoving,
  isRolling,
  setIsRolling,
  setLastDiceRoll,
  setShowModal,
  setFocusedCard,
  showSystemPopup,
  setCurrentScreen,
  setShowDiary,
  passTurn,
  getRingIndices,
  generateDiceRoll,
  focusedCard
}) => {
  const isMovingRef = useRef(isMoving);
  const playersRef = useRef(players);

  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { isMovingRef.current = isMoving; }, [isMoving]);

  const handleTileAction = (tile, player, allPlayers, recursionDepth = 0) => {
    if (recursionDepth > 5) return false;
    
    const result = ProcessTileActionUseCase.execute(
      tile, 
      player, 
      allPlayers, 
      activeBoardConfig, 
      getRingIndices, 
      MovePlayerUseCase,
      currentPlayerIndex
    );

    result.uiActions.forEach(action => {
      if (action.type === 'SET_FOCUSED_CARD') setFocusedCard(action.payload);
      if (action.type === 'POPUP') showSystemPopup(action.payload);
    });

    if (result.newScreen) setCurrentScreen(result.newScreen);
    if (result.showDiary) setShowDiary(result.showDiary);

    let modalOpened = result.modalOpened;
    let positionChanged = result.positionChanged;

    if (positionChanged) {
      const nextTile = activeBoardConfig.tiles[player.position];
      const nextModalOpened = handleTileAction(nextTile, player, allPlayers, recursionDepth + 1);
      modalOpened = modalOpened || nextModalOpened;
    }

    setPlayers([...allPlayers]);
    return modalOpened;
  };

  const movePlayer = async (steps, startingPlayers) => {
    let newPlayers = startingPlayers ? [...startingPlayers] : [...players];
    let player = { ...newPlayers[currentPlayerIndex] };

    const initialTile = activeBoardConfig.tiles[player.position];
    const ringIndices = getRingIndices(initialTile.ring);
    let relativePos = ringIndices.indexOf(player.position);

    if (relativePos === -1) {
      setIsMoving(false);
      passTurn();
      return;
    }

    for (let i = 0; i < steps; i++) {
      relativePos = (relativePos + 1) % ringIndices.length;
      player.position = ringIndices[relativePos];
      newPlayers[currentPlayerIndex] = { ...player };
      setPlayers([...newPlayers]);
      await new Promise(r => setTimeout(r, 400));
    }

    if (isOnline && roomId) {
      await syncRepository.updateGameState(roomId, {
        players: newPlayers,
        lastActionBy: user?.id || null
      }).catch(e => console.error("Erro sync final", e));
    }

    await new Promise(r => setTimeout(r, 600));

    const currentTile = activeBoardConfig.tiles[player.position];
    const hasModal = handleTileAction(currentTile, player, newPlayers);

    setIsMoving(false);

    if (!hasModal) {
      passTurn({ players: newPlayers });
    }
  };

  const rollDice = async () => {
    if (isMoving || isRolling) return;
    if (isOnline && currentPlayerIndex !== myPlayerIndex) return;

    setIsRolling(true);
    setIsMoving(true);
    setLastDiceRoll(0);

    await new Promise(r => setTimeout(r, 1500));

    const { diceMin = 1, diceMax = 6 } = activeBoardConfig.mechanics || {};
    const roll = generateDiceRoll(diceMin, diceMax);
    setLastDiceRoll(roll);
    setIsRolling(false);

    const updatedPlayers = players.map((p, i) => i === currentPlayerIndex ? { ...p, lastRoll: roll } : p);
    setPlayers(updatedPlayers);

    if (isOnline) {
      syncRepository.updateGameState(roomId, {
        isRolling: false,
        lastDiceRoll: roll,
        lastActionBy: user?.id || null
      }).catch(e => console.error("Erro sync dado", e));
    }

    await new Promise(r => setTimeout(r, 1200));
    await movePlayer(roll, updatedPlayers);
  };

  const closeModal = () => {
    setShowModal(null);
    passTurn();
  };

  const closeFocusedCard = useCallback(() => {
    const wasFromTile = focusedCard?.fromTileAction;
    const shouldDrawAnother = focusedCard?.nextDraw;

    setFocusedCard(null);

    if (shouldDrawAnother) {
      setTimeout(() => {
        setFocusedCard({
          type: 'desafio',
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
  }, [focusedCard, passTurn, setFocusedCard]);

  return {
    rollDice,
    movePlayer,
    handleTileAction,
    closeModal,
    closeFocusedCard,
    isMovingRef,
    playersRef
  };
};
