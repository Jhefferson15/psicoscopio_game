const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onValueUpdated } = require("firebase-functions/v2/database");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.database();
const fs = admin.firestore();

/**
 * Função interna para passar o turno, agora pula jogadores offline
 */
async function internalPassTurn(roomId, room, reason = null) {
  const gameState = room.gameState || {};
  const players = gameState.players || [];
  if (players.length === 0) return;

  const currentIndex = gameState.currentPlayerIndex;
  const currentPlayer = players[currentIndex];
  const participants = room.participants || {};
  
  // Registro de métricas de tempo
  const turnStartTime = gameState.turnStartTime || 0;
  const now = Date.now();
  const durationSeconds = turnStartTime > 0 ? Math.floor((now - turnStartTime) / 1000) : 0;
  
  const turnMetric = {
    playerId: currentPlayer.id,
    playerName: currentPlayer.name,
    durationSeconds,
    timestamp: admin.database.ServerValue.TIMESTAMP,
    turnIndex: gameState.totalTurns || 0,
    reason: reason || "Normal"
  };

  const turnDuration = gameState.turnDuration || 120;
  let nextIndex = (currentIndex + 1) % players.length;
  
  let updatedPlayers = [...players];
  
  // Loop para encontrar o próximo jogador disponível (online e sem skip)
  // Evita loop infinito se ninguém estiver online (máximo players.length tentativas)
  for (let i = 0; i < players.length; i++) {
    const candidate = updatedPlayers[nextIndex];
    const p = participants[candidate.id];
    const isCandidateOnline = p && p.isOnline === true;

    if (candidate.skipNextTurn || !isCandidateOnline) {
      if (candidate.skipNextTurn) {
        updatedPlayers[nextIndex] = { ...candidate, skipNextTurn: false };
      }
      nextIndex = (nextIndex + 1) % updatedPlayers.length;
      
      if (nextIndex === currentIndex && !isCandidateOnline) break;
    } else {
      break;
    }
  }

  updatedPlayers[nextIndex] = { 
    ...updatedPlayers[nextIndex], 
    timeLeft: turnDuration, 
    lastRoll: null 
  };

  const updates = {
    "gameState/players": updatedPlayers,
    "gameState/currentPlayerIndex": nextIndex,
    "gameState/turnStartTime": admin.database.ServerValue.TIMESTAMP,
    "gameState/turnDuration": turnDuration,
    "gameState/totalTurns": (gameState.totalTurns || 0) + 1
  };

  const roomRef = db.ref(`rooms/${roomId}`);
  await roomRef.update(updates);
  
  await fs.collection("rooms").doc(roomId).update({
    "gameState.totalTurns": (gameState.totalTurns || 0) + 1,
    status: room.status || "playing"
  });

  await fs.collection("roomHistory").doc(roomId).collection("turns").add({
    ...turnMetric,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * Ação centralizada para mecânicas de jogo
 */
exports.gameAction = onCall({ 
  region: "us-central1",
  cors: true 
}, async (request) => {
  const { roomId, action, data } = request.data;
  const uid = request.auth?.uid;

  console.log(`[gameAction] Ação: ${action}, Sala: ${roomId}, Usuário: ${uid}`);

  if (!uid) {
    throw new HttpsError("unauthenticated", "Usuário deve estar autenticado.");
  }

  if (!roomId) {
    throw new HttpsError("invalid-argument", "ID da sala é obrigatório.");
  }

  const roomRef = db.ref(`rooms/${roomId}`);
  const snapshot = await roomRef.once("value");

  if (!snapshot.exists()) {
    throw new HttpsError("not-found", "Sala não encontrada.");
  }

  const room = snapshot.val();
  const isOwner = room.ownerId === uid;
  const isParticipant = room.participants && room.participants[uid];

  if (!isParticipant && action !== "JOIN_ROOM") {
    throw new HttpsError("permission-denied", "Você não é um participante desta sala.");
  }

  try {
    switch (action) {
      case "START_GAME": {
        const isObserverRoom = room.metadata?.hostRole === "observer";
        if (!isOwner && !isObserverRoom) {
          throw new HttpsError("permission-denied", "Apenas o anfitrião pode iniciar o jogo.");
        }
        
        await roomRef.update({
          status: data.status || "playing",
          "gameState/players": data.players,
          "gameState/currentPlayerIndex": 0,
          "gameState/turnStartTime": admin.database.ServerValue.TIMESTAMP,
          "gameState/turnDuration": data.turnDuration || 120,
          "gameState/playerAttributes": data.playerAttributes || {},
          "gameState/isRolling": false,
          "metadata/startedAt": admin.database.ServerValue.TIMESTAMP
        });
        return { success: true };
      }

      case "PASS_TURN": {
        const gameState = room.gameState || {};
        const players = gameState.players || [];
        if (players.length === 0) throw new HttpsError("failed-precondition", "Jogo não inicializado.");

        const currentIndex = gameState.currentPlayerIndex;
        const currentPlayer = players[currentIndex];
        const isCurrentPlayer = currentPlayer && currentPlayer.id === uid;
        
        const participants = room.participants || {};
        const isCurrentPlayerOnline = participants[currentPlayer?.id]?.isOnline !== false;

        // Permite passar o turno se for o próprio jogador, o dono da sala,
        // ou se o jogador atual estiver offline (qualquer um pode destravar).
        if (!isCurrentPlayer && !isOwner && isCurrentPlayerOnline) {
          throw new HttpsError("permission-denied", "Não é o seu turno e o jogador atual está online.");
        }

        await internalPassTurn(roomId, room, data.reason);
        return { success: true };
      }

      case "RECORD_CARD_ACTION": {
        const cardAction = {
          playerId: uid,
          playerName: room.participants[uid]?.name || "Desconhecido",
          cardId: data.cardId,
          cardType: data.cardType,
          cardText: data.cardText,
          timestamp: admin.database.ServerValue.TIMESTAMP
        };
        await fs.collection("roomHistory").doc(roomId).collection("cards").add({
          ...cardAction,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
      }

      case "SYNC_STATE":
        await roomRef.child("gameState").update({
          ...data,
          lastActionBy: uid,
          serverTimestamp: admin.database.ServerValue.TIMESTAMP
        });
        return { success: true };

      case "UPDATE_STATUS": {
        const isObsRoom = room.metadata?.hostRole === "observer";
        if (!isOwner && !isObsRoom) {
          throw new HttpsError("permission-denied", "Apenas o anfitrião pode mudar o status.");
        }
        
        const statusUpdates = { status: data.status };
        if (data.status === "playing") {
          statusUpdates["gameState/turnStartTime"] = admin.database.ServerValue.TIMESTAMP;
        }
        
        await roomRef.update(statusUpdates);
        return { success: true };
      }

      case "JOIN_ROOM": {
        const participants = room.participants || {};
        const participantIds = Object.keys(participants);
        
        // 1. Bloqueio: Não permite entrar se a partida foi finalizada
        if (room.status === "finished") {
          throw new HttpsError("failed-precondition", "Esta partida já foi encerrada e não permite novos acessos.");
        }

        // 2. Se já é participante e a partida está em andamento, permite reconectar
        if (participants[uid]) return { status: "already_in" };
        
        // 3. Bloqueio: Não permite novos jogadores se a partida já começou
        if (room.status !== "waiting") {
          throw new HttpsError("failed-precondition", "A partida já começou e você não faz parte dela.");
        }

        if (participantIds.length >= 4) throw new HttpsError("resource-exhausted", "Sala cheia.");

        const userData = {
          id: uid,
          name: data.name || `Jogador ${participantIds.length + 1}`,
          photoURL: data.photoURL || null,
          isOnline: true,
          lastSeen: admin.database.ServerValue.TIMESTAMP
        };

        await roomRef.child("participants").child(uid).set(userData);
        
        await fs.collection("rooms").doc(roomId).update({
          participantCount: participantIds.length + 1,
          participantsSummary: admin.firestore.FieldValue.arrayUnion({
            id: uid,
            name: userData.name,
            photoURL: userData.photoURL
          })
        });

        return { success: true };
      }

      default:
        throw new HttpsError("invalid-argument", "Ação inválida.");
    }
  } catch (error) {
    console.error(`[gameAction Error] ${action}:`, error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", error.message);
  }
});

/**
 * Trigger para monitorar saída de jogadores
 */
exports.onPlayerPresenceChange = onValueUpdated("/rooms/{roomId}/participants/{userId}/isOnline", async (event) => {
  const { roomId, userId } = event.params;
  const isOnline = event.data.after.val();
  const wasOnline = event.data.before.val();

  // Só nos interessa quando o jogador sai (online: true -> false)
  if (isOnline !== false || wasOnline !== true) return null;

  console.log(`[PresenceChange] Jogador ${userId} saiu da sala ${roomId}`);

  const roomRef = db.ref(`rooms/${roomId}`);
  const snapshot = await roomRef.once("value");
  if (!snapshot.exists()) return null;

  const room = snapshot.val();
  if (room.status !== "playing") return null;

  const participants = room.participants || {};
  const player = participants[userId];
  const playerName = player ? player.name : "Desconhecido";

  // 1. Se foi saída manual (hasLeft: true), pula o turno imediatamente se for a vez dele
  if (player && player.hasLeft === true) {
    const gameState = room.gameState || {};
    const players = gameState.players || [];
    const currentIndex = gameState.currentPlayerIndex;
    const currentPlayer = players[currentIndex];

    if (currentPlayer && currentPlayer.id === userId) {
      console.log(`[PresenceChange] Pulo imediato: ${playerName} saiu manualmente.`);
      await internalPassTurn(roomId, room, "Saída Manual");
    }
  }

  // 2. Verifica se todos saíram
  const anyOnline = Object.values(participants).some(p => p.id !== userId && p.isOnline === true);
  if (!anyOnline) {
    console.log(`[PresenceChange] Todos saíram. Finalizando sala ${roomId}`);
    await roomRef.update({ status: "finished" });
    await fs.collection("rooms").doc(roomId).update({ status: "finished" });
  }

  return null;
});


/**
 * Criação de múltiplas salas para observadores (ex: professores)
 */
exports.createRoomBatch = onCall({ region: "us-central1", cors: true }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Login necessário.");

  const { count, boardConfig, cardSet, batchName } = request.data;
  const numRooms = Math.min(Math.max(parseInt(count) || 1, 1), 10); // Max 10 por vez
  
  const batchId = `batch-${Date.now()}`;
  const roomIds = [];

  for (let i = 0; i < numRooms; i++) {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const roomData = {
      id: roomId,
      ownerId: uid,
      status: "waiting",
      createdAt: admin.database.ServerValue.TIMESTAMP,
      metadata: {
        hostRole: "observer",
        batchId: batchId,
        batchName: batchName || "Turma Principal"
      },
      gameState: {
        boardConfig: boardConfig,
        cardSet: cardSet,
        players: [],
        currentPlayerIndex: 0,
        isRolling: false
      }
    };
    await db.ref(`rooms/${roomId}`).set(roomData);
    
    // Espelha metadados essenciais no Firestore para listagem eficiente no Dashboard
    await fs.collection("rooms").doc(roomId).set({
      id: roomId,
      ownerId: uid,
      status: "waiting",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      metadata: roomData.metadata
    });

    roomIds.push(roomId);
  }

  return { batchId, roomIds };
});
