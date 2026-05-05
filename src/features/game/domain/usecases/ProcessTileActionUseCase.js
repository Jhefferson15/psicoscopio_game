/**
 * Caso de Uso para processar as ações disparadas por uma casa do tabuleiro.
 * Isola a lógica de negócio dos efeitos colaterais da UI.
 */
export class ProcessTileActionUseCase {
  /**
   * Executa a lógica da casa e retorna as ações necessárias.
   * 
   * @param {Object} tile - A casa onde o jogador parou.
   * @param {Object} player - O jogador atual.
   * @param {Array} allPlayers - Todos os jogadores na partida.
   * @param {Object} activeBoardConfig - Configuração ativa do tabuleiro.
   * @param {Function} getRingIndices - Função que retorna os índices de um anel.
   * @param {Object} movePlayerUseCase - Caso de uso de movimentação básica.
   * @param {number} currentPlayerIndex - Índice do jogador atual.
   * @param {Object} deps - Dependências injetáveis (para pureza).
   * @returns {Object} O resultado do processamento.
   */
  static execute(
    tile, 
    player, 
    allPlayers, 
    activeBoardConfig, 
    getRingIndices, 
    movePlayerUseCase, 
    currentPlayerIndex,
    deps = { now: Date.now, random: Math.random }
  ) {
    let modalOpened = false;
    let positionChanged = false;
    let uiActions = []; // { type: 'SET_FOCUSED_CARD' | 'POPUP', payload: any }
    let newScreen = null;
    let showDiary = false;

    // 1. Processamento de Modais de Carta
    const standardCategories = ['reflexao', 'desafio', 'memoria', 'experiencia', 'sorte'];
    const customCategories = ['custom_reflexao', 'custom_desafio', 'custom_memoria', 'custom_experiencia', 'custom_sorte', 'custom_card'];

    if (standardCategories.includes(tile.type) || tile.action === 'DRAW_2') {
      const cardType = tile.type === 'especial' || !standardCategories.includes(tile.type) ? 'desafio' : tile.type;

      uiActions.push({
        type: 'SET_FOCUSED_CARD',
        payload: { 
          type: cardType, 
          id: `card-${cardType}-${deps.now()}`,
          fromTileAction: true,
          nextDraw: tile.action === 'DRAW_2'
        }
      });

      modalOpened = true;
    } else if (customCategories.includes(tile.type)) {
      // Mapeia custom_memoria -> memoria para o filtro
      const filterCategory = tile.type.startsWith('custom_') ? tile.type.replace('custom_', '') : null;
      
      uiActions.push({
        type: 'PROCESS_CUSTOM_CARD',
        payload: { 
          fromTileAction: true,
          category: filterCategory === 'card' ? null : filterCategory
        }
      });
      modalOpened = true;
    }



    // 2. Processamento de Ações de Movimento ou Estado
    switch (tile.action) {
      case 'TEAM_CHALLENGE':
        uiActions.push({
          type: 'POPUP',
          payload: {
            title: 'Desafio em Equipe!',
            message: 'Todos os jogadores participam. Unam suas forças para avançar!',
            type: 'info'
          }
        });
        break;

      case 'MOVE_2': {
        const ringIndices = getRingIndices(tile.ring);
        const relPos = ringIndices.indexOf(player.position);
        const newRelPos = movePlayerUseCase.execute(relPos, 2, ringIndices.length);
        player.position = ringIndices[newRelPos];
        positionChanged = true;
        break;
      }

      case 'BACK_2': {
        const ringIndices = getRingIndices(tile.ring);
        const relPos = ringIndices.indexOf(player.position);
        const newRelPos = movePlayerUseCase.execute(relPos, -2, ringIndices.length);
        player.position = ringIndices[newRelPos];
        positionChanged = true;
        break;
      }

      case 'SWAP_PLACE': {
        uiActions.push({
          type: 'SELECT_PLAYER',
          payload: {
            action: 'SWAP_POSITIONS',
            title: 'Troca de Lugar',
            message: 'Escolha um jogador para trocar de posição com você!',
            excludeSelf: true
          }
        });
        modalOpened = true;
        break;
      }

      case 'MOVE_INNER': {
        const ringSequence = ['outer', 'middle', 'inner'];
        const currentRingIdx = ringSequence.indexOf(tile.ring);
        
        // Busca o próximo anel disponível para dentro
        let targetRing = null;
        for (let i = currentRingIdx + 1; i < ringSequence.length; i++) {
          if (activeBoardConfig.tiles.some(t => t.ring === ringSequence[i])) {
            targetRing = ringSequence[i];
            break;
          }
        }

        if (targetRing) {
          const targetTiles = activeBoardConfig.tiles.filter(t => t.ring === targetRing);
          // Busca a casa mais próxima por ângulo
          let closestTile = targetTiles[0];
          let minDiff = 360;
          
          targetTiles.forEach(t => {
            let diff = Math.abs(t.angle - tile.angle);
            if (diff > 180) diff = 360 - diff;
            if (diff < minDiff) {
              minDiff = diff;
              closestTile = t;
            }
          });

          player.position = activeBoardConfig.tiles.findIndex(t => t.id === closestTile.id);
          positionChanged = true;
        }
        break;
      }

      case 'MOVE_OUTER': {
        const ringSequence = ['outer', 'middle', 'inner'];
        const currentRingIdx = ringSequence.indexOf(tile.ring);
        
        // Busca o próximo anel disponível para fora
        let targetRing = null;
        for (let i = currentRingIdx - 1; i >= 0; i--) {
          if (activeBoardConfig.tiles.some(t => t.ring === ringSequence[i])) {
            targetRing = ringSequence[i];
            break;
          }
        }

        if (targetRing) {
          const targetTiles = activeBoardConfig.tiles.filter(t => t.ring === targetRing);
          // Busca a casa mais próxima por ângulo
          let closestTile = targetTiles[0];
          let minDiff = 360;
          
          targetTiles.forEach(t => {
            let diff = Math.abs(t.angle - tile.angle);
            if (diff > 180) diff = 360 - diff;
            if (diff < minDiff) {
              minDiff = diff;
              closestTile = t;
            }
          });

          player.position = activeBoardConfig.tiles.findIndex(t => t.id === closestTile.id);
          positionChanged = true;
        }
        break;
      }

      case 'SKIP_TURN':
        player.skipNextTurn = true;
        uiActions.push({
          type: 'POPUP',
          payload: {
            title: 'Pausa Reflexiva',
            message: `${player.name} vai pular a próxima vez para meditar.`,
            type: 'warning'
          }
        });
        break;

      case 'SHARE_CARD':
        uiActions.push({
          type: 'SELECT_PLAYER',
          payload: {
            action: 'SHARE_CARD',
            title: 'Compartilhar Carta',
            message: 'Escolha um jogador para receber uma de suas cartas!',
            excludeSelf: true
          }
        });
        modalOpened = true;
        break;

      case 'CREATE_CARD':
        uiActions.push({
          type: 'POPUP',
          payload: {
            title: 'Criatividade!',
            message: 'Mecânica Criar Carta: Use sua criatividade para inspirar os outros.',
            type: 'info'
          }
        });
        newScreen = 'card_creation';
        modalOpened = true;
        break;

      case 'WRITE_DIARY':
        uiActions.push({
          type: 'POPUP',
          payload: {
            title: 'Diário',
            message: 'Mecânica Diário: Registre seus pensamentos e reflexões.',
            type: 'info'
          }
        });
        showDiary = true;
        modalOpened = true;
        break;
    }

    return {
      modalOpened,
      positionChanged,
      uiActions,
      newScreen,
      showDiary,
      player,
      allPlayers
    };
  }
}
