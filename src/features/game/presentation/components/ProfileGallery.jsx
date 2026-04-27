import React, { useState } from 'react';
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

const ProfileGallery = () => {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div className="profile-gallery-wrapper">
      <div className="gallery-header">
        <Award size={18} className="text-gold" />
        <h3>GALERIA DE PERFIS</h3>
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
                  <div className="profile-stats-mini">
                    <div className="stat-row">
                      <span>Afinidade</span>
                      <div className="stat-bar">
                        <motion.div 
                          className="stat-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${75 + index * 5}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProfileGallery;
