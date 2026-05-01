import { ref, set, onValue, update } from "firebase/database";
import { database } from "../../../../config/firebase.js";
import { GameSyncRepository } from "../../domain/repositories/GameSyncRepository.js";

export class FirebaseGameSyncRepository extends GameSyncRepository {
  async createRoom(gameData) {
    if (!database) {
      alert("Firebase não configurado. Não é possível criar salas online.");
      throw new Error("Firebase não configurado");
    }
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    const roomRef = ref(database, `rooms/${roomId}`);
    
    const initialData = {
      id: roomId,
      status: 'waiting',
      createdAt: Date.now(),
      gameState: gameData
    };

    await set(roomRef, initialData);
    return roomId;
  }

  async joinRoom(roomId) {
    if (!database) throw new Error("Firebase não configurado");
    const roomRef = ref(database, `rooms/${roomId}`);

    return new Promise((resolve, reject) => {
      onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
          resolve(snapshot.val());
        } else {
          reject(new Error('Sala não encontrada'));
        }
      }, { onlyOnce: true });
    });
  }

  async updateGameState(roomId, gameState) {
    if (!database) return;
    const gameStateRef = ref(database, `rooms/${roomId}/gameState`);

    await set(gameStateRef, gameState);
  }

  listenToGameState(roomId, callback) {
    if (!database) return () => {};
    const gameStateRef = ref(database, `rooms/${roomId}/gameState`);

    return onValue(gameStateRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    });
  }
}
