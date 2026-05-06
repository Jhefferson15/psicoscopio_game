import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../state/useGame';
import { useUser } from '../../../user/presentation/state/useUser';
import { customCardRepository } from '../../data/repositories/LocalStorageCardRepository';
import { Trash2, ChevronLeft, Brain, Puzzle, Zap, Award, Sparkles, Brush, Image as ImageIcon, Send, ShieldAlert } from 'lucide-react';

import './CustomCardsGallery.css';

const CustomCardsGallery = ({ isModal = false, onClose }) => {
  const { handleGoToMenu } = useGame();
  const { deleteCustomCardFromCloud } = useUser();
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const initLoad = async () => {
      const savedCards = await customCardRepository.getCards();
      if (isMounted) {
        setCards(savedCards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setIsLoading(false);
      }
    };
    initLoad();
    return () => { isMounted = false; };
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta carta?')) {
      await customCardRepository.deleteCard(id);
      
      // Deleta da nuvem se estiver logado
      if (deleteCustomCardFromCloud) {
        await deleteCustomCardFromCloud(id);
      }
      
      setCards(cards.filter(c => c.id !== id));
    }
  };

  const handleSend = (card) => {
    const cardData = JSON.stringify(card);
    navigator.clipboard.writeText(cardData).then(() => {
      alert('Dados da carta copiados! Você pode enviar este código para outro jogador importar.');
    });
  };


  const getIcon = (type) => {
    const iconProps = { size: 16 };
    switch (type.toLowerCase()) {
      case 'reflexão': return <Brain {...iconProps} />;
      case 'memória': return <Puzzle {...iconProps} />;
      case 'desafio': return <Zap {...iconProps} />;
      case 'experiência': return <Award {...iconProps} />;
      case 'sorte': return <Sparkles {...iconProps} />;
      default: return <Brain {...iconProps} />;
    }
  };

  const content = (
    <>
      <header className="gallery-top-bar">
        {!isModal && (
          <button className="btn-back" onClick={handleGoToMenu}>
            <ChevronLeft size={24} />
          </button>
        )}
        <div className="gallery-main-title">
          <ImageIcon className="title-icon" size={24} />
          <h1>Minha Coleção</h1>
        </div>
        <div className="card-count-badge">
          {cards.length} Cartas
        </div>
        {isModal && (
          <button className="btn-back" onClick={onClose}>
             <ChevronLeft size={24} style={{ transform: 'rotate(90deg)' }} />
          </button>
        )}
      </header>

      <div className="gallery-content">
        {isLoading ? (
          <div className="gallery-loading">
            <div className="spinner"></div>
            <p>Carregando coleção...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="gallery-empty">
            <div className="empty-icon">🎴</div>
            <h2>Sua coleção está vazia</h2>
            <p>Crie cartas personalizadas no Ateliê para vê-las aqui.</p>
            {!isModal && (
              <button className="btn-premium-primary" onClick={() => window.location.reload()}>
                Ir para o Ateliê
              </button>
            )}
          </div>
        ) : (
          <div className="cards-grid">
            <AnimatePresence>
              {cards.map((card) => (
                <motion.div 
                  key={card.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`gallery-card-item ${card.isReported ? 'is-reported' : ''}`}
                  style={{ '--accent-color': card.color }}
                >
                  <div className="gallery-card-inner">
                    {card.isReported && (
                      <div className="card-reported-overlay">
                        <ShieldAlert size={32} />
                        <span>Bloqueada</span>
                      </div>
                    )}
                    <div className="gallery-card-header" style={{ background: card.color }}>
                      <div className="badge-icons" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        {getIcon(card.type)}
                        <Brush size={12} style={{ opacity: 0.8 }} />
                      </div>
                      <span>{`CUSTOM ${card.type.toUpperCase()}`}</span>
                    </div>
                    
                    <div className="gallery-card-body">
                      {card.contentType === 'drawing' || card.contentType === 'image' ? (
                        <img src={card.content} alt="Card content" className="gallery-card-img" />
                      ) : (
                        <div className="gallery-card-text">
                          {card.content}
                        </div>
                      )}
                    </div>

                    <div className="gallery-card-actions">
                      <button 
                        className="btn-card-action send" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSend(card);
                        }}
                        title="Enviar para alguém"
                      >
                        <Send size={14} />
                      </button>
                      <button 
                        className="btn-card-action delete" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(card.id);
                        }}
                        title="Excluir carta"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>

              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );

  if (isModal) {
    return <div className="gallery-modal-internal">{content}</div>;
  }

  return (
    <motion.div 
      className="gallery-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="gallery-ambient-bg"></div>
      
      <div className="gallery-layout glass-panel">
        {content}
      </div>
    </motion.div>
  );
};

export default CustomCardsGallery;
