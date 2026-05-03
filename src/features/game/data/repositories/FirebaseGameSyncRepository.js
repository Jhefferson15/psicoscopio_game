import { ref, set, onValue, onDisconnect, serverTimestamp } from "firebase/database";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  addDoc,
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
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

    // Separa dados pesados (configuração) do estado dinâmico
    const { boardConfig, cardSet, ...dynamicState } = gameData;

    const roomRef = ref(database, `rooms/${roomId}`);
    
    const initialData = {
      id: roomId,
      ownerId: ownerId || null,
      status: 'waiting',
      createdAt: Date.now(),
      participants: (ownerId && gameData.metadata?.hostRole !== 'observer') 
        ? { [ownerId]: { id: ownerId, name: 'Anfitrião', isOnline: true } } 
        : {}, 
      gameState: dynamicState // Apenas estado dinâmico no RTDB
    };

    await set(roomRef, initialData);

    // Salva configuração pesada no Firestore (escrita única, leitura cacheada)
    if (firestore) {
      try {
        // 1. Metadados para o Dashboard
        const fsRoomRef = doc(firestore, "rooms", roomId);
        await setDoc(fsRoomRef, {
          id: roomId,
          ownerId: ownerId || null,
          status: 'waiting',
          createdAt: firestoreTimestamp(),
          metadata: gameData.metadata || {}
        });

        // 2. Configuração completa da sala (Tabuleiro e Cartas)
        const fsConfigRef = doc(firestore, "roomConfigs", roomId);
        await setDoc(fsConfigRef, {
          boardConfig: boardConfig || null,
          cardSet: cardSet || null,
          createdAt: firestoreTimestamp()
        });
      } catch (fsError) {
        console.error("Erro ao registrar configuração no Firestore:", fsError);
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

    // Após entrar, lê os dados da sala via RTDB (mais eficiente para leitura do estado dinâmico)
    const roomRef = ref(database, `rooms/${roomId}`);
    const snapshot = await new Promise((resolve, reject) => {
      onValue(roomRef, (s) => resolve(s), (error) => reject(error), { onlyOnce: true });
    });

    if (!snapshot.exists()) throw new Error('Sala não encontrada');
    const roomData = snapshot.val();

    // Busca configuração pesada do Firestore
    try {
      const config = await this.getRoomConfig(roomId);
      if (config) {
        roomData.gameState = {
          ...roomData.gameState,
          boardConfig: config.boardConfig,
          cardSet: config.cardSet
        };
      }
    } catch (configError) {
      console.warn("Aviso: Não foi possível carregar configuração do Firestore, usando fallback do RTDB se disponível.", configError);
    }

    return roomData;
  }

  async getRoomConfig(roomId) {
    if (!firestore) return null;
    const docRef = doc(firestore, "roomConfigs", roomId);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
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
    return await this._callGameAction(roomId, "PASS_TURN", { 
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

  /**
   * Listener granular: observa APENAS metadados leves da sala.
   * Evita baixar gameState inteiro a cada mudança de presença ou status.
   * Chama callback com objeto { status, participants, readyPlayers, ownerId, metadata }.
   */
  listenToRoomMeta(roomId, callback) {
    if (!database) return () => {};

    const unsubs = [];
    const meta = { status: null, participants: {}, readyPlayers: {}, ownerId: null, metadata: {} };

    const emit = () => callback({ ...meta });

    const statusRef = ref(database, `rooms/${roomId}/status`);
    unsubs.push(onValue(statusRef, (snap) => {
      meta.status = snap.val();
      emit();
    }));

    const ownerRef = ref(database, `rooms/${roomId}/ownerId`);
    unsubs.push(onValue(ownerRef, (snap) => {
      meta.ownerId = snap.val();
      emit();
    }));

    const participantsRef = ref(database, `rooms/${roomId}/participants`);
    unsubs.push(onValue(participantsRef, (snap) => {
      meta.participants = snap.val() || {};
      emit();
    }));

    const readyRef = ref(database, `rooms/${roomId}/readyPlayers`);
    unsubs.push(onValue(readyRef, (snap) => {
      meta.readyPlayers = snap.val() || {};
      emit();
    }));

    const metaRef = ref(database, `rooms/${roomId}/metadata`);
    unsubs.push(onValue(metaRef, (snap) => {
      meta.metadata = snap.val() || {};
      emit();
    }));

    return () => unsubs.forEach(unsub => unsub());
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

      if (remainingAfterLeave.length === 0 && room.status === 'waiting') {
        // Se for o último e a partida NUNCA começou, apaga a sala
        console.log(`Sala ${roomId} apagada: último jogador saiu do lobby.`);
        await this.deleteRoom(roomId);
      } else {
        // Apenas marca como offline e que saiu manualmente
        const participantRef = ref(database, `rooms/${roomId}/participants/${userId}`);
        const readyRef = ref(database, `rooms/${roomId}/readyPlayers/${userId}`);
        
        await set(participantRef, {
          ...participants[userId],
          isOnline: false,
          hasLeft: true,
          lastSeen: serverTimestamp()
        });
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
      query(collection(firestore, "roomHistory", roomId, "turns"), orderBy("timestamp", "desc"), limit(100)),
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
      query(collection(firestore, "roomHistory", roomId, "cards"), orderBy("timestamp", "desc"), limit(100)),
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

  async saveEvaluation(evaluationData) {
    if (!firestore) throw new Error("Firestore não configurado");
    
    const evaluationsRef = collection(firestore, "evaluations");
    
    const docData = {
      ...evaluationData,
      createdAt: firestoreTimestamp()
    };
    
    await addDoc(evaluationsRef, docData);
  }
}

