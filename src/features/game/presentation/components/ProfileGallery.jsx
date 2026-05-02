import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LEARNING_PROFILES } from '../../domain/gameConstants';
import { ChevronRight, Award, Zap, Brain, Target, RefreshCw } from 'lucide-react';
import './ProfileGallery.css';

const ProfileIcon = ({ icon, size = 24 }) => {
  switch (icon) {
    case 'brain': return <Brain size={size} />;
    case 'plant': return <Zap size={size} />;
    case 'cycle': return <RefreshCw size={size} />;
    case 'gears': return <Target size={size} />;
    default: return <Award size={size} />;
  }
};

const ProfileGallery = ({ onClose }) => {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ zIndex: 10000 }}
    >
      <motion.div 
        className="modal-content glass-light"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{ padding: '20px', maxWidth: '400px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}
      >
        <div className="gallery-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={18} className="text-gold" />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>GALERIA DE PERFIS</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            &times;
          </button>
        </div>
        
        <div className="profiles-grid-premium">
          {LEARNING_PROFILES.map((profile, index) => (
            <motion.div
              key={profile.id}
              className={`profile-card-premium ${selectedId === profile.id ? 'expanded' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedId(selectedId === profile.id ? null : profile.id)}
              style={{ '--accent-color': profile.color }}
            >
              <div className="card-visual">
                <div className="profile-icon-box">
                  <ProfileIcon icon={profile.icon} />
                </div>
                <div className="profile-main-info">
                  <span className="profile-label">PERFIL</span>
                  <h4 className="profile-title">{profile.title}</h4>
                </div>
                <motion.div 
                  className="expand-indicator"
                  animate={{ rotate: selectedId === profile.id ? 90 : 0 }}
                >
                  <ChevronRight size={16} />
                </motion.div>
              </div>

              <AnimatePresence>
                {selectedId === profile.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="card-details"
                  >
                    <p className="profile-desc">{profile.description}</p>
                    <div style={{ marginTop: '15px', padding: '12px', background: '#fff5f5', borderRadius: '8px', borderLeft: '3px solid #ff4444' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: '#cc0000', fontWeight: '600', lineHeight: '1.4' }}>
                        Nota: Os parâmetros de afinidade e cálculo deste perfil não estão exibidos pois esta funcionalidade ainda não foi implementada por falta de embasamento acadêmico e metodológico.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileGallery;
