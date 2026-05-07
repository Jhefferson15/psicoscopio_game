import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Eye, Settings, Check, FileDown } from 'lucide-react';
import { useGame } from '../../state/useGame';
import PagePreview from './PagePreview';
import { getPrintPages } from './printUtils';

const PrintPreviewModal = ({ onClose, onDownload, isGenerating }) => {
  const { activeCardSet } = useGame();
  
  const [settings, setSettings] = useState({
    margin: 0,
    overlap: 20, // mm for board overlap
    boardScale: 1.3,
    includeBoard: true,
    includeRules: true,
    includeStandardCards: true,
    includeCustomCards: true,
    includeAccessories: true,
    includeBlankCards: true,
    includeBacks: true 
  });

  const calculatedPages = useMemo(() => {
    return getPrintPages(settings, activeCardSet);
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
                step="1"
                value={settings.margin} 
                onChange={e => setSettings(s => ({ ...s, margin: parseInt(e.target.value) }))} 
              />
            </div>

            <div className="sidebar-section">
              <label>Sobreposição do Tabuleiro ({settings.overlap}mm)</label>
              <input 
                type="range" 
                min="0" 
                max="30" 
                step="1"
                value={settings.overlap} 
                onChange={e => setSettings(s => ({ ...s, overlap: parseInt(e.target.value) }))} 
              />
              <span className="section-hint">Área extra para colar as metades</span>
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
                <div className="toggle-item" onClick={() => setSettings(s => ({ ...s, includeRules: !s.includeRules }))}>
                  <div className={`checkbox ${settings.includeRules ? 'checked' : ''}`}><Check size={12} /></div>
                  <span>Manual de Regras</span>
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
                
                <div className="toggle-divider" />
                
                <div className="toggle-item highlight" onClick={() => setSettings(s => ({ ...s, includeBacks: !s.includeBacks }))}>
                  <div className={`checkbox ${settings.includeBacks ? 'checked' : ''}`}><Check size={12} /></div>
                  <span>Versos Decorativos (Frente e Verso)</span>
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
    </div>
  );
};

export default PrintPreviewModal;
