import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../state/GameContext';
import { Palette, Trash2, CheckCircle, ChevronLeft, Brush, Square, Plus, Brain, Sprout, Puzzle, RotateCcw, Image as ImageIcon, Type, Upload } from 'lucide-react';
import { GAME_CARDS } from '../../domain/gameConstants';
import { CustomCard } from '../../domain/entities/CustomCard';
import { customCardRepository } from '../../data/repositories/LocalStorageCardRepository';
import './CardCreator.css';

const CardCreator = () => {
  const { finishCardCreation, goToMenu } = useGame();
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

  useEffect(() => {
    if (creationMode === 'drawing') {
      initCanvas();
    }
  }, [creationMode]);

  const initCanvas = () => {
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, 0);
  };

  const startDrawing = (e) => {
    if (creationMode !== 'drawing') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || creationMode !== 'drawing') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (creationMode === 'drawing') initCanvas();
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

  const saveCurrentCard = async () => {
    let content = '';
    if (creationMode === 'drawing' && canvasRef.current) {
      content = canvasRef.current.toDataURL();
    } else if (creationMode === 'text') {
      content = cardText;
    } else if (creationMode === 'image') {
      content = uploadedImage;
    }

    if (!content && creationMode !== 'drawing') return; // Don't save empty text/image

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
    if (cardText || uploadedImage || (creationMode === 'drawing')) {
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

          <div className="creation-progress">
             <div className="progress-label">Cartas Criadas</div>
             <div className="progress-badge">{createdCount}</div>
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
                          width={320}
                          height={440}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
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
                    
                    <div className="card-footer-decoration">
                      <div className="footer-line"></div>
                      <div className="footer-dot"></div>
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
                    onClick={() => setSelectedType(type)}
                  >
                    {type.type}
                  </button>
                ))}
              </div>
            </div>

            {creationMode === 'drawing' && (
              <>
                <div className="tool-group">
                  <label>Paleta de Cores</label>
                  <div className="color-swatches">
                    {colors.map(c => (
                      <button 
                        key={c.hex}
                        className={`swatch ${color === c.hex ? 'active' : ''}`}
                        style={{ background: c.hex }}
                        onClick={() => setColor(c.hex)}
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
          </aside>
        </div>

        <footer className="creator-action-bar">
           <button className="btn-premium-secondary" onClick={handleCreateMore}>
              <Plus size={20} />
              <span>Adicionar ao Baralho</span>
           </button>
            <button className="btn-premium-primary" onClick={handleFinish}>
              <span>Finalizar e Jogar</span>
              <CheckCircle size={20} />
            </button>
        </footer>
      </div>
    </motion.div>
  );
};

export default CardCreator;
