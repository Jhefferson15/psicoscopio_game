import { Globe, ShieldCheck, Copy, X, Users, ChevronRight, User, Volume2, VolumeX, RotateCcw, Image as ImageIcon, Layout, Brush, ClipboardList, Printer, Eye, FileDown, FileText as FileTextIcon, Check, Settings, Info, Sparkles, Brain, HelpCircle, Zap, Book } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useRef, useMemo, memo, useEffect } from 'react';
import CustomCardsGallery from './CustomCardsGallery';
import { useGame } from '../state/useGame';
import { useAuth } from '../../../auth/presentation/state/useAuth';
import { PdfService } from '../../data/services/PdfService';
import BoardView from './BoardView';
import PrintCard from './PrintCard';
import './MenuModals.css';

// --- Page Rendering Components for Preview ---

const CATEGORY_COLORS = {
  memoria: '#4885CE',
  reflexao: '#7B4BB1',
  desafio: '#D84B42',
  experiencia: '#6FB05E',
  sorte: '#F4C746',
  custom: '#94A3B8'
};

export const CardSlot = ({ category, label, icon, color }) => (
  <div className="card-stack-slot" style={{ '--slot-color': color }}>
    <div className="slot-border" />
    <div className="slot-content">
      <div className="slot-icon">{icon}</div>
      <div className="slot-label">{label}</div>
    </div>
  </div>
);

