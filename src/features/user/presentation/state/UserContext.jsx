import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../../auth/presentation/state/useAuth';
import { FirestoreUserRepository } from '../../data/repositories/FirestoreUserRepository';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [diary, setDiary] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const userRepository = new FirestoreUserRepository();

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setStats(null);
      setDiary([]);
      setLoading(false);
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const userStats = await userRepository.getUserStats(user.id);
      const userDiary = await userRepository.getDiaryEntries(user.id);
      setStats(userStats);
      setDiary(userDiary);
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const addDiaryEntry = async (text, type, mood) => {
    if (!user) return;
    const entry = {
      id: Date.now(),
      text,
      type,
      mood,
      date: new Date().toISOString()
    };
    
    try {
      await userRepository.saveDiaryEntry(user.id, entry);
      setDiary(prev => [entry, ...prev]);
    } catch (error) {
      console.error("Erro ao salvar no diário:", error);
    }
  };

  const updateStats = async (newStats) => {
    if (!user) return;
    try {
      const updated = { ...stats, ...newStats };
      await userRepository.syncUserData(user.id, { stats: updated });
      setStats(updated);
    } catch (error) {
      console.error("Erro ao atualizar estatísticas:", error);
    }
  };

  return (
    <UserContext.Provider value={{ stats, diary, loading, addDiaryEntry, updateStats }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser deve ser usado dentro de um UserProvider");
  return context;
};
