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
  async createRoom(gameData, ownerId, ownerName) {
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
        ? { [ownerId]: { id: ownerId, name: ownerName || 'Anfitrião', isOnline: true } } 
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

  // ============================================================
  // PROTECAO CRITICA CONTRA DOS E SOBRECARGA DO SERVIDOR FIREBASE
  // ============================================================
  // Este metodo e a unica porta de entrada para todas as Cloud Functions.
  // NUNCA remova o limite de tentativas (MAX_RETRIES = 5).
  // NUNCA remova o backoff exponencial (dobra a cada falha).
  // NUNCA chame Cloud Functions diretamente sem passar por aqui.
  // Cada chamada custa dinheiro (escrita no Firebase Firestore/RTDB).
  // Um loop sem limite pode gerar centenas de chamadas por segundo,
  // causar bloqueio de conta e custo financeiro imprevisivel.
  // ============================================================
  async _callGameAction(roomId, action, data = {}) {
    if (!functions) throw new Error("Firebase Functions nao configurado");

    // LIMITE ABSOLUTO: Maximo 5 tentativas por operacao. NAO ALTERE ESTE NUMERO.
    const MAX_RETRIES = 5;
    // Atraso base em ms. Progressao: 500ms, 1s, 2s, 4s, 8s. NAO REMOVA.
    const BACKOFF_MS = 500;

    const gameAction = httpsCallable(functions, 'gameAction');

    let lastError;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await gameAction({ roomId, action, data });
        return result.data;
      } catch (error) {
        lastError = error;
        // Erros de negocio nao sao recuperaveis: permissao negada, argumento invalido, nao encontrado
        const isNotRetryable = [
          'functions/permission-denied',
          'functions/invalid-argument',
          'functions/not-found',
          'functions/already-exists',
          'functions/unauthenticated'
        ].includes(error.code);

        if (isNotRetryable) {
          console.error(`[GameAction] Erro definitivo em "${action}":`, error.message);
          throw error;
        }

        if (attempt < MAX_RETRIES) {
          // Backoff exponencial: recua progressivamente para proteger o servidor
          const delay = BACKOFF_MS * Math.pow(2, attempt - 1);
          console.warn(`[GameAction] Falha em "${action}" (tentativa ${attempt}/${MAX_RETRIES}). Aguardando ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // LIMITE ATINGIDO: Para imediatamente. Nao tente novamente.
          // Esta linha e a barreira final contra DOS. NAO REMOVA.
          console.error(`[GameAction] LIMITE DE TENTATIVAS ATINGIDO para "${action}". Abortando para proteger o servidor.`);
        }
      }
    }
    throw lastError;
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
      photoURL: null 
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

  async updateRoomConfig(roomId, config) {
    if (!firestore || !roomId) return;
    try {
      const docRef = doc(firestore, "roomConfigs", roomId);
      await setDoc(docRef, {
        ...config,
        updatedAt: firestoreTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Erro ao atualizar configuração da sala:", error);
    }
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

  async startTurn(roomId, playerIndex, duration, currentTurn) {
    if (!functions || !roomId) return;
    // O startTurn agora é mapeado para PASS_TURN no servidor,
    // que lida com a lógica de próximo jogador e timestamps.
    return await this._callGameAction(roomId, "PASS_TURN", { 
      playerIndex, 
      turnDuration: duration,
      currentTurn
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
  listenToRoomConfig(roomId, callback) {
    if (!firestore || !roomId) return () => {};
    const docRef = doc(firestore, "roomConfigs", roomId);
    return onSnapshot(docRef, 
      (snap) => {
        if (snap.exists()) {
          callback(snap.data());
        }
      },
      (error) => {
        console.error("Erro ao escutar configuração da sala:", error);
      }
    );
  }

  // ============================================================
  // ATENCAO: Este listener usa debounce de 150ms para consolidar
  // mudancas simultaneas em uma unica chamada. NAO remova o debounce.
  // Antes havia 5 listeners separados que emitiam em cascata a cada
  // mudanca de presenca, gerando rajadas de 5 eventos por atualizacao.
  // ============================================================
  listenToRoomMeta(roomId, callback) {
    if (!database) return () => {};

    let debounceTimer = null;
    const meta = { status: null, participants: {}, readyPlayers: {}, ownerId: null, metadata: {} };

    // Debounce: consolida multiplas mudancas em uma unica chamada ao callback.
    // Isso reduz o numero de eventos de N mudancas simultaneas para 1.
    const emit = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => callback({ ...meta }), 150);
    };

    const roomRef = ref(database, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.val();
      meta.status = data.status || null;
      meta.ownerId = data.ownerId || null;
      meta.participants = data.participants || {};
      meta.readyPlayers = data.readyPlayers || {};
      meta.metadata = data.metadata || {};
      emit();
    });

    return () => {
      clearTimeout(debounceTimer);
      unsubscribe();
    };
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
    if (!firestore || !ownerId) {
      console.warn("Firestore não configurado ou ownerId ausente. Retornando lista vazia.");
      if (callback) callback([]);
      return () => {};
    }
    
    try {
      const roomsRef = collection(firestore, 'rooms');
      const q = query(roomsRef, where('ownerId', '==', ownerId));
      
      return onSnapshot(q, 
        (snapshot) => {
          const ownerRooms = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              // Converte Timestamp para milissegundos para evitar erros de renderização
              createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now())
            };
          });
          callback(ownerRooms);
        },
        (error) => {
          console.error("Erro ao escutar salas do dono:", error);
          // IMPORTANTE: Chama o callback com lista vazia para liberar o loading em caso de erro (ex: índice faltando)
          if (callback) callback([]);
        }
      );
    } catch (error) {
      console.error("Erro ao configurar listener de salas:", error);
      callback([]);
      return () => {};
    }
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
      },
      (error) => {
        console.error("Erro ao escutar histórico de turnos:", error);
        // Mantém o estado atual mas notifica o callback se necessário
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
      },
      (error) => {
        console.error("Erro ao escutar histórico de cartas:", error);
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
  async saveActionEvaluation(data) {
    if (!firestore) return;
    try {
      const evaluationsRef = collection(firestore, "actionEvaluations");
      await addDoc(evaluationsRef, {
        ...data,
        createdAt: firestoreTimestamp()
      });
    } catch (error) {
      console.error("Erro ao salvar avaliação de ação:", error);
    }
  }
}


