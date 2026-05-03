export class GameSyncRepository {
  async createRoom(_gameData) { // eslint-disable-line no-unused-vars
    throw new Error('Method not implemented');
  }

  async joinRoom(_roomId) { // eslint-disable-line no-unused-vars
    throw new Error('Method not implemented');
  }

  async updateGameState(_roomId, _gameState) { // eslint-disable-line no-unused-vars
    throw new Error('Method not implemented');
  }

  async startTurn(_roomId, _playerIndex, _duration) { // eslint-disable-line no-unused-vars
    throw new Error('Method not implemented');
  }

  listenToGameState(_roomId, _callback) { // eslint-disable-line no-unused-vars
    throw new Error('Method not implemented');
  }

  updatePlayerPresence(_roomId, _userId) { // eslint-disable-line no-unused-vars
    throw new Error('Method not implemented');
  }

  leaveRoom(_roomId, _userId) { // eslint-disable-line no-unused-vars
    throw new Error('Method not implemented');
  }

  async deleteRoom(_roomId) { // eslint-disable-line no-unused-vars
    throw new Error('Method not implemented');
  }

  async saveEvaluation(_evaluationData) { // eslint-disable-line no-unused-vars
    throw new Error('Method not implemented');
  }
}
