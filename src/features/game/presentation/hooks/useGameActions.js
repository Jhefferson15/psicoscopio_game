import { useCallback, useRef, useEffect } from 'react';
import { MovePlayerUseCase } from '../../domain/usecases/MovePlayerUseCase';
import { ProcessTileActionUseCase } from '../../domain/usecases/ProcessTileActionUseCase';
import { customCardRepository } from '../../data/repositories/LocalStorageCardRepository';


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
  currentScreen,
  setShowDiary,
  openDiary,
  setIsDiaryRequired,
  setPlayerSelectionTask,
  setCardSelectionTask,
  setSharingRecipientId,
  setAtelierContext,
  setRoomStatus,
  setActiveVerification,
  passTurn,
  getRingIndices,
  generateDiceRoll,
  focusedCard,
  drawCard
}) => {

  const isMovingRef = useRef(isMoving);
  useEffect(() => { isMovingRef.current = isMoving; }, [isMoving]);
  
  const playersRef = useRef(players);
  useEffect(() => { playersRef.current = players; }, [players]);


  const pendingTileActionRef = useRef(null);

  const handleTileAction = useCallback(async function recurse(tile, player, allPlayers, recursionDepth = 0) {
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

    for (const action of result.uiActions) {
      if (action.type === 'SET_FOCUSED_CARD') {
        const cardData = drawCard(action.payload.type);
        setFocusedCard({
          ...action.payload,
          content: cardData.content,
          index: cardData.index,
          isCustom: !!cardData.isCustom
        });
      }

      if (action.type === 'POPUP') showSystemPopup(action.payload);

      if (action.type === 'SELECT_PLAYER' && setPlayerSelectionTask) {
        setPlayerSelectionTask({
          ...action.payload,
          onSelect: async (targetId) => {
            const currentPlayers = [...playersRef.current];
            const targetIndex = currentPlayers.findIndex(p => p.id === targetId);
            const myIndex = currentPlayerIndex;
            
            if (targetIndex !== -1) {
              const targetPlayer = currentPlayers[targetIndex];
              
              if (action.payload.action === 'SWAP_POSITIONS') {
                const tempPos = currentPlayers[myIndex].position;
                currentPlayers[myIndex].position = currentPlayers[targetIndex].position;
                currentPlayers[targetIndex].position = tempPos;
                
                setPlayers(currentPlayers);
                if (isOnline && roomId) {
                  const plainPlayers = currentPlayers.map(p => ({ ...p }));
                  await syncRepository.updateGameState(roomId, { players: plainPlayers });
                }

                showSystemPopup({
                  title: 'Troca Realizada!',
                  message: `Você trocou de lugar com ${targetPlayer.name}.`,
                  type: 'success',
                  onConfirm: () => {
                    passTurn({ players: currentPlayers });
                  }
                });
              } else if (action.payload.action === 'SHARE_CARD') {
                // Inicia seleção de carta após escolher destinatário
                setCardSelectionTask({
                  title: 'Escolha a Carta',
                  message: `Qual carta você deseja compartilhar com ${targetPlayer.name}?`,
                  recipientId: targetId,
                  onSelect: (card) => {
                    setFocusedCard({
                      ...card,
                      content: card.cardText,
                      type: card.cardType,
                      id: `shared-${Date.now()}`,
                      fromTileAction: true,
                      recipientId: targetId // Guardamos quem recebe
                    });
                  },
                  onDrawNew: () => {
                    // Sorteia uma nova do tipo 'sorte' (ou aleatório)
                    const types = ['reflexao', 'desafio', 'sorte', 'memoria', 'experiencia'];
                    const randomType = types[Math.floor(Math.random() * types.length)];
                    const cardData = drawCard(randomType);
                    
                    setFocusedCard({
                      type: randomType,
                      content: cardData.content,
                      index: cardData.index,
                      id: `shared-new-${Date.now()}`,
                      fromTileAction: true,
                      recipientId: targetId,
                      isCustom: !!cardData.isCustom
                    });
                  },
                  onCreateNew: () => {
                    setSharingRecipientId(targetId);
                    setAtelierContext('share_card');
                    setCurrentScreen('card_creation');
                  }
                });
              }
            }
            setPlayerSelectionTask(null);
          }
        });
      }

      if (action.type === 'PROCESS_CUSTOM_CARD') {
        const customCards = await customCardRepository.getCards();
        const categoryFilter = action.payload.category;
        
        // Filtra se houver categoria específica
        const filteredCards = categoryFilter 
          ? customCards.filter(c => c.type === categoryFilter)
          : customCards;

        if (filteredCards.length > 0) {
          const randomCard = filteredCards[Math.floor(Math.random() * filteredCards.length)];
          setFocusedCard({
            ...randomCard,
            id: `custom-${randomCard.id}-${Date.now()}`,
            fromTileAction: true,
            isCustom: true
          });
        } else {
          const categoryName = categoryFilter ? categoryFilter.toUpperCase() : 'CUSTOMIZADAS';
          showSystemPopup({
            title: `Faltam cartas de ${categoryName}!`,
            message: `Não há mais cartas do tipo ${categoryName} criadas pelos jogadores. Todos devem criar novas cartas agora!`,
            type: 'warning',
            onConfirm: () => {
              // Salva a ação pendente para retomar depois
              pendingTileActionRef.current = tile;
              if (isOnline && roomId) {
                // SALVA AS POSIÇÕES ATUAIS antes de mudar o status da sala
                const plainPlayers = playersRef.current.map(p => ({ ...p }));
                syncRepository.updateGameState(roomId, { players: plainPlayers }).then(() => {
                  syncRepository.updateRoomStatus(roomId, 'card_creation');
                  if (typeof setAtelierContext === 'function') {
                    setAtelierContext('missing_cards');
                  }
                  setCurrentScreen('card_creation');
                });
              } else {
                if (typeof setAtelierContext === 'function') {
                  setAtelierContext('missing_cards');
                }
                setCurrentScreen('card_creation');
              }
            }

          });
        }
      }

    }

    if (result.newScreen) setCurrentScreen(result.newScreen);
    if (result.showDiary) {
      if (typeof openDiary === 'function') {
        openDiary(true);
      } else {
        setShowDiary(true);
        if (setIsDiaryRequired) setIsDiaryRequired(true);
      }
    }

    let modalOpened = result.modalOpened;
    let positionChanged = result.positionChanged;

    if (positionChanged) {
      const nextTile = activeBoardConfig.tiles[player.position];
      const nextModalOpened = await recurse(nextTile, player, allPlayers, recursionDepth + 1);
      modalOpened = modalOpened || nextModalOpened;
    }

    setPlayers([...allPlayers]);
    return modalOpened;
  }, [activeBoardConfig, currentPlayerIndex, drawCard, getRingIndices, isOnline, roomId, setAtelierContext, setCurrentScreen, setFocusedCard, setPlayerSelectionTask, setCardSelectionTask, setPlayers, setShowDiary, showSystemPopup, syncRepository, passTurn, openDiary, setIsDiaryRequired, setSharingRecipientId]);

  // Efeito para retomar ação pendente ao voltar para o jogo
  useEffect(() => {
    if (currentScreen === 'game' && pendingTileActionRef.current) {
      const tile = pendingTileActionRef.current;
      
      // Aguarda um pouco para a UI do tabuleiro estabilizar
      const timeoutId = setTimeout(() => {
        if (!playersRef.current || playersRef.current.length === 0) return;
        
        const player = playersRef.current[currentPlayerIndex];
        if (!player) return;

        pendingTileActionRef.current = null;
        handleTileAction(tile, player, playersRef.current);
      }, 600);

      return () => clearTimeout(timeoutId);
    }
  }, [currentScreen, currentPlayerIndex, handleTileAction]);






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
      await new Promise(r => setTimeout(r, 350));
    }

    if (isOnline && roomId) {
      const plainPlayers = newPlayers.map(p => ({ ...p }));
      await syncRepository.updateGameState(roomId, {
        players: plainPlayers,
        lastActionBy: user?.id || null
      }).catch(e => console.error("Erro sync final", e));
    }


    await new Promise(r => setTimeout(r, 600));

    const currentTile = activeBoardConfig.tiles[player.position];
    const hasModal = await handleTileAction(currentTile, player, newPlayers);

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
      const plainPlayers = updatedPlayers.map(p => ({ ...p }));
      syncRepository.updateGameState(roomId, {
        isRolling: false,
        lastDiceRoll: roll,
        players: plainPlayers,
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

    const currentCard = { ...focusedCard };
    setFocusedCard(null);

    if (shouldDrawAnother) {
      setTimeout(() => {
        // Usa o mesmo tipo da primeira carta para o segundo sorteio
        const drawType = currentCard.type || 'desafio';
        const cardData = drawCard(drawType);
        
        setFocusedCard({
          type: drawType,
          content: cardData.content,
          index: cardData.index,
          id: `card-extra-${Date.now()}`,
          fromTileAction: true,
          nextDraw: false,
          isCustom: !!cardData.isCustom,
          previousCard: currentCard // Passa a carta atual para a próxima para acumular
        });
      }, 300);

      return;
    }

    if (wasFromTile) {
      setTimeout(() => {
        // Função auxiliar para extrair texto de forma robusta
        const getCardText = (card) => {
          if (!card) return 'Ação de casa';
          const content = card.content;
          if (typeof content === 'string') return content;
          if (content && typeof content === 'object') {
            return content.text || content.content || card.text || 'Ação de casa';
          }
          return card.text || 'Ação de casa';
        };

        const currentCardText = getCardText(currentCard);
        
        // Se houver uma carta anterior acumulada (ex: COMPRAR 2), cria um array de cartas
        const cards = currentCard.previousCard ? [
          {
            type: currentCard.previousCard.type || 'reflexao',
            text: getCardText(currentCard.previousCard),
            id: currentCard.previousCard.id || `card-prev-${Date.now()}`,
            isCustom: !!currentCard.previousCard.isCustom
          },
          {
            type: currentCard.type || 'reflexao',
            text: currentCardText,
            id: currentCard.id || `card-curr-${Date.now()}`,
            isCustom: !!currentCard.isCustom
          }
        ] : null;

        const verificationData = {
          playerId: players[currentPlayerIndex].id,
          cardType: currentCard.type || 'reflexao',
          cardText: currentCardText,
          cards: cards, // Novo campo com a lista de cartas para o ActionVerificationForm
          recipientId: currentCard.recipientId || null,
          timestamp: Date.now(),
          responses: {}
        };

        if (isOnline && roomId) {
          // Inicia a verificação social no modo online
          Promise.all([
            syncRepository.updateRoomStatus(roomId, 'verifying_action'),
            syncRepository.updateGameState(roomId, { activeVerification: verificationData })
          ]).catch(e => console.error("Erro ao iniciar verificação online:", e));
        } else {
          // Inicia a verificação social no modo offline (local)
          setActiveVerification(verificationData);
          setRoomStatus('verifying_action');
        }
      }, 600);
    }


  }, [focusedCard, setFocusedCard, drawCard, isOnline, roomId, players, currentPlayerIndex, syncRepository, setActiveVerification, setRoomStatus]);

  const jumpToTile = useCallback(async (tileIndex, targetPlayerIndex = null) => {
    if (isMovingRef.current) return;
    
    // Determina qual jogador mover. No modo teste dev, se for online, move a si mesmo por padrão.
    let pIdx = targetPlayerIndex;
    if (pIdx === null) {
      if (activeBoardConfig?.id === 'teste_dev' && isOnline && myPlayerIndex !== -1) {
        pIdx = myPlayerIndex;
      } else {
        pIdx = currentPlayerIndex;
      }
    }

    // Bloqueia ações se for online e não for sua vez (a menos que esteja movendo a si mesmo no modo teste)
    const isMovingSelfInTest = activeBoardConfig?.id === 'teste_dev' && pIdx === myPlayerIndex;
    
    if (isOnline && !isMovingSelfInTest && currentPlayerIndex !== myPlayerIndex) return;

    setIsMoving(true);
    
    let newPlayers = [...playersRef.current];
    if (!newPlayers[pIdx]) {
      setIsMoving(false);
      return;
    }

    let player = { ...newPlayers[pIdx] };
    player.position = tileIndex;
    newPlayers[pIdx] = player;
    setPlayers(newPlayers);

    if (isOnline && roomId) {
      const plainPlayers = newPlayers.map(p => ({ ...p }));
      await syncRepository.updateGameState(roomId, { 
        players: plainPlayers,
        lastActionBy: user?.id || null 
      }).catch(e => console.error("Erro sync jump", e));
    }

    // Pequeno delay para a UI atualizar a posição visual antes de disparar a mecânica
    await new Promise(r => setTimeout(r, 400));
    
    const currentTile = activeBoardConfig.tiles[player.position];
    const hasModal = await handleTileAction(currentTile, player, newPlayers);
    
    setIsMoving(false);
    
    // Só passa o turno automaticamente se quem se moveu era o jogador do turno atual
    if (!hasModal && pIdx === currentPlayerIndex) {
      passTurn({ players: newPlayers });
    }
  }, [activeBoardConfig, currentPlayerIndex, handleTileAction, isOnline, myPlayerIndex, passTurn, roomId, setIsMoving, setPlayers, syncRepository, user]);

  return {
    rollDice,
    movePlayer,
    handleTileAction,
    jumpToTile,
    closeModal,
    closeFocusedCard,
    isMovingRef,
    playersRef
  };
};

