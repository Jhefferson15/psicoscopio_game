import { useState, useMemo } from 'react';
import { Volume2, VolumeX, Printer, Brush, Image as ImageIcon, Layout, ClipboardList, RotateCcw, ChevronRight } from 'lucide-react';
import { useGame } from '../../state/useGame';
import { PdfService } from '../../../data/services/PdfService';
import ModalWrapper from './ModalWrapper';
import PrintPreviewModal from '../print/PrintPreviewModal';
import { getPrintPages } from '../print/printUtils';
import PrintProgressModal from '../print/PrintProgressModal';
import PagePreview from '../print/PagePreview';

const PrintExportContent = ({ settings, pageIndex = -1 }) => {
  const { activeCardSet } = useGame();
  
  const calculatedPages = useMemo(() => {
    let pages = getPrintPages(settings, activeCardSet);
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

const SettingsModal = ({ onClose }) => {
  const { 
    settings, 
    setSettings, 
    setCurrentScreen, 
    openCardAtelier, 
    showSystemPopup, 
    activeCardSet
  } = useGame();

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [exportPageIndex, setExportPageIndex] = useState(-1);
  const [printSettings, setPrintSettings] = useState(null);

  const toggleSound = () => setSettings(prev => ({ ...prev, sound: !prev.sound }));

  const handlePrintPdf = async (finalSettings) => {
    setPrintSettings(finalSettings);
    setIsGeneratingPdf(true);
    setPdfProgress(0);
    
    try {
      const pages = getPrintPages(finalSettings, activeCardSet);
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
          left: 0, 
          top: 0, 
          width: '210mm', 
          height: '297mm',
          zIndex: -2000,
          opacity: 0.01,
          pointerEvents: 'none',
          background: 'white',
          overflow: 'hidden'
        }}
      >
        {printSettings && (
          <PrintExportContent settings={printSettings} pageIndex={exportPageIndex} key={exportPageIndex} />
        )}
      </div>
    </ModalWrapper>
  );
};

export default SettingsModal;
