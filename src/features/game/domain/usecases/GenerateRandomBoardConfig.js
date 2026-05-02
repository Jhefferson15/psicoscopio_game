/**
 * Caso de uso para gerar uma configuração de tabuleiro aleatória.
 * Segue as regras de negócio:
 * 1. Aleatoriza mecânicas (tempo, dados).
 * 2. Aleatoriza cada casa (tipo, cor, ação).
 * 3. Garante uma única ação por casa: se for tipo de carta, a ação especial deve ser nula.
 */
export class GenerateRandomBoardConfig {
  static execute(currentTiles, tileTypes, tileActions, colors) {
    const cardTypes = ['brain', 'reflexao', 'desafio', 'memoria', 'chat', 'puzzle'];
    
    const newTiles = currentTiles.map(tile => {
      // Sorteia um tipo aleatório
      const randomType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
      // Sorteia uma cor aleatória
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      let randomAction = null;
      const isCardType = cardTypes.includes(randomType.id);
      
      // Regra: Uma e apenas uma ação por casa
      if (!isCardType) {
        // Se não for um tipo de carta, sorteamos uma ação especial
        // Filtramos 'null' para garantir que casas especiais realmente tenham ações (opcional, mas melhora a variedade)
        const possibleActions = tileActions.filter(a => a.id !== null);
        randomAction = possibleActions[Math.floor(Math.random() * possibleActions.length)].id;
      }
      
      return {
        ...tile,
        type: randomType.id,
        color: randomColor,
        action: randomAction,
        label: randomAction ? '' : randomType.label // Se tiver ação, deixamos o rótulo vazio ou usamos a ação no futuro
      };
    });

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
