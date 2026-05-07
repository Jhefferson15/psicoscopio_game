import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Zap, HelpCircle, Puzzle, Award, Palette, Brush, ShieldAlert, CheckCircle } from 'lucide-react';
import './GameCard.css';
import { getRandomCardContent } from '../../data/repositories/cardRepository';
import { useGame } from '../state/useGame';
import { ReportCardModal } from './ReportCardModal';

const cardTypes = {
  reflexao: {
    icon: Brain,
    color: '#7B4BB1',
    label: 'Reflexão',
    gradient: 'linear-gradient(135deg, #7B4BB1, #5a3683)'
  },
  desafio: {
    icon: Zap,
    color: '#D84B42',
    label: 'Desafio',
    gradient: 'linear-gradient(135deg, #D84B42, #b33931)'
  },
  sorte: {
    icon: Sparkles,
    color: '#F4C746',
    label: 'Sorte',
    gradient: 'linear-gradient(135deg, #F4C746, #d4a726)'
  },
  memoria: {
    icon: Puzzle,
    color: '#4885CE',
    label: 'Memória',
    gradient: 'linear-gradient(135deg, #4885CE, #3567a5)'
  },
  experiencia: {
    icon: Award,
    color: '#6FB05E',
    label: 'Experiência',
    gradient: 'linear-gradient(135deg, #6FB05E, #558a47)'
  },
  custom_card: {
    icon: Palette,
    color: '#F4C746',
    label: 'Customizada',
    gradient: 'linear-gradient(135deg, #F4C746, #d4a726)'
  },
  default: {
    icon: HelpCircle,
    color: '#94a3b8',
    label: 'Info',
    gradient: 'linear-gradient(135deg, #94a3b8, #64748b)'
  }
};

