import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Users, MessageCircle, AlertCircle, ShieldCheck, HelpCircle, Star, RotateCcw } from 'lucide-react';
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
    roomStatus
  } = useGame();
  
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredValue, setHoveredValue] = useState(null);

  // Se não houver verificação ativa ou o status não for este, não renderiza
  if (roomStatus !== 'verifying_action' || !activeVerification) return null;

  const { playerId, cardType, responses = {}, cardText } = activeVerification;
  const targetPlayer = players.find(p => p.id === playerId);
  const myResponse = responses[user?.id];
  const hasResponded = myResponse !== undefined;

  const participantsArray = Object.values(roomParticipants);
  const totalParticipants = participantsArray.length;
  const responsesCount = Object.keys(responses).length;
  const pendingCount = totalParticipants - responsesCount;

  const question = VERIFICATION_QUESTIONS[cardType] || VERIFICATION_QUESTIONS.custom;

  const handleVote = async (value) => {
    if (isSubmitting || hasResponded) return;
    
    setIsSubmitting(true);
    try {
      const updatedResponses = {
        ...responses,
        [user.id]: value
      };

      // Atualiza no RTDB
      await syncRepository.updateGameState(roomId, {
        "activeVerification/responses": updatedResponses
      });

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
      const updatedResponses = { ...responses };
      delete updatedResponses[user?.id];

      // Atualiza no RTDB removendo especificamente a resposta do usuário
      await syncRepository.updateGameState(roomId, {
        "activeVerification/responses": updatedResponses
      });

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
             <div className="player-meta">
                <h3>{targetPlayer?.name}</h3>
                <p>realizou uma ação de <strong>{cardType.toUpperCase()}</strong></p>
             </div>
          </div>

          <div className="card-content-preview">
            <MessageCircle size={18} className="quote-icon" />
            {typeof cardText === 'string' && cardText.startsWith('data:image') ? (
              <p><em>[Conteúdo Visual - Verifique o Tabuleiro]</em></p>
            ) : (
              <p>"{cardText}"</p>
            )}
          </div>


          <div className="question-section">
             <HelpCircle size={24} className="question-icon" />
             <h2>{question}</h2>
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
