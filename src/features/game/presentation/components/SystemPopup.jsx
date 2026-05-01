import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, HelpCircle } from 'lucide-react';
import { useGame } from '../state/useGame';
import './SystemPopup.css';

const SystemPopup = () => {
  const { systemPopup, closeSystemPopup } = useGame();

  if (!systemPopup) return null;

  const { 
    title, 
    message, 
    type = 'info', 
    onConfirm, 
    onCancel,
    confirmText = 'OK',
    cancelText = 'Cancelar'
  } = systemPopup;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 size={32} />;
      case 'error': return <AlertCircle size={32} />;
      case 'confirm': return <HelpCircle size={32} />;
      default: return <Info size={32} />;
    }
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeSystemPopup();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeSystemPopup();
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="system-popup-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleCancel}
      >
        <motion.div 
          className="system-popup-content"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          <div className={`popup-icon-wrapper ${type}`}>
            {getIcon()}
          </div>

          <div className="popup-text">
            <h3>{title}</h3>
            <p>{message}</p>
          </div>

          <div className="popup-actions">
            {(type === 'confirm' || onCancel) && (
              <button className="popup-btn btn-cancel" onClick={handleCancel}>
                {cancelText}
              </button>
            )}
            <button className="popup-btn btn-confirm" onClick={handleConfirm}>
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SystemPopup;
