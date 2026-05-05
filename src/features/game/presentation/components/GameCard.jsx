import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Zap, HelpCircle, Puzzle, Award, Palette, Brush } from 'lucide-react';
import './GameCard.css';
import { getRandomCardContent } from '../../data/repositories/cardRepository';
import { useGame } from '../state/useGame';

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

  const { closeFocusedCard, activeCardSet, recordCardDraw, showDetailPopup, activeBoardConfig } = useGame();
  const config = cardTypes[type] || cardTypes.default;
  const Icon = config.icon;
  const layoutId = `card-${type}-${index}`;

  const [cardText] = useState(() => isCustom && contentType === 'text' ? content : getRandomCardContent(type, activeCardSet?.content));


  // Controla a rotacao CSS (com delay para permitir a CSS transition animar)
  const [shouldFlip, setShouldFlip] = useState(false);
  // Controla QUAL conteudo mostrar (troca no momento edge-on da rotacao)
  const [showFront, setShowFront] = useState(false);
  // Ref para garantir que registramos apenas uma vez por foco (evita duplicidade em re-renders do Context)
  const hasRecordedRef = useRef(false);

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
      };
    }
  }, [isFocused, index, type, cardText, recordCardDraw, isCustom]);

  const handleClick = () => {
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

  return (
    <motion.div
      layoutId={layoutId}
      className={`game-card ${isStacked ? 'stacked' : ''} ${isFocused ? 'focused' : ''}`}
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
                {activeBoardConfig.mechanics?.showCardLabels !== false && (
                  <div className="card-header-bar" style={{ borderBottomColor: config.color }}>
                    <div className="card-header-icons">
                       <Icon size={isFocused ? 28 : 16} color={config.color} />
                       {isCustom && <Brush size={isFocused ? 18 : 10} color={config.color} className="custom-indicator" />}
                    </div>
                    <span style={{ color: config.color }}>
                      {isCustom ? `CUSTOM ${config.label.toUpperCase()}` : config.label.toUpperCase()}
                    </span>
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
                  {isCustom ? `CUSTOM\n${config.label.toUpperCase()}` : config.label}
                </span>
                <div className="cover-dots"></div>
              </div>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;
