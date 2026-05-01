import { ref, set, onValue, onDisconnect, serverTimestamp, update } from "firebase/database";
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
      onValue(roomRef, (s) => resolve(s), (error) => reject(error), { onlyOnce: true });
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
          photoURL: user.photoURL || null,
          isOnline: true,
          lastSeen: serverTimestamp()
        };
        await update(ref(database, `rooms/${roomId}/participants`), { [user.id]: userData });
        participants[user.id] = userData;
      } else {
        throw new Error('Sala cheia');
      }
    }

    return { ...roomData, participants };
  }

  async startGame(roomId) {
    if (!database) return;
    const roomRef = ref(database, `rooms/${roomId}`);
    await update(roomRef, { status: 'playing' });
  }

  async updateGameState(roomId, gameState) {
    if (!database) return;
    const gameStateRef = ref(database, `rooms/${roomId}/gameState`);

    // Usamos update para não apagar campos que não foram enviados (como turnStartTime)
    await update(gameStateRef, gameState);
  }

  async startTurn(roomId, playerIndex, duration) {
    if (!database || !roomId) return;
    // Escreve diretamente no path do gameState, nao na raiz.
    // Multi-path updates na raiz sao bloqueados pelas Security Rules.
    const gameStateRef = ref(database, `rooms/${roomId}/gameState`);
    await update(gameStateRef, {
      currentPlayerIndex: playerIndex,
      turnStartTime: serverTimestamp(),
      turnDuration: duration
    });
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

  updatePlayerPresence(roomId, userId) {
    if (!database || !roomId || !userId) return () => {};

    const participantStatusRef = ref(database, `rooms/${roomId}/participants/${userId}/isOnline`);
    const participantLastSeenRef = ref(database, `rooms/${roomId}/participants/${userId}/lastSeen`);
    const connectedRef = ref(database, ".info/connected");

    return onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        // Quando conectado, define como online
        set(participantStatusRef, true);
        set(participantLastSeenRef, serverTimestamp());

        // Quando desconectar (aba fechada, perda de rede), define como offline no servidor
        onDisconnect(participantStatusRef).set(false);
        onDisconnect(participantLastSeenRef).set(serverTimestamp());
      }
    });
  }

  async leaveRoom(roomId, userId) {
    if (!database || !roomId || !userId) return;

    // Cancela os onDisconnect registrados antes de remover
    onDisconnect(ref(database, `rooms/${roomId}/participants/${userId}/isOnline`)).cancel();
    onDisconnect(ref(database, `rooms/${roomId}/participants/${userId}/lastSeen`)).cancel();

    const roomRef = ref(database, `rooms/${roomId}`);

    // Le o estado atual da sala para decidir se deve apaga-la
    const snapshot = await new Promise((resolve, reject) => {
      onValue(roomRef, (s) => resolve(s), (error) => reject(error), { onlyOnce: true });
    });

    if (snapshot.exists()) {
      const room = snapshot.val();
      const participants = room.participants || {};
      const remainingAfterLeave = Object.keys(participants).filter(id => id !== userId);

      if (remainingAfterLeave.length === 0) {
        // Era o ultimo jogador: apaga toda a sala para nao gerar dados orfaos
        console.log(`Sala ${roomId} apagada: ultimo jogador saiu.`);
        await this.deleteRoom(roomId);
      } else {
        // Apenas remove o participante e seu estado de pronto
        const participantRef = ref(database, `rooms/${roomId}/participants/${userId}`);
        const readyRef = ref(database, `rooms/${roomId}/readyPlayers/${userId}`);
        await set(participantRef, null);
        await set(readyRef, null);
      }
    }
  }

  async deleteRoom(roomId) {
    if (!database || !roomId) return;
    const roomRef = ref(database, `rooms/${roomId}`);
    await set(roomRef, null);
  }
}

