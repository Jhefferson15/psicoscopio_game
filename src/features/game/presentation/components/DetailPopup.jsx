import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';
import './DetailPopup.css';

const DetailPopup = ({ isOpen, onClose, data }) => {
  if (!data) return null;

  const { title, description, icon: Icon, color } = data;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="detail-popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="detail-popup-container glass-light"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{ '--accent-color': color || 'var(--primary)' }}
          >
            <button className="btn-close-detail" onClick={onClose} title="Fechar">
              <X size={20} />
            </button>

            <div className="detail-popup-header">
              <div className="detail-icon-wrapper" style={{ background: color || 'var(--primary)' }}>
                {Icon ? <Icon size={32} color="white" /> : <Info size={32} color="white" />}
              </div>
              <div className="detail-title-group">
                <span className="detail-subtitle">INFORMAÇÕES</span>
                <h2 className="detail-title">{title}</h2>
              </div>
            </div>

            <div className="detail-popup-body">
              <p className="detail-description">{description || "Nenhuma informação disponível para este item."}</p>
            </div>

            <div className="detail-popup-footer">
              <button className="btn-confirm-detail" onClick={onClose}>
                Entendido
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DetailPopup;
