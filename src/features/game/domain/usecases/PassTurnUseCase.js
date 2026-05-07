/**
 * Caso de Uso para gerenciar a passagem de turno entre jogadores.
 * Considera regras de pular vez e conectividade de participantes.
 */
export class PassTurnUseCase {
  /**
   * Calcula o próximo estado do jogo após a passagem de turno.
   * 
   * @param {Object} params - Parâmetros para execução.
   * @param {Array} params.players - Lista atual de jogadores.
   * @param {number} params.currentPlayerIndex - Índice do jogador que está terminando o turno.
   * @param {Object} params.roomParticipants - Participantes da sala (para verificar online).
   * @param {number} params.turnTime - Duração padrão do turno.
   * @returns {Object} O novo estado calculado { nextIndex, updatedPlayers }.
   */
  static execute({ players, currentPlayerIndex, roomParticipants, turnTime }) {
    let nextIndex = (currentPlayerIndex + 1) % players.length;
    let updatedPlayers = [...players];
    
    // Loop para encontrar o próximo disponível (máximo players.length tentativas)
    for (let i = 0; i < players.length; i++) {
      const nextPlayer = updatedPlayers[nextIndex];
      const participant = roomParticipants[nextPlayer.id];
      const isOnline = participant?.isOnline ?? true;

      if (nextPlayer.skipNextTurn || isOnline === false) {
        // Se pular por carta, reseta a flag para a próxima rodada
        if (nextPlayer.skipNextTurn) {
          updatedPlayers = updatedPlayers.map((p, j) => 
            j === nextIndex ? { ...p, skipNextTurn: false } : p
          );
        }
        
        // Passa para o próximo
        nextIndex = (nextIndex + 1) % updatedPlayers.length;
      } else {
        // Encontrou um jogador válido
        break;
      }
    }

    // Aplica o reset de tempo e limpa o último dado ao jogador que está assumindo o turno
    updatedPlayers = updatedPlayers.map((p, i) => {
      if (i === nextIndex) return { ...p, timeLeft: turnTime, lastRoll: null };
      return p;
    });

    return {
      nextIndex,
      updatedPlayers
    };
  }
}