const PrintProgressModal = ({ progress }) => {
  return (
    <div className="print-progress-overlay">
       <motion.div 
         className="print-progress-content"
         initial={{ scale: 0.9, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
       >
         <div className="progress-header">
           <div className="progress-icon-wrapper">
             <FileDown className="text-primary pulse-animation" size={32} />
           </div>
           <h3>Gerando seu Kit de Jogo</h3>
           <p>Estamos preparando as páginas em alta resolução. Por favor, aguarde um momento.</p>
         </div>
         
         <div className="progress-bar-container">
           <motion.div 
             className="progress-bar-fill" 
             initial={{ width: 0 }}
             animate={{ width: `${progress}%` }}
             transition={{ duration: 0.3 }}
           />
         </div>
         
         <div className="progress-stats">
           <span className="percentage">{progress}%</span>
           <span className="status-text">
             {progress < 10 ? 'Inicializando componentes...' : 
              progress < 90 ? `Capturando página ${Math.floor((progress - 10) / 80 * 16) + 1}...` : 
              progress < 100 ? 'Compilando arquivo final...' : 'Download iniciado!'}
           </span>
         </div>
       </motion.div>
    </div>
  );
};

const PagePreview = memo(({ type, data, settings, pageNumber, isExport = false }) => {
  const { margin, boardScale } = settings;
  // Limit margin to 4mm for card pages to prevent 3-column overflow
  const safeMargin = (type === 'cards' || type === 'blank' || type === 'accessories') ? Math.min(margin, 4) : margin;
  const padding = `${safeMargin}mm`;
  const sheetRef = useRef(null);
  const [scale, setScale] = useState(isExport ? 1 : 0.5);

  useEffect(() => {
    // No dynamic scaling for export or if sheetRef is missing
    if (isExport || !sheetRef.current) return;

    const updateScale = () => {
      if (!sheetRef.current) return;
      const width = sheetRef.current.offsetWidth;
      // 210mm is the standard A4 width
      // We use a constant for mm to px conversion at 96dpi
      const mmToPx = 3.7795275591;
      const basePx = 210 * mmToPx;
      setScale(width / basePx);
    };

    updateScale();
    const obs = new ResizeObserver(updateScale);
    obs.observe(sheetRef.current);
    return () => obs.disconnect();
  }, [isExport]);

  const renderContent = () => {
    switch (type) {
      case 'cover':
        return (
          <div className="preview-page-cover">
            <h1 style={{ color: '#4885CE', fontSize: '1.2rem' }}>PSICOSCÓPIO</h1>
            <p style={{ fontSize: '0.6rem', color: '#64748B' }}>Kit de Impressão</p>
            <div className="preview-cover-line" />
            <div className="preview-instructions">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="preview-instruction-line" />
              ))}
            </div>
          </div>
        );
      case 'board-left':
      case 'board-right':
        return (
          <div className="preview-page-board" style={{ padding }}>
            <div className={`board-decorations ${type}`}>
              {type === 'board-left' ? (
                <>
                  <div className="board-title-vertical">PSICOSCÓPIO</div>
                  <div className="card-stack-slots">
                    <CardSlot category="memoria" label="MEMÓRIA" icon={<Brain size={16} />} color={CATEGORY_COLORS.memoria} />
                    <CardSlot category="reflexao" label="REFLEXÃO" icon={<HelpCircle size={16} />} color={CATEGORY_COLORS.reflexao} />
                    <CardSlot category="desafio" label="DESAFIO" icon={<Zap size={16} />} color={CATEGORY_COLORS.desafio} />
                  </div>
                </>
              ) : (
                <>
                  <div className="card-stack-slots">
                    <CardSlot category="experiencia" label="EXPERIÊNCIA" icon={<Sparkles size={16} />} color={CATEGORY_COLORS.experiencia} />
                    <CardSlot category="sorte" label="SORTE" icon={<Sparkles size={16} />} color={CATEGORY_COLORS.sorte} />
                  </div>
                  <div className="board-notebook-slot">
                    <div className="notebook-header">
                      <Book size={14} />
                      <span>DIÁRIO DE BORDO</span>
                    </div>
                    <div className="notebook-lines">
                      {Array.from({ length: 15 }).map((_, i) => <div key={i} className="line" />)}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="board-half-container">
              <BoardView isReadOnly={true} isMiniature={true} boardRotation={0} />
            </div>

            <div className="board-cut-line" style={{ 
              right: type === 'board-left' ? 0 : 'auto',
              left: type === 'board-right' ? 0 : 'auto'
            }} />
          </div>
        );
      case 'accessories':
        return (
          <div className="preview-page-accessories" style={{ padding }}>
            <div className="preview-accessories-grid">
              {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                <div key={cat} className="preview-mini-slot" style={{ borderColor: color }} />
              ))}
            </div>
            <div className="preview-notebook-area" />
          </div>
        );
      case 'pawns':
        return (
          <div className="preview-page-pawns" style={{ padding }}>
            <div className="preview-pawns-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="preview-mini-pawn-wrapper">
                  <div className="preview-mini-pawn" />
                  <div className="pawn-fold-line" />
                  <div className="preview-mini-pawn-base" />
                </div>
              ))}
            </div>
          </div>
        );
      case 'cards':
        return (
          <div className="preview-page-cards" style={{ padding }}>
            <div className="preview-cards-grid">
              {data.map((card, i) => (
                <PrintCard 
                  key={i} 
                  type={card.category} 
                  text={card.text} 
                  index={i} 
                  isCustom={card.category === 'custom'}
                />
              ))}
            </div>
          </div>
        );
      case 'blank':
        return (
          <div className="preview-page-cards" style={{ padding }}>
             <h4 style={{ fontSize: '0.4rem', marginBottom: '2mm', opacity: 0.5 }}>MODELOS: {data.category.toUpperCase()}</h4>
             <div className="preview-cards-grid">
              {Array.from({ length: 9 }).map((_, i) => (
                <PrintCard 
                  key={i} 
                  type={data.category} 
                  isBlank={true}
                  index={i}
                />
              ))}
            </div>
          </div>
        );
      default:
        return <div className="preview-page-empty">Página {pageNumber}</div>;
    }
  };

  return (
    <div className="preview-page-wrapper">
      <div className="preview-page-sheet" ref={sheetRef}>
        <div 
          className="preview-content-scaler"
          style={{ 
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: '210mm',
            height: '297mm',
            position: 'absolute',
            top: 0,
            left: 0,
            boxSizing: 'border-box'
          }}
        >
          {renderContent()}
        </div>
      </div>
      <div className="preview-page-label">Página {pageNumber}</div>
    </div>
  );
});


const ModalWrapper = ({ title, onClose, children }) => (
  <motion.div 
    className="menu-modal-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div 
      className="menu-modal-content"
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      onClick={e => e.stopPropagation()}
    >
      <div className="modal-header">
        <h2>{title}</h2>
        <button className="close-btn" onClick={onClose}><X size={20} /></button>
      </div>
      <div className="modal-body">
        {children}
      </div>
    </motion.div>
  </motion.div>
);

