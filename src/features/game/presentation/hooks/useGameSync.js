import { useEffect } from 'react';
import { Player } from '../../domain/entities/Player';
import { BoardConfig } from '../../domain/entities/BoardConfig';
import { CardSet } from '../../domain/entities/CardSet';

// ============================================================
// PROTECAO CONTRA DOS E SOBRECARGA DE SERVIDOR
// ============================================================
// Este arquivo gerencia TODOS os listeners de tempo real do Firebase.
// REGRAS CRITICAS - NUNCA REMOVA ESTES COMENTARIOS:
//
// 1. CIRCUIT BREAKER: Cada listener possui um contador de eventos.
//    Se receber mais de MAX_EVENTS_PER_SECOND eventos em 1 segundo,
//    o listener para e exibe erro. Isso impede loops infinitos de
//    atualizacao que geram centenas de leituras por segundo.
//
// 2. VERIFICACOES DE IGUALDADE: Antes de chamar qualquer setter
//    do React, verificamos se o valor realmente mudou. Atualizar
//    estado com o mesmo valor nao muda o DOM mas dispara re-renders
//    que podem criar novos efeitos colaterais e loops.
//
// 3. RETORNO DE CLEANUP: TODO useEffect com listener DEVE retornar
//    a funcao de unsubscribe. Nao fazer isso cria vazamentos de
//    memoria e multiplos listeners ativos para o mesmo dado,
//    multiplicando o numero de leituras no Firebase.
//
// Um loop sem protecao pode gerar +200 leituras/segundo e causar
// bloqueio de conta Firebase e custo financeiro imprevisivel.
// ============================================================

// Maximo de eventos de um listener por segundo antes de parar.
// Valor extremamente conservador para evitar custos e DoS: 4x/s.
const MAX_EVENTS_PER_SECOND = 4;

/**
 * Cria um circuit breaker para um listener do Firebase.
 * Se o callback for chamado mais de MAX_EVENTS_PER_SECOND vezes em 1 segundo,
 * bloqueia novas chamadas e loga um erro critico.
 * NAO REMOVA esta funcao. E a barreira primaria contra DOS por listener.
 */
function createCircuitBreaker(listenerName) {
  let eventCount = 0;
  let windowStart = Date.now();
  let isOpen = false; // "aberto" = circuit breaker disparado (bloqueado)

  return function guard(callback) {
    return function(...args) {
      const now = Date.now();

      // Reseta a janela de contagem a cada segundo
      if (now - windowStart > 1000) {
        eventCount = 0;
        windowStart = now;
        isOpen = false; // Recupera apos 1 segundo sem sobrecarga
      }

      eventCount++;

      if (isOpen) {
        // Circuit breaker ativo: bloqueia sem logar para nao sobrecarregar o console
        return;
      }

      if (eventCount > MAX_EVENTS_PER_SECOND) {
        isOpen = true;
        // ALERTA CRITICO: este log indica um loop de atualizacao no Firebase.
        // Investigar imediatamente o que esta causando tantos eventos.
        console.error(
          `[CircuitBreaker] SOBRECARGA DETECTADA no listener "${listenerName}": ` +
          `${eventCount} eventos em 1 segundo. Listener bloqueado por 1s para proteger o servidor. ` +
          `INVESTIGAR CAUSA IMEDIATAMENTE.`
        );
        return;
      }

      callback(...args);
    };
  };
}