const GameCard = ({ 
  type = 'default', 
  isStacked = false, 
  index = 0, 
  isFocused = false, 
  content = null, 
  contentType = 'text',
  isCustom = false 
}) => {

  const { 
    closeFocusedCard, 
    activeCardSet, 
    recordCardDraw, 
    showDetailPopup, 
    activeBoardConfig,
    reportCard
  } = useGame();
  const config = cardTypes[type] || cardTypes.default;
  const Icon = config.icon;
  const layoutId = `card-${type}-${index}`;

  const [cardText] = useState(() => {
    if (content) {
      if (typeof content === 'string') return content;
      if (typeof content === 'object' && content.text) return content.text;
      if (typeof content === 'object' && content.content && typeof content.content === 'string') return content.content;
    }
    return getRandomCardContent(type, activeCardSet?.content);
  });


  // Controla a rotacao CSS (com delay para permitir a CSS transition animar)
  const [shouldFlip, setShouldFlip] = useState(false);
  // Controla QUAL conteudo mostrar (troca no momento edge-on da rotacao)
  const [showFront, setShowFront] = useState(false);
  // Ref para garantir que registramos apenas uma vez por foco (evita duplicidade em re-renders do Context)
  const hasRecordedRef = useRef(false);

  // Estados para denúncia
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReportedInSession, setIsReportedInSession] = useState(false);
  const [showReportSuccess, setShowReportSuccess] = useState(false);

  useEffect(() => {
    if (isFocused) {
      // 300ms: inicia a rotacao CSS (540deg em 1.2s)
      const flipTimer = setTimeout(() => setShouldFlip(true), 300);
      // 900ms: troca o conteudo no momento edge-on (~270deg, carta de perfil)
      const swapTimer = setTimeout(() => {
        setShowFront(true);
        // Registra a carta no histórico para o dashboard do observador
        if (recordCardDraw && !hasRecordedRef.current) {
          recordCardDraw({ id: index, type: type, text: cardText, isCustom: isCustom });
          hasRecordedRef.current = true;
        }
      }, 900);
      return () => {
        clearTimeout(flipTimer);
        clearTimeout(swapTimer);
        setShouldFlip(false);
        setShowFront(false);
        hasRecordedRef.current = false;
        setIsReportedInSession(false);
        setShowReportSuccess(false);
      };
    }
  }, [isFocused, index, type, cardText, recordCardDraw, isCustom]);

  const handleClick = (e) => {
    // Evita fechar a carta se clicar na denúncia
    if (e.target.closest('.report-action-btn')) return;

    if (isFocused) {
      closeFocusedCard();
    } else if (isStacked) {
      // Se estiver no monte, abre o popup de detalhes da categoria
      showDetailPopup({
        title: config.label,
        description: activeCardSet?.categoryDescriptions?.[type] || "Descrição não disponível.",
        icon: Icon,
        color: config.color
      });
    }
  };

  const handleReportConfirm = async (reason) => {
    try {
      // Para cartas de sistema, o ID é o próprio texto. Para customizadas, é o ID único.
      const actualCardId = isCustom ? (content?.id || index) : cardText;
      
      // Centralized report (handles local state, localStorage and Firebase)
      await reportCard(actualCardId, reason);

      setIsReportedInSession(true);
      setShowReportSuccess(true);
      
      // Fecha a carta automaticamente após o feedback de sucesso
      setTimeout(() => {
        closeFocusedCard();
      }, 2000);
    } catch (error) {
      console.error("Failed to report:", error);
    }
  };

  return (
    <>
      <motion.div
        layoutId={layoutId}
        className={`game-card ${isStacked ? 'stacked' : ''} ${isFocused ? 'focused' : ''} ${isReportedInSession ? 'is-reported' : ''}`}
        style={{
          '--card-color': config.color,
          '--card-gradient': config.gradient,
          zIndex: isFocused ? 2000 : (isStacked ? 10 - index : 1),
          cursor: (isFocused || isStacked) ? 'pointer' : 'default'
        }}
        animate={{ 
          y: isFocused ? 0 : (isStacked ? index * -4 : 0),
          rotateZ: isFocused ? 0 : (isStacked ? index * 2 - 2 : 0),
          scale: isFocused ? 1.15 : 1
        }}
        transition={{ 
          scale: { duration: 0.5 },
          layout: { duration: 0.6, type: 'spring' }
        }}
        whileHover={isFocused ? { scale: 1.05 } : {}}
        whileTap={isFocused ? { scale: 0.95 } : {}}
        onClick={handleClick}
      >
        <div className="card-perspective-wrapper">
          <div className={`card-inner ${shouldFlip ? 'card-flipped' : ''}`}>
            
            {/* Uma unica face: troca conteudo durante a rotacao */}
            <div className={`card-face ${showFront ? 'card-face-front' : ''}`}>
              {showFront ? (
                /* FRENTE - Conteudo rico em texto */
                <div className={`card-content-wrapper ${isCustom && (contentType === 'drawing' || contentType === 'image') ? 'is-custom-media' : ''}`}>
                  {showReportSuccess ? (
                    <div className="report-success-overlay">
                      <CheckCircle size={48} color="#4cd137" />
                      <p>Denúncia Enviada</p>
                      <span>Obrigado por nos ajudar!</span>
                    </div>
                  ) : (
                    <>
                      {activeBoardConfig.mechanics?.showCardLabels !== false && (
                        <div className="card-header-bar" style={{ borderBottomColor: config.color }}>
                          <div className="card-header-icons">
                             <Icon size={isFocused ? 28 : 16} color={config.color} />
                             {isCustom && <Brush size={isFocused ? 18 : 10} color={config.color} className="custom-indicator" />}
                          </div>
                          <div className="card-header-actions">
                            <span style={{ color: config.color }}>
                              {isCustom ? `CUSTOM ${config.label.toUpperCase()}` : config.label.toUpperCase()}
                            </span>
                            {isFocused && !isReportedInSession && (
                              <button 
                                className="report-action-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsReportModalOpen(true);
                                }}
                                title="Denunciar esta carta"
                              >
                                <ShieldAlert size={20} />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="card-body-text">
                        {contentType === 'drawing' || contentType === 'image' ? (
                          <div className="custom-card-media">
                            <img src={content} alt="Card content" />
                          </div>
                        ) : (
                          <p>{cardText}</p>
                        )}
                      </div>
                      
                      {activeBoardConfig.mechanics?.showCardLabels !== false && (
                        <div className="card-footer-bar">
                          <span>PSICOSCÓPIO</span>
                          <span>#{String(index + 1).padStart(3, '0')}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                /* VERSO - Capa decorativa */
                <div className="card-cover" style={{ background: config.gradient }}>
                  <div className="logo-symbol">
                    <div className="icon-group">
                      <Icon size={isFocused ? 80 : 40} color="white" opacity={0.9} />
                      {isCustom && <Brush size={isFocused ? 40 : 20} color="white" opacity={0.8} className="custom-indicator-large" />}
                    </div>
                  </div>
                  <span className="cover-label">
                    {isCustom ? `CUSTOM\n${config.label.toUpperCase()}` : config.label.toUpperCase()}
                  </span>
                  <div className="cover-dots"></div>
                </div>
              )}
            </div>

          </div>
        </div>
      </motion.div>

      <ReportCardModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onConfirm={handleReportConfirm}
        cardId={isCustom ? (content?.id || index) : cardText}
      />
    </>
  );
};

export default GameCard;
