/**
 * Use Case para calcular a movimentação do jogador no tabuleiro.
 * Implementa lógica de tabuleiro circular (wrap-around).
 */
export class MovePlayerUseCase {
  /**
   * Calcula a próxima posição do jogador.
   * 
   * @param {number} currentPosition - A posição atual (índice da casa).
   * @param {number} steps - Quantidade de passos (pode ser negativo).
   * @param {number} boardSize - Total de casas no tabuleiro.
   * @returns {number} A nova posição calculada.
   */
  static execute(currentPosition, steps, boardSize) {
    if (boardSize <= 0) return 0;
    
    // A fórmula (((a + b) % n) + n) % n garante que o resultado seja 
    // sempre positivo, mesmo para steps negativos que ultrapassem o início.
    return (((currentPosition + steps) % boardSize) + boardSize) % boardSize;
  }
}
