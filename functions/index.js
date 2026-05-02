const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.database();

/**
 * Ação centralizada para mecânicas de jogo
 * Minimiza o tempo de CPU mantendo a lógica direta e sem bibliotecas pesadas.
 */
exports.gameAction = onCall({ 
  region: "us-central1",
  cors: true // Permite chamadas de diferentes origens (importante para localhost)
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
        
        if (!isCurrentPlayer && !isOwner) {
          throw new HttpsError("permission-denied", "Não é o seu turno.");
        }

        // Registro de métricas de tempo
        const turnStartTime = gameState.turnStartTime || 0;
        const now = Date.now();
        const durationSeconds = turnStartTime > 0 ? Math.floor((now - turnStartTime) / 1000) : 0;
        
        const turnMetric = {
          playerId: currentPlayer.id,
          playerName: currentPlayer.name,
          durationSeconds,
          timestamp: admin.database.ServerValue.TIMESTAMP,
          turnIndex: gameState.totalTurns || 0
        };

        const turnDuration = data.turnDuration || gameState.turnDuration || 120;
        let nextIndex = (currentIndex + 1) % players.length;
        
        let updatedPlayers = [...players];
        const nextPlayer = updatedPlayers[nextIndex];

        if (nextPlayer && nextPlayer.skipNextTurn) {
          updatedPlayers[nextIndex] = { ...nextPlayer, skipNextTurn: false };
          nextIndex = (nextIndex + 1) % updatedPlayers.length;
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

        await roomRef.update(updates);
        // Grava no histórico (separado para evitar sobrecarga do estado principal)
        await roomRef.child("history/turns").push(turnMetric);
        
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
        await roomRef.child("history/cards").push(cardAction);
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
        // Se estiver iniciando o jogo propriamente dito, reseta o timer
        if (data.status === "playing") {
          statusUpdates["gameState/turnStartTime"] = admin.database.ServerValue.TIMESTAMP;
        }
        
        await roomRef.update(statusUpdates);
        return { success: true };
      }

      case "JOIN_ROOM": {
        const participants = room.participants || {};
        const participantIds = Object.keys(participants);
        
        if (participants[uid]) return { status: "already_in" };
        if (participantIds.length >= 4) throw new HttpsError("resource-exhausted", "Sala cheia.");

        const userData = {
          id: uid,
          name: data.name || `Jogador ${participantIds.length + 1}`,
          photoURL: data.photoURL || null,
          isOnline: true,
          lastSeen: admin.database.ServerValue.TIMESTAMP
        };

        await roomRef.child("participants").child(uid).set(userData);
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
    roomIds.push(roomId);
  }

  return { batchId, roomIds };
});
