import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import '../MenuModals.css';

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

export default ModalWrapper;
