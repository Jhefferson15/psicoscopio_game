import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../state/useGame';
import { Trash2, Brush, Plus, Brain, Sprout, Puzzle, Image as ImageIcon, Type, Upload, Layers, RotateCcw, CheckCircle, Undo2, Redo2, Eraser } from 'lucide-react';
import { GAME_CARDS } from '../../domain/gameConstants';
import { CustomCard } from '../../domain/entities/CustomCard';
import { customCardRepository } from '../../data/repositories/LocalStorageCardRepository';
import { CustomCardsModal } from './MenuModals';
import './CardCreator.css';

const CardCreator = () => {
  const { finishCardCreation } = useGame();
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#D84B42');
  const [lineWidth, setLineWidth] = useState(6);
  const [selectedType, setSelectedType] = useState(GAME_CARDS[0]);
  const [createdCount, setCreatedCount] = useState(0);
  
  // New States for Modes
   const [creationMode, setCreationMode] = useState('drawing'); // 'drawing' | 'text' | 'image'
   const [cardText, setCardText] = useState('');
   const [uploadedImage, setUploadedImage] = useState(null);
   const [isCanvasDirty, setIsCanvasDirty] = useState(false);
   const [showCollection, setShowCollection] = useState(false);
   const [isEraser, setIsEraser] = useState(false);
   const [history, setHistory] = useState([]);
   const [historyStep, setHistoryStep] = useState(-1);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imgData);
    if (newHistory.length > 20) newHistory.shift();
    
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  }, [history, historyStep]);

  const undo = () => {
    if (historyStep <= 0) return;
    const newStep = historyStep - 1;
    setHistoryStep(newStep);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(history[newStep], 0, 0);
  };

  const redo = () => {
    if (historyStep >= history.length - 1) return;
    const newStep = historyStep + 1;
    setHistoryStep(newStep);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(history[newStep], 0, 0);
  };

  const initCanvas = useCallback(() => {
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save initial state
      const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialData]);
      setHistoryStep(0);
    }, 0);
  }, []);

  useEffect(() => {
    if (creationMode === 'drawing') {
      initCanvas();
    }
  }, [creationMode, initCanvas]);

  const startDrawing = (e) => {
    if (creationMode !== 'drawing') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = ((e.clientX || (e.touches && e.touches[0].clientX)) - rect.left) * scaleX;
    const y = ((e.clientY || (e.touches && e.touches[0].clientY)) - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = isEraser ? '#ffffff' : color;
    ctx.lineWidth = isEraser ? lineWidth * 2 : lineWidth;
    setIsDrawing(true);
    setIsCanvasDirty(true);
  };

  const draw = useCallback((e) => {
    if (!isDrawing || creationMode !== 'drawing') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = ((e.clientX || (e.touches && e.touches[0].clientX)) - rect.left) * scaleX;
    const y = ((e.clientY || (e.touches && e.touches[0].clientY)) - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing, creationMode]);

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      saveToHistory();
      setIsDrawing(false);
    }
  }, [isDrawing, saveToHistory]);

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDrawing) draw(e);
    };
    
    const handleGlobalMouseUp = () => {
      if (isDrawing) stopDrawing();
    };

    if (isDrawing) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchmove', handleGlobalMouseMove, { passive: false });
      window.addEventListener('touchend', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalMouseMove);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isDrawing, draw, stopDrawing]);

  const clearCanvas = () => {
    if (creationMode === 'drawing') {
      initCanvas();
      setIsCanvasDirty(false);
    }
    else if (creationMode === 'text') setCardText('');
    else if (creationMode === 'image') setUploadedImage(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isCurrentCardValid = () => {
    if (creationMode === 'drawing') return isCanvasDirty;
    if (creationMode === 'text') return cardText.trim().length > 0;
    if (creationMode === 'image') return !!uploadedImage;
    return false;
  };

  const saveCurrentCard = async () => {
    let content = '';
    if (creationMode === 'drawing' && canvasRef.current) {
      content = canvasRef.current.toDataURL();
    } else if (creationMode === 'text') {
      content = cardText;
    } else if (creationMode === 'image') {
      content = uploadedImage;
    }

    if (!isCurrentCardValid()) return;

    const newCard = new CustomCard({
      type: selectedType.type,
      content: content,
      contentType: creationMode,
      color: selectedType.color
    });

    await customCardRepository.saveCard(newCard);
  };

  const handleCreateMore = async () => {
    await saveCurrentCard();
    setCreatedCount(prev => prev + 1);
    clearCanvas();
  };

  const handleFinish = async () => {
    // Save last card if it has content
    if (isCurrentCardValid()) {
      await saveCurrentCard();
    }
    finishCardCreation();
  };

  const colors = [
    { hex: '#D84B42', name: 'Coral' },
    { hex: '#4885CE', name: 'Sky' },
    { hex: '#7B4BB1', name: 'Royal' },
    { hex: '#F59E0B', name: 'Amber' },
    { hex: '#10B981', name: 'Emerald' },
    { hex: '#1e293b', name: 'Slate' },
    { hex: '#F43F5E', name: 'Rose' },
    { hex: '#EC4899', name: 'Pink' },
    { hex: '#D946EF', name: 'Fuchsia' },
    { hex: '#8B5CF6', name: 'Violet' },
    { hex: '#6366F1', name: 'Indigo' },
    { hex: '#3B82F6', name: 'Blue' },
    { hex: '#0EA5E9', name: 'Sky Blue' },
    { hex: '#06B6D4', name: 'Cyan' },
    { hex: '#14B8A6', name: 'Teal' },
    { hex: '#84CC16', name: 'Lime' },
    { hex: '#EAB308', name: 'Yellow' },
    { hex: '#F97316', name: 'Orange' },
  ];

  const modes = [
    { id: 'drawing', label: 'Desenho', icon: <Brush size={16} /> },
    { id: 'text', label: 'Texto', icon: <Type size={16} /> },
    { id: 'image', label: 'Imagem', icon: <Upload size={16} /> },
  ];

  return (
    <motion.div 
      className="card-creator-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="creator-ambient-bg"></div>
      
      <div className="creator-layout glass-panel">
        <header className="creator-top-bar">
          <div className="creator-main-title">
            <ImageIcon className="title-icon" size={24} />
            <h1>Ateliê de Cartas</h1>
          </div>

          <div className="creator-header-actions">
            <button 
              className="btn-collection-minimal" 
              onClick={() => setShowCollection(true)}
              title="Ver Minha Coleção"
            >
              <Layers size={18} />
              <span>Coleção</span>
            </button>
            <div className="creation-progress">
               <div className="progress-label">Cartas Criadas</div>
               <div className="progress-badge">{createdCount}</div>
            </div>
          </div>
        </header>

        <div className="creator-body">
          <section className="canvas-section">
             <div className="card-mockup-container">
                <motion.div 
                  className="card-mockup"
                  key={selectedType.type + creationMode}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ '--accent-color': selectedType.color }}
                >
                  <div className="card-inner-frame">
                    <div className="card-header-badge" style={{ background: selectedType.color }}>
                       {selectedType.icon === 'brain' && <Brain size={14} />}
                       {selectedType.icon === 'plant' && <Sprout size={14} />}
                       {selectedType.icon === 'puzzle' && <Puzzle size={14} />}
                       {selectedType.icon === 'cycle' && <RotateCcw size={14} />}
                       <span>{selectedType.type}</span>
                    </div>
                    
                    <div className="canvas-surface">
                      {creationMode === 'drawing' && (
                        <canvas
                          ref={canvasRef}
                          width={380}
                          height={520}
                          onMouseDown={startDrawing}
                          onTouchStart={startDrawing}
                          className="drawing-canvas"
                        />
                      )}
                      {creationMode === 'text' && (
                        <div className="text-preview-surface">
                           <div className="preview-text-content">
                              {cardText || 'Sua mensagem aqui...'}
                           </div>
                        </div>
                      )}
                      {creationMode === 'image' && (
                        <div className="image-preview-surface">
                           {uploadedImage ? (
                             <img src={uploadedImage} alt="Uploaded" className="card-image-preview" />
                           ) : (
                             <div className="image-placeholder">
                               <ImageIcon size={48} opacity={0.2} />
                               <p>Nenhuma imagem selecionada</p>
                             </div>
                           )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
             </div>
          </section>

          <aside className="toolbox-section">
            <div className="tool-group">
              <label>Modo de Criação</label>
              <div className="mode-selector">
                {modes.map(mode => (
                  <button 
                    key={mode.id}
                    className={`mode-btn ${creationMode === mode.id ? 'active' : ''}`}
                    onClick={() => setCreationMode(mode.id)}
                  >
                    {mode.icon}
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="tool-group">
              <label>Categoria</label>
              <div className="type-chips">
                {GAME_CARDS.map(type => (
                  <button 
                    key={type.type}
                    className={`type-chip ${selectedType.type === type.type ? 'active' : ''}`}
                    style={{ '--chip-color': type.color }}
                    onClick={() => {
                        setSelectedType(type);
                        setIsEraser(false);
                    }}
                  >
                    {type.type}
                  </button>
                ))}
              </div>
            </div>

            <div className="tool-group-container">
              {creationMode === 'drawing' && (
                <>
                  <div className="drawing-actions-row">
                    <div className="undo-redo-btns">
                      <button 
                        className="btn-history" 
                        onClick={undo} 
                        disabled={historyStep <= 0}
                        title="Desfazer"
                      >
                        <Undo2 size={18} />
                      </button>
                      <button 
                        className="btn-history" 
                        onClick={redo} 
                        disabled={historyStep >= history.length - 1}
                        title="Refazer"
                      >
                        <Redo2 size={18} />
                      </button>
                    </div>
                    <button 
                      className={`btn-eraser ${isEraser ? 'active' : ''}`} 
                      onClick={() => setIsEraser(!isEraser)}
                      title="Borracha"
                    >
                      <Eraser size={18} />
                      <span>Borracha</span>
                    </button>
                  </div>

                  <div className="tool-group">
                    <label>Paleta de Cores</label>
                    <div className="color-swatches">
                      {colors.map(c => (
                        <button 
                          key={c.hex}
                          className={`swatch ${color === c.hex && !isEraser ? 'active' : ''}`}
                          style={{ background: c.hex }}
                          onClick={() => {
                            setColor(c.hex);
                            setIsEraser(false);
                          }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="tool-group">
                    <div className="tool-header">
                      <label>Traço</label>
                      <span className="value-display">{lineWidth}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="2" 
                      max="30" 
                      value={lineWidth} 
                      onChange={(e) => setLineWidth(parseInt(e.target.value))}
                      className="premium-slider"
                    />
                  </div>
                </>
              )}

              {creationMode === 'text' && (
                <div className="tool-group">
                  <label>Texto da Carta</label>
                  <textarea 
                    className="premium-textarea"
                    placeholder="Escreva sua reflexão ou desafio..."
                    value={cardText}
                    onChange={(e) => setCardText(e.target.value)}
                    maxLength={150}
                  />
                  <div className="char-count">{cardText.length}/150</div>
                </div>
              )}

              {creationMode === 'image' && (
                <div className="tool-group">
                  <label>Carregar Imagem</label>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <button className="btn-upload-premium" onClick={() => fileInputRef.current.click()}>
                     <Upload size={18} />
                     <span>Escolher Arquivo</span>
                  </button>
                  <p className="upload-hint">Use imagens com proporção vertical para melhor resultado.</p>
                </div>
              )}

              <div className="tool-group footer-tools">
                <button className="btn-outline-danger" onClick={clearCanvas}>
                  <Trash2 size={18} />
                  <span>Limpar {creationMode === 'drawing' ? 'Canvas' : creationMode === 'text' ? 'Texto' : 'Imagem'}</span>
                </button>
              </div>
            </div>
          </aside>
        </div>

        <footer className="creator-action-bar">
           <button 
             className={`btn-premium-secondary ${!isCurrentCardValid() ? 'disabled' : ''}`} 
             onClick={handleCreateMore}
             disabled={!isCurrentCardValid()}
           >
              <Plus size={20} />
              <span>Adicionar ao Baralho</span>
           </button>
            <button className="btn-premium-primary" onClick={handleFinish}>
              <span>{isCurrentCardValid() ? 'Finalizar e Jogar' : 'Concluir sem salvar atual'}</span>
              <CheckCircle size={20} />
            </button>
        </footer>
      </div>

      <AnimatePresence>
        {showCollection && (
          <CustomCardsModal onClose={() => setShowCollection(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CardCreator;
