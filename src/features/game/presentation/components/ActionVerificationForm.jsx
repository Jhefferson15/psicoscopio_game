import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, ShieldCheck, HelpCircle, RotateCcw } from 'lucide-react';
import { useGame } from '../state/useGame';
import { useAuth } from '../../../auth/presentation/state/useAuth';
import { LIKERT_SCALE } from '../../domain/constants/meegaQuestions';
import './ActionVerificationForm.css';

const VERIFICATION_QUESTIONS = {
  reflexao: "A reflexão compartilhada foi sincera e autêntica?",
  desafio: "O desafio proposto foi cumprido com sucesso?",
  memoria: "A memória compartilhada foi clara e precisa?",
  experiencia: "A experiência foi relatada de forma genuína?",
  sorte: "O evento de sorte/revés foi aceito e integrado ao jogo?",
  especial: "A ação especial da casa foi executada corretamente?",
  custom: "A ação da carta customizada foi realizada conforme o texto?"
};

export const ActionVerificationForm = () => {
  const { 
    activeVerification, 
    roomParticipants, 
    roomId, 
    syncRepository,
    players,
    roomStatus,
    isOnline,
    setActiveVerification
  } = useGame();
  
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredValue, setHoveredValue] = useState(null);

  // Filtra participantes para incluir todos os jogadores mas excluir observadores
  const participantsArray = useMemo(() => {
    return Object.values(roomParticipants || {}).filter(p => !p.isObserver);
  }, [roomParticipants]);

  const { playerId, cardType, responses = {}, cardText, recipientId } = activeVerification || {};
  const targetPlayer = players.find(p => p.id === playerId);

  const question = useMemo(() => {
    if (!activeVerification) return '';
    if (recipientId) {
      const recipient = players.find(p => p.id === recipientId);
      return `O(a) ${recipient?.name} se identificou ou compreendeu o que foi compartilhado por ${targetPlayer?.name}?`;
    }
    return VERIFICATION_QUESTIONS[cardType] || VERIFICATION_QUESTIONS.custom;
  }, [activeVerification, recipientId, cardType, targetPlayer?.name, players]);

  // Se não houver verificação ativa ou o status não for este, não renderiza
  if (roomStatus !== 'verifying_action' || !activeVerification) return null;

  const totalParticipants = participantsArray.length;
  const responsesCount = Object.keys(responses).length;
  const pendingCount = totalParticipants - responsesCount;

  const myResponse = isOnline ? responses[user?.id] : undefined;
  const hasResponded = isOnline ? (myResponse !== undefined) : (responsesCount >= totalParticipants);

  const pendingParticipants = participantsArray.filter(p => responses[p.id] === undefined);
  const currentOfflineVoter = !isOnline && pendingParticipants.length > 0 ? pendingParticipants[0] : null;

  const handleVote = async (value) => {
    if (isSubmitting || hasResponded) return;
    
    setIsSubmitting(true);
    try {
      if (isOnline && roomId) {
        const updatedResponses = {
          ...responses,
          [user.id]: value
        };
        // Atualiza no RTDB
        await syncRepository.updateGameState(roomId, {
          "activeVerification/responses": updatedResponses
        });
      } else if (currentOfflineVoter) {
        // No modo offline, registramos o voto para o jogador atual da lista de pendentes
        const updatedResponses = {
          ...responses,
          [currentOfflineVoter.id]: value
        };

        setActiveVerification({
          ...activeVerification,
          responses: updatedResponses
        });
      }

    } catch (error) {
      console.error("Erro ao enviar voto:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUndoVote = async () => {
    if (isSubmitting || !hasResponded || pendingCount === 0) return;
    
    setIsSubmitting(true);
    try {
      if (isOnline && roomId) {
        const updatedResponses = { ...responses };
        delete updatedResponses[user?.id];

        // Atualiza no RTDB removendo especificamente a resposta do usuário
        await syncRepository.updateGameState(roomId, {
          "activeVerification/responses": updatedResponses
        });
      } else {
        // No modo offline, limpamos todas as respostas
        setActiveVerification({
          ...activeVerification,
          responses: {}
        });
      }

    } catch (error) {
      console.error("Erro ao desfazer voto:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResponseLabel = (value) => {
    return LIKERT_SCALE.find(s => s.value === value)?.label || "";
  };

  return (
    <motion.div 
      className="verification-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="verification-ambient-glow" style={{ '--accent': targetPlayer?.color || '#7B4BB1' }}></div>
      
      <motion.div 
        className="verification-card glass-panel"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <header className="verification-header">
          <div className="status-badge">
            <ShieldCheck size={16} />
            <span>Validação Coletiva</span>
          </div>
          <div className="timer-paused-indicator">
            <div className="pulse-dot"></div>
            Tempo Pausado
          </div>
        </header>

        <div className="verification-body">
          <div className="target-player-info">
             <div className="player-avatar-large" style={{ backgroundColor: targetPlayer?.color }}>
                {targetPlayer?.name?.charAt(0)}
             </div>
             {activeVerification.recipientId ? (
               <div className="share-flow-info">
                 <div className="player-meta">
                    <h3>{targetPlayer?.name}</h3>
                    <p>está compartilhando com</p>
                 </div>
                 <div className="share-arrow">→</div>
                 <div className="recipient-mini">
                    <div className="mini-avatar" style={{ backgroundColor: players.find(p => p.id === activeVerification.recipientId)?.color }}>
                      {players.find(p => p.id === activeVerification.recipientId)?.name?.charAt(0)}
                    </div>
                    <strong>{players.find(p => p.id === activeVerification.recipientId)?.name}</strong>
                 </div>
               </div>
             ) : (
               <div className="player-meta">
                  <h3>{targetPlayer?.name}</h3>
                  <p>realizou uma ação de <strong>{cardType.toUpperCase()}</strong></p>
               </div>
             )}
          </div>

          <div className="card-content-preview">
            <MessageCircle size={18} className="quote-icon" />
            {typeof cardText === 'string' && cardText.startsWith('data:image') ? (
              <div className="verification-image-container">
                <img src={cardText} alt="Conteúdo compartilhado" className="verification-image" />
                <p className="image-caption"><em>Conteúdo Visual do Ateliê</em></p>
              </div>
            ) : (
              <p>"{cardText}"</p>
            )}
          </div>


          <div className="question-section">
             <HelpCircle size={24} className="question-icon" />
             <h2>{question}</h2>
             {!isOnline && currentOfflineVoter && (
               <div className="current-voter-label" style={{ borderLeft: `4px solid ${players.find(p => p.id === currentOfflineVoter.id)?.color || 'var(--accent)'}` }}>
                 Vez de: <strong>{currentOfflineVoter.name}</strong>
               </div>
             )}
          </div>

          {!hasResponded ? (
            <div className="vote-scale-container">
               <div className="likert-scale">
                  {LIKERT_SCALE.map((option) => (
                    <button
                      key={option.value}
                      className={`likert-option ${hoveredValue >= option.value ? 'hovered' : ''}`}
                      onClick={() => handleVote(option.value)}
                      onMouseEnter={() => setHoveredValue(option.value)}
                      onMouseLeave={() => setHoveredValue(null)}
                      disabled={isSubmitting}
                      title={option.label}
                    >
                      <div className="option-circle">
                        {option.value}
                      </div>
                      <span className="option-label-mobile">{option.label}</span>
                    </button>
                  ))}
               </div>
               <div className="current-selection-label">
                  {hoveredValue ? getResponseLabel(hoveredValue) : "Selecione uma opção"}
               </div>
            </div>
          ) : (
            <div className="wait-feedback">
               <motion.div 
                 className="feedback-icon-scale"
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
               >
                 <div className="selected-value-badge">
                    {myResponse}
                 </div>
               </motion.div>
               <p>Sua avaliação: <strong>{getResponseLabel(myResponse)}</strong></p>
               
               {pendingCount > 0 && (
                 <button 
                  className="btn-undo-vote" 
                  onClick={handleUndoVote}
                  disabled={isSubmitting}
                 >
                   <RotateCcw size={14} />
                   <span>Alterar meu voto</span>
                 </button>
               )}

               <span className="wait-label">
                 {pendingCount > 0 
                   ? `Aguardando ${pendingCount} jogador(es)...` 
                   : "Processando resultados..."}
               </span>
            </div>
          )}
        </div>


        <footer className="verification-footer">
           <div className="progress-stats">
              <Users size={16} />
              <span>{responsesCount} de {totalParticipants} votos</span>
           </div>
           <div className="participants-progress">
              {participantsArray.map(p => (
                <div 
                  key={p.id} 
                  className={`p-dot ${responses[p.id] !== undefined ? 'active' : ''}`}
                  style={{ '--p-color': players.find(pl => pl.id === p.id)?.color || '#fff' }}
                  title={p.name}
                ></div>
              ))}
           </div>
        </footer>
        
        {pendingCount === 0 && (
          <div className="processing-overlay">
             <div className="spinner"></div>
             <span>Finalizando verificação...</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
