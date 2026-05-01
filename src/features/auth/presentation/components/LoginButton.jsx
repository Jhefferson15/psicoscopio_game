import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../state/AuthContext.jsx';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

export const LoginButton = () => {
  const { user, login, logout, loading, isFirebaseConfigured } = useAuth();

  if (!isFirebaseConfigured) {
    return (
      <div className="auth-missing-badge">
        <span>Modo Offline (Firebase não configurado)</span>
      </div>
    );
  }


  if (loading) {
    return (
      <button className="btn-secondary full-width" disabled>
        <span className="loader"></span>
        <span>Carregando...</span>
      </button>
    );
  }

  if (user) {
    return (
      <div className="user-profile-container">
        <div className="user-info-badge">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.name} className="user-avatar" />
          ) : (
            <div className="user-avatar-placeholder">
              <UserIcon size={16} />
            </div>
          )}
          <span className="user-name">{user.name}</span>
        </div>
        <motion.button 
          className="btn-tertiary"
          onClick={logout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Sair"
        >
          <LogOut size={18} />
        </motion.button>
      </div>
    );
  }

  return (
    <motion.button 
      className="btn-google full-width"
      onClick={login}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" className="google-icon">
        <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.66l3.21-3.21C17.54 1.83 14.99 1 12 1 7.37 1 3.4 3.66 1.41 7.58l3.77 2.92C6.07 6.8 8.81 5.04 12 5.04z" />
        <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.87c2.16-1.99 3.41-4.92 3.41-8.58z" />
        <path fill="#FBBC05" d="M5.18 14.5c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.41 7.01C.51 8.52 0 10.2 0 12c0 1.8.51 3.48 1.41 4.99l3.77-2.49z" />
        <path fill="#34A853" d="M12 23c3.15 0 5.8-1.04 7.74-2.82l-3.69-2.87c-1.08.72-2.47 1.15-4.05 1.15-3.1 0-5.73-2.09-6.67-4.92l-3.77 2.92C3.4 20.34 7.37 23 12 23z" />
      </svg>
      <span>Entrar com Google</span>
    </motion.button>
  );
};
