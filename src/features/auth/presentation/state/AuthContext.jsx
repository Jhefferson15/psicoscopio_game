import { useEffect, useState } from 'react';
import { AuthContext } from './useAuth.js';
import { FirebaseAuthRepository } from '../../data/repositories/FirebaseAuthRepository.js';
import { isFirebaseConfigured } from '../../../../config/firebase.js';

import { LoginWithGoogleUseCase, LogoutUseCase } from '../../domain/usecases/AuthUseCases.js';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const authRepository = new FirebaseAuthRepository();
  const loginUseCase = new LoginWithGoogleUseCase(authRepository);
  const logoutUseCase = new LogoutUseCase(authRepository);

  useEffect(() => {
    const unsubscribe = authRepository.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      const loggedUser = await loginUseCase.execute();
      setUser(loggedUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUseCase.execute();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isFirebaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
};


