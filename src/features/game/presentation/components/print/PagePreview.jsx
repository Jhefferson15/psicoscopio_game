import { memo, useRef, useState, useEffect } from 'react';
import {
  Target,
  List,
  RefreshCw,
  Info,
  Brain,
  Zap,
  Sparkles,
  Book,
  Puzzle,
  Award
} from 'lucide-react';
import { GAME_RULES, SYMBOL_DEFINITIONS } from '../../../domain/gameConstants';
import { TILE_ICONS, SPECIAL_ICONS } from '../board_constants';
import BoardView from '../BoardView';
import PrintCard from '../PrintCard';
import '../MenuModals.css';

const CATEGORY_COLORS = {
  memoria: '#4885CE',
  reflexao: '#7B4BB1',
  desafio: '#D84B42',
  experiencia: '#6FB05E',
  sorte: '#F4C746',
  custom: '#94A3B8'
};

export const CardSlot = ({ label, icon, color }) => (
  <div className="card-stack-slot" style={{ '--slot-color': color }}>
    <div className="slot-border" />
    <div className="slot-content">
      <div className="slot-icon">{icon}</div>
      <div className="slot-label">{label}</div>
    </div>
  </div>
);

const PagePreview = memo(({ type, data, settings, pageNumber, isExport = false }) => {
  const { margin } = settings;
  // Limit margin to 4mm for card pages to prevent 3-column overflow
  const isCardPage = type === 'cards' || type === 'blank' || type === 'cards-back' || type === 'blank-back' || type === 'accessories' || type === 'padding';
  const safeMargin = isCardPage ? Math.min(margin, 4) : margin;
  const padding = `${safeMargin}mm`;
  const sheetRef = useRef(null);
  const [scale, setScale] = useState(isExport ? 1 : 0.5);

  useEffect(() => {
    if (isExport || !sheetRef.current) return;

    const updateScale = () => {
      if (!sheetRef.current) return;
      const width = sheetRef.current.offsetWidth;
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
      case 'board-right': {
        const isLeft = type === 'board-left';
        // The board-half-container is 820px wide (base).
        // To center it at the edge, the unscaled offset must be -410px.
        // CSS transforms (scale) happen AFTER positioning.
        const boardScale = settings.boardScale || 1.3;
        const overlapPx = (settings.overlap || 0) * 3.7795275591; // mm to px

        // We want the VISUAL overlap to be overlapPx.
        // VisualOverlap = UnscaledOverlap * boardScale
        // UnscaledOverlap = overlapPx / boardScale
        const unscaledOverlap = overlapPx / boardScale;
        const offset = -410 + unscaledOverlap;

        return (
          <div className="preview-page-board" style={{ padding }}>
            <div className={`board-decorations ${type}`}>
              {isLeft ? (
                <>
                  <div className="board-title-vertical">PSICOSCÓPIO</div>
                  <div className="card-stack-slots">
                    <CardSlot label="MEMÓRIA" icon={<Puzzle size={48} />} color={CATEGORY_COLORS.memoria} />
                    <CardSlot label="REFLEXÃO" icon={<Brain size={48} />} color={CATEGORY_COLORS.reflexao} />
                    <CardSlot label="DESAFIO" icon={<Zap size={48} />} color={CATEGORY_COLORS.desafio} />
                  </div>
                </>
              ) : (
                <>
                  <div className="card-stack-slots">
                    <CardSlot label="EXPERIÊNCIA" icon={<Award size={48} />} color={CATEGORY_COLORS.experiencia} />
                    <CardSlot label="SORTE" icon={<Sparkles size={48} />} color={CATEGORY_COLORS.sorte} />
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

            <div
              className="board-half-container"
              style={{
                [isLeft ? 'right' : 'left']: `${offset}px`,
                transform: `translateY(-50%) scale(${boardScale})`,
                transformOrigin: 'center'
              }}
            >
              <BoardView isReadOnly={true} isMiniature={true} boardRotation={0} />
            </div>

            <div className="board-cut-line" style={{
              right: isLeft ? 0 : 'auto',
              left: !isLeft ? 0 : 'auto',
              opacity: settings.overlap > 0 ? 0.3 : 1
            }} />
          </div>
        );
      }
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
              {data.map((card, i) => card ? (
                <PrintCard
                  key={i}
                  type={card.category}
                  text={card.text}
                  index={i}
                  isBlank={card.isBlank}
                  isCustom={card.category === 'custom'}
                />
              ) : <div key={i} className="preview-mini-card empty-slot" />)}
            </div>
          </div>
        );
      case 'cards-back':
        return (
          <div className="preview-page-cards" style={{ padding }}>
            <div className="preview-cards-grid">
              {data.map((card, i) => card ? (
                <PrintCard
                  key={i}
                  type={card.category}
                  isBack={true}
                  index={i}
                  isBlank={card.isBlank}
                  isCustom={card.category === 'custom'}
                />
              ) : <div key={i} className="preview-mini-card empty-slot" />)}
            </div>
          </div>
        );
      case 'padding':
        return (
          <div className="preview-page-padding">
            <div className="padding-notice">
              <span>Página de Alinhamento (Verso em Branco)</span>
              <p>Esta página garante que as cartas comecem em uma nova folha física.</p>
            </div>
          </div>
        );
      case 'rules':
        return (
          <div className="preview-page-rules" style={{ padding }}>
            <div className="rules-container">
              <header className="rules-header">
                <div className="rules-brand">PSICOSCÓPIO</div>
                <h1>Manual de Instruções e Simbologia</h1>
                <p>{GAME_RULES.about}</p>
              </header>

              <div className="rules-grid">
                <section className="rules-section">
                  <h2><Target size={18} /> Objetivo do Jogo</h2>
                  <p>{GAME_RULES.objective}</p>
                  <p style={{ marginTop: '2mm', fontSize: '11px', fontStyle: 'italic' }}>{GAME_RULES.custom_cards}</p>
                </section>

                <section className="rules-section">
                  <h2><List size={18} /> Preparação (Setup)</h2>
                  <ul>
                    {GAME_RULES.setup.map((step, i) => <li key={i}>{step}</li>)}
                  </ul>
                </section>
              </div>

              <section className="rules-section full-width" style={{ marginBottom: '5mm' }}>
                <h2><RefreshCw size={18} /> Fluxo da Rodada</h2>
                <div className="steps-container">
                  {GAME_RULES.round_flow.map((step, i) => {
                    const [title, desc] = step.split(': ');
                    return (
                      <div key={i} className="step-item">
                        <span className="step-number">{i + 1}</span>
                        <div>
                          <strong>{title}</strong>
                          <p>{desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="symbols-reference">
                <h2>Simbologia e Categorias</h2>
                <div className="symbols-grid">
                  <div className="symbol-column">
                    <h3>Categorias de Cartas</h3>
                    {SYMBOL_DEFINITIONS.categories.map((cat, i) => {
                      const iconKey = cat.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                      const CategoryIcon = TILE_ICONS[iconKey] || Info;
                      return (
                        <div key={i} className="symbol-item">
                          <div className="symbol-icon-circle" style={{ backgroundColor: cat.color }}>
                            <CategoryIcon size={14} color="white" />
                          </div>
                          <div>
                            <strong>{cat.name}</strong>
                            <p>{cat.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="symbol-column">
                    <h3>Casas Especiais</h3>
                    <div className="special-symbols-grid">
                      {SYMBOL_DEFINITIONS.special.map((spec, i) => {
                        const Icon = SPECIAL_ICONS[spec.symbol] || Info;

                        return (
                          <div key={i} className="symbol-item mini">
                            <div className="symbol-icon-circle outline">
                              <Icon size={14} />
                            </div>
                            <div>
                              <strong>{spec.label}</strong>
                              <p>{spec.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <footer className="rules-footer">
                <div className="footer-line" />
                <p>Psicoscópio © 2026 - O Jogo da Aprendizagem Protagonista</p>
              </footer>
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

export default PagePreview;
