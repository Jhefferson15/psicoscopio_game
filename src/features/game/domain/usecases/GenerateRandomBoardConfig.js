/**
 * Caso de uso para gerar uma configuração de tabuleiro aleatória.
 * Segue as regras de negócio:
 * 1. Aleatoriza mecânicas (tempo, dados).
 * 2. Aleatoriza cada casa (tipo, cor, ação).
 * 3. Garante uma única ação por casa: se for tipo de carta, a ação especial deve ser nula.
 */
import { STANDARD_TILE_CONFIG } from '../gameConstants';

export class GenerateRandomBoardConfig {
  static execute(currentTiles, tileTypes, tileActions, colors) {
    const cardTypes = Object.keys(STANDARD_TILE_CONFIG);
    
    const newTiles = currentTiles.map(tile => {
      // Sorteia um tipo aleatório
      const randomType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
      const isCardType = cardTypes.includes(randomType.id);
      
      let randomColor = colors[Math.floor(Math.random() * colors.length)];
      let randomAction = null;
      let label = '';

      if (isCardType) {
        randomColor = STANDARD_TILE_CONFIG[randomType.id].color;
        label = STANDARD_TILE_CONFIG[randomType.id].label;
      } else {
        const possibleActions = tileActions.filter(a => a.id !== null && a.id !== 'MOVE_INNER' && a.id !== 'MOVE_OUTER');
        const actionObj = possibleActions[Math.floor(Math.random() * possibleActions.length)];
        randomAction = actionObj.id;
        if (actionObj.color) randomColor = actionObj.color;
      }
      
      return {
        ...tile,
        type: randomType.id,
        color: randomColor,
        action: randomAction,
        label: label
      };
    });


    // PÓS-PROCESSAMENTO: Garantir conectividade entre anéis
    const ensureAction = (ring, action, minCount = 1) => {
      const ringTiles = newTiles.filter(t => t.ring === ring);
      const currentCount = ringTiles.filter(t => t.action === action).length;
      
      const oppositeAction = action === 'MOVE_INNER' ? 'MOVE_OUTER' : 'MOVE_INNER';
      
      if (currentCount < minCount) {
        for (let i = 0; i < (minCount - currentCount); i++) {
          // Busca casas que não tenham ações de transição ainda
          // E que não estejam "em cima" de uma casa com a ação oposta em outro anel
          const available = ringTiles.filter(t => {
            if (t.action === 'MOVE_INNER' || t.action === 'MOVE_OUTER') return false;
            
            // Verifica sobreposição angular (margem de 10 graus)
            const hasOverlappingOpposite = newTiles.some(other => 
              other.ring !== ring && 
              other.action === oppositeAction && 
              Math.abs(other.angle - t.angle) < 10
            );
            
            return !hasOverlappingOpposite;
          });

          if (available.length > 0) {
            const target = available[Math.floor(Math.random() * available.length)];
            const index = newTiles.findIndex(t => t.id === target.id);
            newTiles[index].action = action;
            newTiles[index].label = action === 'MOVE_INNER' ? 'PARA DENTRO' : 'PARA FORA';
            newTiles[index].type = 'especial';
            newTiles[index].color = '#FFFFFF';
          } else if (ringTiles.length > 0) {
            // Se não houver casas ideais, pegamos qualquer uma que não seja a própria ação
            const fallbackAvailable = ringTiles.filter(t => t.action !== action);
            if (fallbackAvailable.length > 0) {
               const target = fallbackAvailable[Math.floor(Math.random() * fallbackAvailable.length)];
               const index = newTiles.findIndex(t => t.id === target.id);
               newTiles[index].action = action;
               newTiles[index].label = action === 'MOVE_INNER' ? 'PARA DENTRO' : 'PARA FORA';
               newTiles[index].type = 'especial';
               newTiles[index].color = '#FFFFFF';
            }
          }
        }
      }
    };

    ensureAction('outer', 'MOVE_INNER', 1);
    ensureAction('middle', 'MOVE_INNER', 1);
    ensureAction('middle', 'MOVE_OUTER', 1);
    ensureAction('inner', 'MOVE_INNER', 1);
    ensureAction('center', 'MOVE_OUTER', 1);

    return {
      name: `Tabuleiro Aleatório ${Math.floor(Math.random() * 1000)}`,
      mechanics: {
        turnTime: Math.floor(Math.random() * 46) + 15, // 15s a 60s
        diceMin: Math.floor(Math.random() * 2) + 1,    // 1 ou 2
        diceMax: Math.floor(Math.random() * 7) + 6     // 6 a 12
      },
      tiles: newTiles
    };
  }
}
