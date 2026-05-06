import React, { useState } from 'react';
import { ShieldAlert, X, Flag, AlertTriangle, MessageSquare, Trash2, ShieldOff } from 'lucide-react';
import './ReportCardModal.css';

const REPORT_CATEGORIES = [
  { id: 'inappropriate', label: 'Conteúdo Inapropriado', icon: <Trash2 size={18} /> },
  { id: 'offensive', label: 'Ofensivo ou Discurso de Ódio', icon: <Flag size={18} /> },
  { id: 'spam', label: 'Spam ou Publicidade', icon: <MessageSquare size={18} /> },
  { id: 'quality', label: 'Má Qualidade/Ilegível', icon: <ShieldOff size={18} /> },
  { id: 'other', label: 'Outro', icon: <AlertTriangle size={18} /> }
];

export const ReportCardModal = ({ isOpen, onClose, onConfirm, cardId }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedCategory) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(cardId, selectedCategory);
      onClose();
    } catch (error) {
      console.error("Failed to report card:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal-content" onClick={e => e.stopPropagation()}>
        <div className="report-modal-header">
          <div className="header-title">
            <ShieldAlert className="report-icon" size={24} />
            <h2>Denunciar Carta</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="report-modal-body">
          <p>Por que você está denunciando esta carta?</p>
          <div className="report-categories">
            {REPORT_CATEGORIES.map(category => (
              <button
                key={category.id}
                className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-label">{category.label}</span>
                <div className="category-radio">
                  <div className="radio-inner" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="report-modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="submit-btn" 
            disabled={!selectedCategory || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Denúncia'}
          </button>
        </div>
      </div>
    </div>
  );
};
