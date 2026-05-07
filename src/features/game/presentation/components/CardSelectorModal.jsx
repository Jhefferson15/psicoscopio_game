import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Brain, Zap, Sparkles, HelpCircle, Puzzle, Award, Brush, PlusCircle, Library, Plus } from 'lucide-react';
import { useGame } from '../state/useGame';
import { customCardRepository } from '../../data/repositories/LocalStorageCardRepository';
import './CardSelectorModal.css';

const cardTypes = {
  reflexao: { icon: Brain, color: '#7B4BB1', label: 'Reflexão' },
  desafio: { icon: Zap, color: '#D84B42', label: 'Desafio' },
  sorte: { icon: Sparkles, color: '#F4C746', label: 'Sorte' },
  memoria: { icon: Puzzle, color: '#4885CE', label: 'Memória' },
  experiencia: { icon: Award, color: '#6FB05E', label: 'Experiência' },
  default: { icon: HelpCircle, color: '#94a3b8', label: 'Info' }
};

const CardSelectorModal = () => {
  const { 
    cardSelectionTask, 
    setCardSelectionTask, 
    cardHistory, 
    players, 
    currentPlayerIndex,
    availableCardSets
  } = useGame();

  const [activeTab, setActiveTab] = useState('collections'); // Inicia na aba de coleções para mostrar as cartas do usuário
  const [atelierCards, setAtelierCards] = useState([]);

  useEffect(() => {
    const loadAtelierCards = async () => {
      try {
        const cards = await customCardRepository.getCards();
        setAtelierCards(cards);
      } catch (error) {
        console.error('Erro ao carregar cartas do ateliê:', error);
      }
    };
    loadAtelierCards();
  }, []);

  const currentPlayer = players[currentPlayerIndex];
  
  // Memoiza o histórico filtrado
  const myHistory = useMemo(() => {
    if (!currentPlayer?.name) return [];
    
    return cardHistory.filter(card => {
      const cardName = (card.playerName || 'Jogador').trim();
      const currentName = currentPlayer.name.trim();
      return cardName === currentName || cardName === 'Jogador' || cardName === '';
    });
  }, [cardHistory, currentPlayer]);

  // Flatten das cartas de todas as coleções disponíveis + Cartas do Ateliê
  const collectionCards = useMemo(() => {
    const allCards = [];

    // 1. Adiciona as cartas do Ateliê (Criações do Usuário)
    if (Array.isArray(atelierCards)) {
      atelierCards.forEach(card => {
        // Normalização do tipo para evitar erros de acentuação no mapeamento de ícones
        let typeKey = (card.type || 'reflexao').toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove acentos
        
        if (!cardTypes[typeKey]) typeKey = 'default';

        allCards.push({
          id: `atelier-${card.id}`,
          cardType: typeKey,
          cardText: card.content,
          contentType: card.contentType || (typeof card.content === 'string' && card.content.startsWith('data:image') ? 'drawing' : 'text'),
          isCustom: true,
          setName: 'Ateliê'
        });
      });
    }

    // 2. Adiciona as coleções do usuário (CardSetRepository)
    if (availableCardSets && Array.isArray(availableCardSets)) {
      availableCardSets.forEach(set => {
        const setId = String(set.id || '').toLowerCase();
        const setName = (set.name || '').toLowerCase();
        
        // FILTRO ABSOLUTO: Nunca mostrar o set padrão do jogo no seletor de cartas personalizadas
        if (setId === 'default' || 
            setId.includes('padrao') || 
            setName.includes('padrão') || 
            setName.includes('psicoscópio') ||
            setName.includes('psicoscopio') ||
            setName === 'padrão psicoscópio') {
          return;
        }
        
        const content = set.content || {};
        Object.entries(content).forEach(([category, items]) => {
          if (!Array.isArray(items)) return;
          
          let typeKey = category.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          
          if (!cardTypes[typeKey]) typeKey = 'default';

          items.forEach((item, index) => {
            // Suporta tanto string direta quanto objeto { text, id }
            const text = typeof item === 'string' ? item : (item.text || item.cardText || '');
            
            allCards.push({
              id: `coll-${set.id}-${typeKey}-${index}`,
              cardType: typeKey,
              cardText: text,
              contentType: 'text',
              isCustom: true,
              setName: set.name
            });
          });
        });
      });
    }
    
    return allCards;
  }, [availableCardSets, atelierCards]);

  if (!cardSelectionTask) return null;

  const { title, message, onSelect, onDrawNew, onCreateNew } = cardSelectionTask;

  const handleSelect = (card) => {
    if (onSelect) onSelect(card);
    setCardSelectionTask(null);
  };

  const handleDrawNew = () => {
    if (onDrawNew) onDrawNew();
    setCardSelectionTask(null);
  };

  const handleCreateNew = () => {
    if (onCreateNew) onCreateNew();
    setCardSelectionTask(null);
  };

  const handleClose = () => {
    setCardSelectionTask(null);
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="card-selector-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div 
          className="card-selector-content glass-panel"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <header className="selector-header">
            <div className="header-icon-wrapper">
              <Library size={24} />
            </div>
            <div className="header-text">
              <h3>{title}</h3>
              <p>{message}</p>
            </div>
            <button className="close-selector-btn" onClick={handleClose}>
              <X size={20} />
            </button>
          </header>

          <div className="selector-tabs">
            <button 
              className={`tab-btn ${activeTab === 'collections' ? 'active' : ''}`}
              onClick={() => setActiveTab('collections')}
            >
              <Library size={16} />
              Minhas Coleções
            </button>
            <button 
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={16} />
              Minhas Jogadas
            </button>
          </div>

          <div className="selector-scroll-area">
            <div className="selector-options-grid">
              {/* Opção Criar Nova (Se disponível na tarefa) */}
              {onCreateNew && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="card-option create-new-option"
                  onClick={handleCreateNew}
                >
                  <div className="draw-icon-wrapper">
                    <Plus size={32} />
                  </div>
                  <div className="draw-info">
                    <h4>Criar Nova</h4>
                    <p>Crie uma carta personalizada agora</p>
                  </div>
                </motion.button>
              )}

              {/* Opção de Sorteio de Nova Carta - Sempre Visível */}
              <motion.button
                className="card-option draw-new-option"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDrawNew}
              >
                <div className="draw-icon-wrapper">
                  <PlusCircle size={32} />
                </div>
                <div className="draw-info">
                  <h4>Sortear Nova</h4>
                  <p>Pegar uma carta aleatória do deck ativo</p>
                </div>
              </motion.button>

              {/* Lista baseada na Tab Ativa */}
              {activeTab === 'history' ? (
                myHistory.map((card, index) => {
                  const config = cardTypes[card.cardType] || cardTypes.default;
                  const Icon = config.icon;
                  
                  return (
                    <motion.button
                      key={card.id || `hist-${index}`}
                      className="card-option history-option"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(card)}
                    >
                      <div className="card-option-header">
                        <div className="type-badge" style={{ backgroundColor: config.color }}>
                          <Icon size={12} />
                          <span>{config.label}</span>
                        </div>
                        {card.isCustom && <div className="custom-indicator"><Brush size={10} /> Personalizada</div>}
                      </div>
                      <div className="card-option-body">
                        {card.contentType === 'drawing' || card.contentType === 'image' ? (
                          <img src={card.cardText} alt="Card drawing" className="card-image-preview" />
                        ) : (
                          <p className="card-option-text">"{card.cardText}"</p>
                        )}
                      </div>
                    </motion.button>
                  );
                })
              ) : (
                collectionCards.map((card, index) => {
                  const config = cardTypes[card.cardType] || cardTypes.default;
                  const Icon = config.icon;
                  
                  return (
                    <motion.button
                      key={card.id || `coll-${index}`}
                      className="card-option collection-option"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(card)}
                    >
                      <div className="card-option-header">
                        <div className="type-badge" style={{ backgroundColor: config.color }}>
                          <Icon size={12} />
                          <span>{card.setName || 'Coleção'}</span>
                        </div>
                        <div className="category-label-small" style={{ color: config.color }}>
                          {config.label}
                        </div>
                      </div>
                      <div className="card-option-body">
                        {card.contentType === 'drawing' || card.contentType === 'image' ? (
                          <img src={card.cardText} alt="Card drawing" className="card-image-preview" />
                        ) : (
                          <p className="card-option-text">"{card.cardText}"</p>
                        )}
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>

            {activeTab === 'history' && myHistory.length === 0 && (
              <div className="empty-history-notice">
                <History size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                <p>Você ainda não sorteou nenhuma carta nesta partida.</p>
              </div>
            )}

            {activeTab === 'collections' && collectionCards.length === 0 && (
              <div className="empty-history-notice">
                <Brush size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                <p>Você ainda não possui cartas em suas coleções personalizadas.</p>
                <span style={{ fontSize: '0.8rem', marginTop: 8, display: 'block', opacity: 0.7 }}>
                  Crie suas próprias cartas no "Ateliê de Cartas" do menu inicial.
                </span>
              </div>
            )}
          </div>

          <p className="selector-hint">Escolha uma carta da sua coleção ou do seu histórico para enviar.</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CardSelectorModal;
