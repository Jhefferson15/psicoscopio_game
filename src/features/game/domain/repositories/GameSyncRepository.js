export class GameSyncRepository {
  async createRoom(gameData) {
    throw new Error('Method not implemented');
  }

  async joinRoom(roomId) {
    throw new Error('Method not implemented');
  }

  async updateGameState(roomId, gameState) {
    throw new Error('Method not implemented');
  }

  listenToGameState(roomId, callback) {
    throw new Error('Method not implemented');
  }
}