export const PlayerSetupModal = ({ onClose }) => {
  const { initializeGame, createOnlineGame, joinOnlineGame, roomId, showSystemPopup } = useGame();

  const { user } = useAuth();
  const [mode, setMode] = useState('local'); // 'local' | 'online'
  const [joinCode, setJoinCode] = useState('');
  const [playerCount, setPlayerCount] = useState(2);
  const [playerData, setPlayerData] = useState([
    { name: 'Jogador 1', color: '#D84B42' },
    { name: 'Jogador 2', color: '#4885CE' },
    { name: 'Jogador 3', color: '#7B4BB1' },
    { name: 'Jogador 4', color: '#F59E0B' },
  ]);

  const colors = ['#D84B42', '#4885CE', '#7B4BB1', '#F59E0B', '#10B981', '#6366F1'];

  const handleStart = () => {
    if (mode === 'local') {
      initializeGame(playerData.slice(0, playerCount));
    } else {
      if (!user) {
        showSystemPopup({
          title: 'Acesso Restrito',
          message: 'Você precisa estar logado para criar uma sala online.',
          type: 'error'
        });
        return;
      }
      createOnlineGame(playerData.slice(0, playerCount));
    }
  };

  const handleJoin = () => {
    if (joinCode.trim().length === 6) {
      joinOnlineGame(joinCode.toUpperCase());
    } else {
      showSystemPopup({
        title: 'Código Inválido',
        message: 'Insira um código válido de 6 caracteres.',
        type: 'error'
      });
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    showSystemPopup({
      title: 'Copiado!',
      message: 'Código da sala copiado para a área de transferência.',
      type: 'success'
    });
  };


  const updatePlayerName = (index, name) => {
    const newPlayers = [...playerData];
    newPlayers[index].name = name;
    setPlayerData(newPlayers);
  };

  const updatePlayerColor = (index, color) => {
    const newPlayers = [...playerData];
    newPlayers[index].color = color;
    setPlayerData(newPlayers);
  };

  return (
    <ModalWrapper title="Configurar Partida" onClose={onClose}>
      <div className="modal-tabs">
        <button 
          className={`tab-btn ${mode === 'local' ? 'active' : ''}`} 
          onClick={() => setMode('local')}
        >
          <Users size={18} />
          <span>Local</span>
        </button>
        <button 
          className={`tab-btn ${mode === 'online' ? 'active' : ''}`} 
          onClick={() => setMode('online')}
        >
          <Globe size={18} />
          <span>Online</span>
        </button>
      </div>

      {mode === 'local' ? (
        <>
          <div className="player-count-selection">
            <label>Número de Jogadores</label>
            <div className="count-buttons">
              {[2, 3, 4].map(num => (
                <button 
                  key={num} 
                  className={playerCount === num ? 'active' : ''} 
                  onClick={() => setPlayerCount(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="players-config-list">
            {playerData.slice(0, playerCount).map((player, idx) => (
              <div key={idx} className="player-config-item">
                <div className="player-avatar-preview" style={{ backgroundColor: player.color }}>
                  <User size={20} color="white" />
                </div>
                <div className="player-inputs">
                  <input 
                    type="text" 
                    value={player.name} 
                    onChange={(e) => updatePlayerName(idx, e.target.value)}
                    placeholder={`Nome do Jogador ${idx + 1}`}
                  />
                  <div className="color-picker">
                    {colors.map(c => (
                      <button 
                        key={c} 
                        className={`color-dot ${player.color === c ? 'active' : ''}`} 
                        style={{ backgroundColor: c }}
                        onClick={() => updatePlayerColor(idx, c)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="btn-primary start-btn" onClick={handleStart}>
            <span>Começar Jogo</span>
            <ChevronRight size={20} />
          </button>
        </>
      ) : (
        <div className="online-mode-container">
          {!user ? (
            <div className="online-auth-warning">
              <ShieldCheck size={40} color="#64748b" />
              <p>Faça login com sua conta Google para jogar online com seus amigos.</p>
            </div>
          ) : (
            <div className="online-actions">
              <div className="online-section">
                <h3>Criar Nova Sala</h3>
                <p>Crie uma sala e convide seus amigos.</p>
                <button className="btn-primary" onClick={handleStart} style={{ width: '100%' }}>
                  <Users size={20} />
                  <span>Gerar Sala Online</span>
                </button>
              </div>

              <div className="divider-text"><span>OU</span></div>

              <div className="online-section">
                <h3>Entrar em Sala</h3>
                <p>Insira o código enviado pelo seu amigo.</p>
                <div className="join-input-group">
                  <input 
                    type="text" 
                    placeholder="Ex: AB12CD" 
                    maxLength={6}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  />
                  <button className="btn-secondary" onClick={handleJoin}>
                    <span>Entrar</span>
                  </button>
                </div>
              </div>

              {roomId && (
                <motion.div 
                  className="room-code-display"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label>Sua Sala Criada:</label>
                  <div className="code-box" onClick={copyRoomId}>
                    <span>{roomId}</span>
                    <Copy size={16} />
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      )}
    </ModalWrapper>

  );
};

export const SettingsModal = ({ onClose }) => {
  const { 
    settings, 
    setSettings, 
    setCurrentScreen, 
    openCardAtelier, 
    showSystemPopup, 
    activeCardSet, 
    activeBoardConfig 
  } = useGame();

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [exportPageIndex, setExportPageIndex] = useState(-1);

  // Reusable page calculation logic
  const getPages = (printSettings) => {
    const list = [];
    list.push({ type: 'cover', id: 'cover' });

    if (printSettings.includeBoard) {
      list.push({ type: 'board-left', id: 'board-l' });
      list.push({ type: 'board-right', id: 'board-r' });
    }

    if (printSettings.includeAccessories) {
      list.push({ type: 'accessories', id: 'acc' });
      list.push({ type: 'pawns', id: 'pawns' });
    }

    if (printSettings.includeStandardCards) {
      const cats = ['memoria', 'reflexao', 'desafio', 'experiencia', 'sorte'];
      let allCards = [];
      cats.forEach(cat => {
        const cards = (activeCardSet.content[cat] || []).map(text => ({ category: cat, text }));
        allCards = [...allCards, ...cards];
      });
      for (let i = 0; i < allCards.length; i += 9) {
        list.push({ type: 'cards', id: `std-${i}`, data: allCards.slice(i, i + 9) });
      }
    }

    if (printSettings.includeCustomCards) {
      const customCards = (activeCardSet.content.custom || []).map(text => ({ category: 'custom', text }));
      for (let i = 0; i < customCards.length; i += 9) {
        list.push({ type: 'cards', id: `cust-${i}`, data: customCards.slice(i, i + 9) });
      }
    }

    if (printSettings.includeBlankCards) {
      ['memoria', 'reflexao', 'desafio', 'experiencia', 'sorte', 'custom'].forEach(cat => {
        list.push({ type: 'blank', id: `blank-${cat}`, data: { category: cat } });
      });
    }
    return list;
  };

  const toggleSound = () => setSettings(prev => ({ ...prev, sound: !prev.sound }));

  const handlePrintPdf = async (printSettings) => {
    setIsGeneratingPdf(true);
    setPdfProgress(0);
    
    try {
      const pages = getPages(printSettings);
      const pageCount = pages.length;

      // Small delay to ensure the hidden containers are rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const exportContainer = document.getElementById('hidden-pdf-export-container');

      if (exportContainer) {
        await PdfService.generateGamePdf({
          exportContainer: exportContainer,
          onProgress: (p, pageInfo) => {
            if (pageInfo) {
              setPdfProgress(Math.round(10 + (pageInfo.current / pageInfo.total) * 80));
            } else {
              setPdfProgress(p);
            }
          },
          setPageIndex: (idx) => setExportPageIndex(idx),
          pageCount: pageCount
        });
        
        showSystemPopup({
          title: 'PDF Pronto!',
          message: 'O arquivo foi gerado com sucesso.',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('PDF Error:', error);
      showSystemPopup({
        title: 'Erro no PDF',
        message: 'Ocorreu um erro ao gerar o PDF.',
        type: 'error'
      });
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress(0);
      setExportPageIndex(-1);
      setShowPrintPreview(false);
    }
  };

  return (
    <ModalWrapper title="Configurações" onClose={onClose}>
      <div className="settings-list">
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-icon">
              {settings.sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </div>
            <div className="setting-text">
              <h3>Sons do Jogo</h3>
              <p>Efeitos sonoros e trilha</p>
            </div>
          </div>
          <button 
            className={`toggle-switch ${settings.sound ? 'active' : ''}`} 
            onClick={toggleSound}
          >
            <div className="toggle-handle" />
          </button>
        </div>

        <div className="setting-item clickable" onClick={() => setShowPrintPreview(true)}>
          <div className="setting-info">
            <div className="setting-icon" style={{ backgroundColor: '#6FB05E', color: 'white' }}>
              <Printer size={20} />
            </div>
            <div className="setting-text">
              <h3>Imprimir Kit de Jogo</h3>
              <p>Gerar PDF com tabuleiro, cartas e peões</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </div>

        <div className="setting-item clickable" onClick={() => { openCardAtelier(); onClose(); }}>
          <div className="setting-info">
            <div className="setting-icon"><Brush size={20} /></div>
            <div className="setting-text">
              <h3>Ateliê de Cartas</h3>
              <p>Criar e desenhar cartas personalizadas</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </div>

        <div className="setting-item clickable" onClick={() => { setCurrentScreen('settings'); onClose(); }}>
          <div className="setting-info">
            <div className="setting-icon"><ImageIcon size={20} /></div>
            <div className="setting-text">
              <h3>Cartas Padronizadas</h3>
              <p>Personalizar textos e desafios</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </div>

        <div className="setting-item clickable" onClick={() => { setCurrentScreen('board_editor'); onClose(); }}>
          <div className="setting-info">
            <div className="setting-icon"><Layout size={20} /></div>
            <div className="setting-text">
              <h3>Editor de Tabuleiro</h3>
              <p>Customizar casas e mecânicas</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </div>

        <div className="setting-item clickable" onClick={() => { setCurrentScreen('evaluation'); onClose(); }}>
          <div className="setting-info">
            <div className="setting-icon"><ClipboardList size={20} /></div>
            <div className="setting-text">
              <h3>Avaliar o Jogo</h3>
              <p>Responder ao questionário MEEGA+</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </div>

        <div className="setting-item danger">
          <div className="setting-info">
            <div className="setting-icon"><RotateCcw size={20} /></div>
            <div className="setting-text">
              <h3>Resetar Progresso</h3>
              <p>Limpa todos os dados salvos</p>
            </div>
          </div>
          <button className="btn-text">Resetar</button>
        </div>
      </div>

      {/* Print Preview Modal Integration */}
      {showPrintPreview && (
        <PrintPreviewModal 
          onClose={() => setShowPrintPreview(false)} 
          onDownload={handlePrintPdf}
          isGenerating={isGeneratingPdf}
        />
      )}

      {/* Print Progress Modal */}
      {isGeneratingPdf && <PrintProgressModal progress={pdfProgress} />}

      {/* Hidden Export Area for PDF Capture */}
      <div 
        id="hidden-pdf-export-container"
        style={{ 
          position: 'fixed', 
          left: '-10000px', 
          top: '-10000px', 
          width: '210mm', 
          zIndex: -2000,
          background: 'white'
        }}
      >
        <PrintExportContent settings={settings} pageIndex={exportPageIndex} key={exportPageIndex} />
      </div>
    </ModalWrapper>
  );
};

const PrintExportContent = ({ settings, pageIndex = -1 }) => {
  const { activeCardSet } = useGame();
  
  const calculatedPages = useMemo(() => {
    // Standard page calculation
    const list = [];
    list.push({ type: 'cover', id: 'cover' });

    if (settings.includeBoard) {
      list.push({ type: 'board-left', id: 'board-l' });
      list.push({ type: 'board-right', id: 'board-r' });
    }

    if (settings.includeAccessories) {
      list.push({ type: 'accessories', id: 'acc' });
      list.push({ type: 'pawns', id: 'pawns' });
    }

    if (settings.includeStandardCards) {
      const cats = ['memoria', 'reflexao', 'desafio', 'experiencia', 'sorte'];
      let allCards = [];
      cats.forEach(cat => {
        const cards = (activeCardSet.content[cat] || []).map(text => ({ category: cat, text }));
        allCards = [...allCards, ...cards];
      });
      for (let i = 0; i < allCards.length; i += 9) {
        list.push({ type: 'cards', id: `std-${i}`, data: allCards.slice(i, i + 9) });
      }
    }

    if (settings.includeCustomCards) {
      const customCards = (activeCardSet.content.custom || []).map(text => ({ category: 'custom', text }));
      for (let i = 0; i < customCards.length; i += 9) {
        list.push({ type: 'cards', id: `cust-${i}`, data: customCards.slice(i, i + 9) });
      }
    }

    if (settings.includeBlankCards) {
      ['memoria', 'reflexao', 'desafio', 'experiencia', 'sorte', 'custom'].forEach(cat => {
        list.push({ type: 'blank', id: `blank-${cat}`, data: { category: cat } });
      });
    }

    let pages = list;
    if (pageIndex !== -1 && pages[pageIndex]) {
      pages = [pages[pageIndex]];
    }

    return pages;
  }, [settings, activeCardSet, pageIndex]);

  return (
    <div className="export-pages-list">
      {calculatedPages.map((page, idx) => (
        <div 
          key={page.id} 
          className="export-page-item" 
          id={`export-page-${idx}`}
          data-page-index={pageIndex === -1 ? idx : pageIndex}
        >
            <PagePreview 
              type={page.type}
              data={page.data}
              settings={settings}
              pageNumber={pageIndex === -1 ? idx + 1 : pageIndex + 1}
              isExport={true}
            />
        </div>
      ))}
    </div>
  );
};

export const PrintPreviewModal = ({ onClose, onDownload, isGenerating }) => {
  const { activeCardSet } = useGame();
  
  const [settings, setSettings] = useState({
    margin: 2, // Reduzido de 5 para 2 para evitar transbordamento no A4
    boardScale: 1,
    includeBoard: true,
    includeStandardCards: true,
    includeCustomCards: true,
    includeAccessories: true,
    includeBlankCards: true
  });

  const calculatedPages = useMemo(() => {
    const list = [];
    
    // 1. Cover
    list.push({ type: 'cover', id: 'cover' });

    // 2. Board
    if (settings.includeBoard) {
      list.push({ type: 'board-left', id: 'board-l' });
      list.push({ type: 'board-right', id: 'board-r' });
    }

    // 3. Accessories
    if (settings.includeAccessories) {
      list.push({ type: 'accessories', id: 'acc' });
      list.push({ type: 'pawns', id: 'pawns' });
    }

    // 4. Standard Cards
    if (settings.includeStandardCards) {
      const cats = ['memoria', 'reflexao', 'desafio', 'experiencia', 'sorte'];
      let allCards = [];
      cats.forEach(cat => {
        const cards = (activeCardSet.content[cat] || []).map(text => ({ category: cat, text }));
        allCards = [...allCards, ...cards];
      });

      for (let i = 0; i < allCards.length; i += 9) {
        list.push({ type: 'cards', id: `std-${i}`, data: allCards.slice(i, i + 9) });
      }
    }

    // 5. Custom Cards
    if (settings.includeCustomCards) {
      const customCards = (activeCardSet.content.custom || []).map(text => ({ category: 'custom', text }));
      for (let i = 0; i < customCards.length; i += 9) {
        list.push({ type: 'cards', id: `cust-${i}`, data: customCards.slice(i, i + 9) });
      }
    }

    // 6. Blank Templates
    if (settings.includeBlankCards) {
      ['memoria', 'reflexao', 'desafio', 'experiencia', 'sorte', 'custom'].forEach(cat => {
        list.push({ type: 'blank', id: `blank-${cat}`, data: { category: cat } });
      });
    }

    return list;
  }, [settings, activeCardSet]);

  return (
    <div className="print-preview-overlay">
      <motion.div 
        className="print-preview-content-large"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <div className="preview-main">
          <div className="preview-header">
            <div className="header-title">
              <Eye size={24} className="text-primary" />
              <h2>Visualização em Tempo Real</h2>
            </div>
            <button className="close-btn" onClick={onClose}><X size={20} /></button>
          </div>

          <div className="preview-body">
            <div className="pages-grid real-preview">
              {calculatedPages.map((page, idx) => (
                <PagePreview 
                  key={page.id}
                  type={page.type}
                  data={page.data}
                  settings={settings}
                  pageNumber={idx + 1}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="preview-sidebar">
          <div className="sidebar-header">
            <Settings size={18} />
            <h3>Configurações</h3>
          </div>

          <div className="sidebar-sections">
            <div className="sidebar-section">
              <label>Margem das Páginas ({settings.margin}mm)</label>
              <input 
                type="range" 
                min="0" 
                max="25" 
                step="5"
                value={settings.margin} 
                onChange={e => setSettings(s => ({ ...s, margin: parseInt(e.target.value) }))} 
              />
            </div>

            <div className="sidebar-section">
              <label>Escala do Tabuleiro ({Math.round(settings.boardScale * 100)}%)</label>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1"
                value={settings.boardScale} 
                onChange={e => setSettings(s => ({ ...s, boardScale: parseFloat(e.target.value) }))} 
              />
            </div>

            <div className="sidebar-section">
              <label>Conteúdo do Kit</label>
              <div className="toggle-group">
                <div className="toggle-item" onClick={() => setSettings(s => ({ ...s, includeBoard: !s.includeBoard }))}>
                  <div className={`checkbox ${settings.includeBoard ? 'checked' : ''}`}><Check size={12} /></div>
                  <span>Tabuleiro (A4 x2)</span>
                </div>
                <div className="toggle-item" onClick={() => setSettings(s => ({ ...s, includeStandardCards: !s.includeStandardCards }))}>
                  <div className={`checkbox ${settings.includeStandardCards ? 'checked' : ''}`}><Check size={12} /></div>
                  <span>Cartas Padrão</span>
                </div>
                <div className="toggle-item" onClick={() => setSettings(s => ({ ...s, includeCustomCards: !s.includeCustomCards }))}>
                  <div className={`checkbox ${settings.includeCustomCards ? 'checked' : ''}`}><Check size={12} /></div>
                  <span>Cartas do Ateliê</span>
                </div>
                <div className="toggle-item" onClick={() => setSettings(s => ({ ...s, includeAccessories: !s.includeAccessories }))}>
                  <div className={`checkbox ${settings.includeAccessories ? 'checked' : ''}`}><Check size={12} /></div>
                  <span>Peões e Apoio</span>
                </div>
                <div className="toggle-item" onClick={() => setSettings(s => ({ ...s, includeBlankCards: !s.includeBlankCards }))}>
                  <div className={`checkbox ${settings.includeBlankCards ? 'checked' : ''}`}><Check size={12} /></div>
                  <span>Modelos em Branco</span>
                </div>
              </div>
            </div>


          </div>

          <div className="sidebar-footer">
            <button 
              className={`btn-download-pdf ${isGenerating ? 'loading' : ''}`}
              onClick={() => onDownload(settings)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="spinner-small" />
                  <span>GERANDO...</span>
                </>
              ) : (
                <>
                  <FileDown size={20} />
                  <span>BAIXAR PDF</span>
                </>
              )}
            </button>
            <button className="btn-cancel-full" onClick={onClose}>Cancelar</button>
          </div>
        </div>
      </motion.div>

      {/* Hidden Export Area removed from here as it's now in SettingsModal to keep state persistent */}
    </div>
  );
};

export const AboutModal = ({ onClose }) => (
  <ModalWrapper title="Sobre o Jogo" onClose={onClose}>
    <div className="about-content">
      <div className="about-section">
        <h3>Psicoscópio v2.0</h3>
        <p>
          Um jogo de tabuleiro educativo projetado para estimular o autoconhecimento 
          e o aprendizado através de desafios e reflexões.
        </p>
      </div>
      
      <div className="about-section">
        <h3>Como Jogar</h3>
        <ul className="tutorial-list">
          <li><div className="bullet">1</div> Jogue o dado para avançar no tabuleiro.</li>
          <li><div className="bullet">2</div> Complete desafios para ganhar pontos.</li>
          <li><div className="bullet">3</div> Reflita sobre as perguntas em cada casa.</li>
        </ul>
      </div>

      <div className="about-footer">
        <p>© 2026 Psicoscópio Team</p>
        <div className="credits">
          Desenvolvido com dedicação para a Jornada do Conhecimento
        </div>
      </div>
    </div>
  </ModalWrapper>
);

export const CustomCardsModal = ({ onClose }) => (
  <motion.div 
    className="collection-modal-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div 
      className="collection-modal-content"
      initial={{ scale: 0.9, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 50 }}
      onClick={e => e.stopPropagation()}
    >
      <CustomCardsGallery isModal={true} onClose={onClose} />
    </motion.div>
  </motion.div>
);

