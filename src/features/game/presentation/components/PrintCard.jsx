import { Sparkles, Brain, Zap, Puzzle, Award, Palette, HelpCircle, Brush } from 'lucide-react';
import './PrintCard.css';

const cardTypes = {
  reflexao: {
    icon: Brain,
    color: '#7B4BB1',
    label: 'Reflexão',
    gradient: 'linear-gradient(135deg, #7B4BB1, #5a3683)',
    pattern: 'radial-gradient(#7B4BB1 0.4px, transparent 0.4px)',
  },
  desafio: {
    icon: Zap,
    color: '#D84B42',
    label: 'Desafio',
    gradient: 'linear-gradient(135deg, #D84B42, #b33931)',
    pattern: 'radial-gradient(#D84B42 0.4px, transparent 0.4px)',
  },
  sorte: {
    icon: Sparkles,
    color: '#F4C746',
    label: 'Sorte',
    gradient: 'linear-gradient(135deg, #F4C746, #d4a726)',
    pattern: 'radial-gradient(#F4C746 0.4px, transparent 0.4px)',
  },
  memoria: {
    icon: Puzzle,
    color: '#4885CE',
    label: 'Memória',
    gradient: 'linear-gradient(135deg, #4885CE, #3567a5)',
    pattern: 'radial-gradient(#4885CE 0.4px, transparent 0.4px)',
  },
  experiencia: {
    icon: Award,
    color: '#6FB05E',
    label: 'Experiência',
    gradient: 'linear-gradient(135deg, #6FB05E, #558a47)',
    pattern: 'radial-gradient(#6FB05E 0.4px, transparent 0.4px)',
  },
  custom: {
    icon: Palette,
    color: '#94A3B8',
    label: 'Customizada',
    gradient: 'linear-gradient(135deg, #94A3B8, #64748b)',
    pattern: 'radial-gradient(#94A3B8 0.4px, transparent 0.4px)',
  },
  default: {
    icon: HelpCircle,
    color: '#94a3b8',
    label: 'Info',
    gradient: 'linear-gradient(135deg, #94a3b8, #64748b)',
    pattern: 'radial-gradient(#94a3b8 0.4px, transparent 0.4px)',
  }
};

export const PrintCard = ({ 
  type = 'default', 
  text = '', 
  index = 0, 
  isBlank = false,
  isCustom = false,
  isBack = false
}) => {
  const config = cardTypes[type] || cardTypes.default;
  const Icon = config.icon;

  if (isBack) {
    return (
      <div className={`print-card is-back ${isCustom ? 'is-custom' : ''}`} style={{ '--card-gradient': config.gradient, '--card-color': config.color }}>
        <div className="card-back-pattern" />
        <div className="card-back-content">
          <div className="logo-symbol">
            <div className="icon-group">
              <Icon size={60} color="white" opacity={0.9} strokeWidth={1.5} />
              {isCustom && <Brush size={30} color="white" className="custom-indicator-large" strokeWidth={2} />}
            </div>
          </div>
          <span className="cover-label">
            {isCustom ? `CUSTOM\n${config.label.toUpperCase()}` : config.label.toUpperCase()}
          </span>
          <div className="footer-brand-back">PSICOSCÓPIO</div>
        </div>
        
        {/* Cut lines helpers */}
        <div className="cut-mark corner-tl" />
        <div className="cut-mark corner-tr" />
        <div className="cut-mark corner-bl" />
        <div className="cut-mark corner-br" />
      </div>
    );
  }

  return (
    <div className={`print-card ${isBlank ? 'is-blank' : ''}`} style={{ '--card-color': config.color }}>
      <div className="print-card-pattern" style={{ backgroundImage: config.pattern }} />
      
      <div className="print-card-content">
        <div className="print-card-header" style={{ borderBottomColor: config.color }}>
          <div className="print-header-icons">
            <Icon size={18} color={config.color} strokeWidth={2.5} />
            {isCustom && <Brush size={12} color={config.color} className="custom-indicator" />}
          </div>
          <span className="print-category-label" style={{ color: config.color }}>
            {isCustom ? `CUSTOM ${config.label.toUpperCase()}` : config.label.toUpperCase()}
          </span>
        </div>
        
        <div className="print-card-body">
          {!isBlank ? (
            <p className="print-card-text">{text}</p>
          ) : (
            <div className="print-blank-lines">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="blank-line" />)}
            </div>
          )}
        </div>

        <div className="print-card-footer">
          <div className="footer-line" style={{ backgroundColor: config.color }} />
          <div className="footer-content">
            <span className="footer-brand">PSICOSCÓPIO</span>
            <span className="footer-id">#{String(index + 1).padStart(3, '0')}</span>
          </div>
        </div>
      </div>
      
      {/* Cut lines helpers */}
      <div className="cut-mark corner-tl" />
      <div className="cut-mark corner-tr" />
      <div className="cut-mark corner-bl" />
      <div className="cut-mark corner-br" />
    </div>
  );
};

export default PrintCard;
