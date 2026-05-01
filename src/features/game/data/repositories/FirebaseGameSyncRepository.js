import { ref, set, onValue } from "firebase/database";
import { database } from "../../../../config/firebase.js";
import { GameSyncRepository } from "../../domain/repositories/GameSyncRepository.js";

export class FirebaseGameSyncRepository extends GameSyncRepository {
  async createRoom(gameData, ownerId) {
    if (!database) {
      alert("Firebase não configurado. Não é possível criar salas online.");
      throw new Error("Firebase não configurado");
    }
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    const roomRef = ref(database, `rooms/${roomId}`);
    
    const initialData = {
      id: roomId,
      ownerId: ownerId || null,
      status: 'waiting',
      createdAt: Date.now(),
      participants: ownerId ? { [ownerId]: { id: ownerId, name: 'Anfitrião' } } : {}, 
      gameState: JSON.parse(JSON.stringify(gameData))
    };

    await set(roomRef, initialData);
    return roomId;
  }

  async joinRoom(roomId, user) {
    if (!database) throw new Error("Firebase não configurado");
    const roomRef = ref(database, `rooms/${roomId}`);

    const snapshot = await new Promise((resolve, reject) => {
      onValue(roomRef, (s) => resolve(s), { onlyOnce: true });
    });

    if (!snapshot.exists()) throw new Error('Sala não encontrada');
    
    const roomData = snapshot.val();
    const participants = roomData.participants || {};
    const participantIds = Object.keys(participants);
    
    // Se o usuário não está na lista de participantes, adiciona (se houver espaço)
    if (user && user.id && !participants[user.id]) {
      if (participantIds.length < 4) {
        const userData = {
          id: user.id,
          name: user.name || `Jogador ${participantIds.length + 1}`,
          photoURL: user.photoURL || null
        };
        await set(ref(database, `rooms/${roomId}/participants/${user.id}`), userData);
        participants[user.id] = userData;
      } else {
        throw new Error('Sala cheia');
      }
    }

    return { ...roomData, participants };
  }

  async startGame(roomId) {
    if (!database) return;
    const statusRef = ref(database, `rooms/${roomId}/status`);
    await set(statusRef, 'playing');
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
