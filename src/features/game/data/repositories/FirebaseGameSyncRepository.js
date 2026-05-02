import { ref, set, onValue, onDisconnect, serverTimestamp } from "firebase/database";
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp as firestoreTimestamp 
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { database, functions, firestore } from "../../../../config/firebase.js";
import { GameSyncRepository } from "../../domain/repositories/GameSyncRepository.js";

export class FirebaseGameSyncRepository extends GameSyncRepository {
  async createRoom(gameData, ownerId) {
    if (!database) {
      throw new Error("Firebase não configurado");
    }
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    const roomRef = ref(database, `rooms/${roomId}`);
    
    const initialData = {
      id: roomId,
      ownerId: ownerId || null,
      status: 'waiting',
      createdAt: Date.now(),
      participants: ownerId ? { [ownerId]: { id: ownerId, name: 'Anfitrião', isOnline: true } } : {}, 
      gameState: JSON.parse(JSON.stringify(gameData))
    };

    await set(roomRef, initialData);

    // Espelha metadados essenciais no Firestore para listagem eficiente no Dashboard
    if (firestore) {
      try {
        const fsRoomRef = doc(firestore, "rooms", roomId);
        await setDoc(fsRoomRef, {
          id: roomId,
          ownerId: ownerId || null,
          status: 'waiting',
          createdAt: firestoreTimestamp(),
          metadata: initialData.gameState.metadata || {}
        });
      } catch (fsError) {
        console.error("Erro ao registrar sala no Firestore (Metadados):", fsError);
        // Não lançamos o erro aqui para não impedir o jogo de começar se o RTDB funcionou,
        // mas o Dashboard do Observador não verá esta sala.
      }
    }

    return roomId;
  }

  async setUserReady(roomId, userId, isReady = true) {
    if (!database || !roomId || !userId) return;
    const readyRef = ref(database, `rooms/${roomId}/readyPlayers/${userId}`);
    await set(readyRef, isReady);
  }

  async updateRoomStatus(roomId, status) {
    if (!database || !roomId || !functions) return;
    await this._callGameAction(roomId, "UPDATE_STATUS", { status });
  }

  async _callGameAction(roomId, action, data = {}) {
    if (!functions) throw new Error("Firebase Functions não configurado");
    const gameAction = httpsCallable(functions, 'gameAction');
    try {
      const result = await gameAction({ roomId, action, data });
      return result.data;
    } catch (error) {
      console.error(`Erro ao executar ação ${action}:`, error);
      throw error;
    }
  }

  getServerTimeOffset(callback) {
    if (!database) return () => {};
    const offsetRef = ref(database, ".info/serverTimeOffset");
    return onValue(offsetRef, (snap) => {
      callback(snap.val() || 0);
    });
  }

  saveActiveRoomId(roomId) {
    localStorage.setItem('psicoscopio_online_room', roomId);
  }

  getActiveRoomId() {
    return localStorage.getItem('psicoscopio_online_room');
  }

  clearActiveRoomId() {
    localStorage.removeItem('psicoscopio_online_room');
  }

  async joinRoom(roomId, user) {
    if (!database || !functions) throw new Error("Firebase não configurado");
    
    // Tenta entrar via function para validar limites e permissões
    await this._callGameAction(roomId, "JOIN_ROOM", { 
      name: user.name, 
      photoURL: user.photoURL 
    });

    // Após entrar, lê os dados da sala via RTDB (mais eficiente para leitura)
    const roomRef = ref(database, `rooms/${roomId}`);
    const snapshot = await new Promise((resolve, reject) => {
      onValue(roomRef, (s) => resolve(s), (error) => reject(error), { onlyOnce: true });
    });

    if (!snapshot.exists()) throw new Error('Sala não encontrada');
    return snapshot.val();
  }

  async startGame(roomId, initialData = {}) {
    if (!functions || !roomId) return;
    await this._callGameAction(roomId, "START_GAME", initialData);
  }

  async updateGameState(roomId, gameState) {
    if (!functions || !roomId) return;
    await this._callGameAction(roomId, "SYNC_STATE", gameState);
  }

  async startTurn(roomId, playerIndex, duration) {
    if (!functions || !roomId) return;
    // O startTurn agora é mapeado para PASS_TURN no servidor,
    // que lida com a lógica de próximo jogador e timestamps.
    await this._callGameAction(roomId, "PASS_TURN", { 
      playerIndex, 
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

  listenToRoomData(roomId, callback) {
    if (!database) return () => {};
    const roomRef = ref(database, `rooms/${roomId}`);

    return onValue(roomRef, (snapshot) => {
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

  async recordCardAction(roomId, cardData) {
    if (!functions || !roomId) return;
    await this._callGameAction(roomId, "RECORD_CARD_ACTION", cardData);
  }

  async createRoomBatch(count, boardConfig, cardSet, batchName) {
    if (!functions) throw new Error("Firebase Functions não configurado");
    const callable = httpsCallable(functions, "createRoomBatch");
    const result = await callable({ count, boardConfig, cardSet, batchName });
    return result.data;
  }

  /**
   * Escuta as salas criadas por este anfitrião
   */
  listenToOwnerRooms(ownerId, callback) {
    if (!firestore || !ownerId) return () => {};
    
    const roomsRef = collection(firestore, 'rooms');
    const q = query(roomsRef, where('ownerId', '==', ownerId), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const ownerRooms = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      callback(ownerRooms);
    });
  }

  /**
   * Escuta o histórico de uma sala específica
   */
  listenToRoomHistory(roomId, callback) {
    if (!firestore || !roomId) return () => {};
    
    const historyState = { turns: {}, cards: {} };
    
    const unsubTurns = onSnapshot(
      query(collection(firestore, "roomHistory", roomId, "turns"), orderBy("timestamp", "asc")),
      (snapshot) => {
        const turns = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          turns[doc.id] = { 
            ...data, 
            id: doc.id,
            timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || Date.now())
          };
        });
        historyState.turns = turns;
        callback({ ...historyState });
      }
    );

    const unsubCards = onSnapshot(
      query(collection(firestore, "roomHistory", roomId, "cards"), orderBy("timestamp", "desc")),
      (snapshot) => {
        const cards = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          cards[doc.id] = { 
            ...data, 
            id: doc.id,
            timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || Date.now())
          };
        });
        historyState.cards = cards;
        callback({ ...historyState });
      }
    );

    return () => {
      unsubTurns();
      unsubCards();
    };
  }
}

