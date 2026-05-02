import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X } from 'lucide-react';
import SlideToConfirm from './SlideToConfirm';
import { useGame } from '../state/useGame';
import './ConfirmLeaveModal.css';

const ConfirmLeaveModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="leave-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="leave-modal-content glass-panel"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <button className="leave-modal-close" onClick={onCancel}>
            <X size={20} />
          </button>

          <div className="leave-modal-header">
            <div className="leave-icon-wrapper">
              <LogOut size={32} />
            </div>
            <h2>Sair da Partida?</h2>
            <p>Seu progresso atual nesta sessão será perdido. Tem certeza que deseja abandonar a jornada?</p>
          </div>

          <div className="leave-modal-body">
            <SlideToConfirm 
              onConfirm={onConfirm} 
              label="Deslize para sair" 
              successLabel="Saindo..."
            />
          </div>

          <div className="leave-modal-footer">
            <button className="btn-cancel-leave" onClick={onCancel}>
              Continuar Jogando
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmLeaveModal;