export const useGameSync = ({
  isOnline,
  roomId,
  user,
  syncRepository,
  setPlayers,
  setCurrentPlayerIndex,
  setLastDiceRoll,
  setIsRolling,
  setPlayerAttributes,
  setTurnStartTime,
  setActiveBoardConfig,
  setActiveCardSet,
  setRoomStatus,
  setRoomParticipants,
  setReadyPlayers,
  setOwnerId,
  setCurrentScreen,
  currentScreen,
  setCardHistory,
  activeBoardConfig,
  setAtelierContext,
  setActiveVerification,
  joinOnlineGame,
  isMovingRef,
  setCurrentTurn,
  isTurnBeingPassedRef,
  setTurnDuration,
}) => {

  // EFEITO 1: Listener de gameState (estado dinamico do jogo - RTDB)
  // Recebe: posicoes dos jogadores, turno atual, dados do dado, timer
  // NAO recebe: configuracao de tabuleiro (esta no Firestore - Efeito 4)
  useEffect(() => {
    if (!isOnline || !roomId) return;

    // Circuit breaker especifico para este listener
    const guard = createCircuitBreaker('gameState');

    const unsubscribe = syncRepository.listenToGameState(roomId, guard((newState) => {
      if (newState.players) {
        // Nao atualiza posicoes durante animacao de movimento local
        if (!isMovingRef || !isMovingRef.current) {
          setPlayers(prev => {
            const next = newState.players.map(p =>
              new Player(p.id, p.name, p.color, p.position, p.timeLeft, p.lastRoll, p.skipNextTurn)
            );
            // Verificacao de igualdade para evitar re-render desnecessario
            const changed = prev.some((p, i) =>
              p.position !== next[i]?.position ||
              p.id !== next[i]?.id ||
              p.skipNextTurn !== next[i]?.skipNextTurn
            );
            return changed ? next : prev;
          });
        }
      }

      if (newState.currentPlayerIndex !== undefined) {
        setCurrentPlayerIndex(prev => prev !== newState.currentPlayerIndex ? newState.currentPlayerIndex : prev);
      }

      if (newState.currentTurn !== undefined) {
        setCurrentTurn(prev => {
          if (prev !== newState.currentTurn) {
            // Quando o turno muda no servidor, libera a trava local de passagem de turno
            if (isTurnBeingPassedRef) isTurnBeingPassedRef.current = false;
            return newState.currentTurn;
          }
          return prev;
        });
      }

      if (newState.lastDiceRoll !== undefined) {
        setLastDiceRoll(prev => prev !== newState.lastDiceRoll ? newState.lastDiceRoll : prev);
      }

      if (newState.isRolling !== undefined) {
        setIsRolling(prev => prev !== newState.isRolling ? newState.isRolling : prev);
      }

      if (newState.playerAttributes) {
        setPlayerAttributes(newState.playerAttributes);
      }

      if (newState.turnStartTime !== undefined && newState.turnStartTime !== null) {
        // Libera a trava de passagem de turno quando o servidor confirma novo turno
        if (isTurnBeingPassedRef) isTurnBeingPassedRef.current = false;
        setTurnStartTime(prev => prev !== newState.turnStartTime ? newState.turnStartTime : prev);
      }

      if (newState.turnDuration !== undefined) {
        setTurnDuration(prev => prev !== newState.turnDuration ? newState.turnDuration : prev);
      }

      // Sincronizacao de Verificacoes Ativas (Popups de votacao MEEGA+)
      // IMPORTANTE: activeVerification controla os popups de confirmacao de todos os jogadores.
      // Nao remova esta sincronizacao ou os popups deixarao de aparecer para convidados.
      if (newState.activeVerification !== undefined) {
        setActiveVerification(prev => {
          const prevStr = JSON.stringify(prev);
          const nextStr = JSON.stringify(newState.activeVerification);
          return prevStr !== nextStr ? newState.activeVerification : prev;
        });
      }

      if (newState.roomStatus !== undefined) {
        setRoomStatus(prev => prev !== newState.roomStatus ? newState.roomStatus : prev);
      }
    }));

    return () => unsubscribe();
    // Dependencias estaveis: apenas inicializacao. turnDuration e isMovingRef sao refs/primitivos.
  }, [isOnline, roomId, syncRepository]); // eslint-disable-line react-hooks/exhaustive-deps

  // EFEITO 2: Listener de metadados da sala (status, participantes)
  useEffect(() => {
    if (!isOnline || !roomId) return;

    const guard = createCircuitBreaker('roomMeta');

    const unsubscribeRoomMeta = syncRepository.listenToRoomMeta(roomId, guard((room) => {
      if (!room) return;

      setRoomStatus(prev => prev !== (room.status || 'waiting') ? (room.status || 'waiting') : prev);

      const rawParticipants = room.participants || {};
      const normalizedParticipants = {};
      Object.values(rawParticipants).forEach(val => {
        if (typeof val === 'string') {
          normalizedParticipants[val] = { id: val, name: 'Convidado', photoURL: null };
        } else if (val && typeof val === 'object' && val.id) {
          normalizedParticipants[val.id] = val;
        }
      });

      setRoomParticipants(normalizedParticipants);
      setReadyPlayers(room.readyPlayers || {});
      setOwnerId(prev => prev !== (room.ownerId || null) ? (room.ownerId || null) : prev);

      // Redirecionamento para tela de jogo
      // So redireciona se a sala estiver em jogo E o jogador estiver em tela de espera
      if (room.status === 'playing' && (currentScreen === 'lobby' || currentScreen === 'card_creation' || currentScreen === 'waiting_players')) {
        setCurrentScreen('game');
      }

      // Redirecionamento para criacao de cartas
      const isSetupStatus = room.status === 'setup_cards' || room.status === 'card_creation';
      const isAtCreationScreen = currentScreen === 'card_creation' || currentScreen === 'waiting_players';

      if (isSetupStatus && !isAtCreationScreen) {
        const mechanics = activeBoardConfig?.mechanics || {};
        if (mechanics.enableCardCreationStep === true || room.status === 'card_creation') {
          setAtelierContext(room.status === 'setup_cards' ? 'game_start' : 'missing_cards');
          setCurrentScreen('card_creation');
        } else if (room.status === 'setup_cards') {
          setCurrentScreen('game');
        }
      }
    }));

    return () => unsubscribeRoomMeta();
  }, [isOnline, roomId, currentScreen, activeBoardConfig, syncRepository, setRoomStatus, setRoomParticipants, setReadyPlayers, setOwnerId, setCurrentScreen, setAtelierContext]);

  // EFEITO 3: Presenca do jogador (heartbeat)
  useEffect(() => {
    if (!isOnline || !roomId || !user?.id) return;
    const unsubscribePresence = syncRepository.updatePlayerPresence(roomId, user.id);
    return () => {
      if (typeof unsubscribePresence === 'function') unsubscribePresence();
    };
  }, [isOnline, roomId, user?.id, syncRepository]);

  // EFEITO 4: Configuracao da sala via Firestore (tabuleiro + baralho)
  // Esta e a FONTE UNICA DE VERDADE para o tabuleiro.
  // O tabuleiro NUNCA deve ser carregado do RTDB para evitar conflitos.
  // O Firestore garante que todos os jogadores vejam o mesmo tabuleiro do anfitriao.
  useEffect(() => {
    if (!isOnline || !roomId) return;

    const guard = createCircuitBreaker('roomConfig');

    const unsubscribeConfig = syncRepository.listenToRoomConfig(roomId, guard((config) => {
      if (!config) return;

      if (config.boardConfig) {
        setActiveBoardConfig(prev => {
          // So atualiza se o ID do tabuleiro for diferente (evita re-render por objeto novo)
          if (!prev || prev.id !== config.boardConfig.id || prev.name !== config.boardConfig.name) {
            return BoardConfig.fromJSON(config.boardConfig);
          }
          return prev;
        });
      }

      if (config.cardSet) {
        setActiveCardSet(prev => {
          if (!prev || prev.id !== config.cardSet.id || prev.name !== config.cardSet.name) {
            return CardSet.fromJSON(config.cardSet);
          }
          return prev;
        });
      }
    }));

    return () => unsubscribeConfig();
  }, [isOnline, roomId, syncRepository, setActiveBoardConfig, setActiveCardSet]);

  // EFEITO 5: Historico de cartas
  useEffect(() => {
    if (!isOnline || !roomId) return;

    const guard = createCircuitBreaker('cardHistory');

    const unsubscribeHistory = syncRepository.listenToRoomHistory(roomId, guard((history) => {
      if (history && history.cards) {
        const sortedCards = Object.values(history.cards)
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setCardHistory(sortedCards);
      }
    }));

    return () => unsubscribeHistory();
  }, [isOnline, roomId, syncRepository, setCardHistory]);

  // Persistencia da sala (reconexao no F5)
  useEffect(() => {
    if (roomId) {
      syncRepository.saveActiveRoomId(roomId);
    }
  }, [roomId, syncRepository]);

  useEffect(() => {
    const savedRoomId = syncRepository.getActiveRoomId();
    if (savedRoomId && user && !roomId && !isOnline) {
      joinOnlineGame(savedRoomId);
    }
  }, [user, roomId, isOnline, joinOnlineGame, syncRepository]);

  // isTurnBeingPassedRef e gerenciado externamente (GameContext) e passado como prop
  return {};
};
