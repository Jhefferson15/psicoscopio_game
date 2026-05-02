import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../auth/presentation/state/useAuth';
import { FirestoreUserRepository } from '../../data/repositories/FirestoreUserRepository';
import { UserContext } from './UserContext';

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [diary, setDiary] = useState([]);
  const [cloudCardSets, setCloudCardSets] = useState([]);
  const [cloudBoardConfigs, setCloudBoardConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const userRepository = useMemo(() => new FirestoreUserRepository(), []);

  const loadUserData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userStats = await userRepository.getUserStats(user.id);
      const userDiary = await userRepository.getDiaryEntries(user.id);
      const userCardSets = await userRepository.getCardSets(user.id);
      const userBoardConfigs = await userRepository.getBoardConfigs(user.id);
      setStats(userStats);
      setDiary(userDiary);
      setCloudCardSets(userCardSets);
      setCloudBoardConfigs(userBoardConfigs);
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    } finally {
      setLoading(false);
    }
  }, [user, userRepository]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadUserData();
    } else {
      setStats(null);
      setDiary([]);
      setCloudCardSets([]);
      setCloudBoardConfigs([]);
      setLoading(false);
    }
  }, [user, loadUserData]);

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

  const removeDiaryEntry = async (id) => {
    if (!user) return;
    try {
      await userRepository.deleteDiaryEntry(user.id, id);
      setDiary(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error("Erro ao remover do diário:", error);
    }
  };

  const updateDiaryEntry = async (id, newData) => {
    if (!user) return;
    try {
      await userRepository.updateDiaryEntry(user.id, id, newData);
      setDiary(prev => prev.map(e => e.id === id ? { ...e, ...newData } : e));
    } catch (error) {
      console.error("Erro ao atualizar o diário:", error);
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

  const syncCardSetsToCloud = async (sets) => {
    if (!user) return;
    try {
      await userRepository.saveCardSets(user.id, sets);
      setCloudCardSets(sets);
    } catch (error) {
      console.error("Erro ao sincronizar card sets com a nuvem:", error);
    }
  };

  const syncBoardConfigsToCloud = async (configs) => {
    if (!user) return;
    try {
      await userRepository.saveBoardConfigs(user.id, configs);
      setCloudBoardConfigs(configs);
    } catch (error) {
      console.error("Erro ao sincronizar board configs com a nuvem:", error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      stats, 
      diary, 
      cloudCardSets,
      cloudBoardConfigs,
      loading, 
      addDiaryEntry, 
      removeDiaryEntry, 
      updateDiaryEntry, 
      updateStats,
      syncCardSetsToCloud,
      syncBoardConfigsToCloud
    }}>
      {children}
    </UserContext.Provider>
  );
};
