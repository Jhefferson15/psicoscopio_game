import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../auth/presentation/state/useAuth';
import { FirestoreUserRepository } from '../../data/repositories/FirestoreUserRepository';
import { UserContext } from './UserContext';
import { firebaseCardRepository } from '../../../game/data/repositories/FirebaseCardRepository';
import { CustomCard } from '../../../game/domain/entities/CustomCard';

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [diary, setDiary] = useState([]);
  const [cloudCardSets, setCloudCardSets] = useState([]);
  const [cloudBoardConfigs, setCloudBoardConfigs] = useState([]);
  const [cloudCustomCards, setCloudCustomCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const userRepository = useMemo(() => new FirestoreUserRepository(), []);

  const loadUserData = useCallback(async () => {
    if (!user || isLoaded) return;
    setLoading(true);
    try {
      const [userStats, userDiary, userCardSets, userBoardConfigs, userCustomCards] = await Promise.all([
        userRepository.getUserStats(user.id),
        userRepository.getDiaryEntries(user.id),
        userRepository.getCardSets(user.id),
        userRepository.getBoardConfigs(user.id),
        firebaseCardRepository.getCards(user.id)
      ]);

      setStats(userStats);
      setDiary(userDiary);
      setCloudCardSets(userCardSets);
      setCloudBoardConfigs(userBoardConfigs);
      // Map Firestore data back to CustomCard objects if needed
      setCloudCustomCards(userCustomCards.map(c => c instanceof CustomCard ? c.toJSON() : c));
      setIsLoaded(true);
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    } finally {
      setLoading(false);
    }
  }, [user, userRepository, isLoaded]);

  useEffect(() => {
    if (user) {
      if (!isLoaded) {
        // Usamos um microtask para evitar o aviso de set-state-in-effect em alguns linters
        Promise.resolve().then(() => loadUserData());
      }
    } else {
      Promise.resolve().then(() => {
        setStats(null);
        setDiary([]);
        setCloudCardSets([]);
        setCloudBoardConfigs([]);
        setCloudCustomCards([]);
        setLoading(false);
        setIsLoaded(false);
      });
    }
  }, [user, loadUserData, isLoaded]);

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

  const syncCustomCardToCloud = async (cardData) => {
    if (!user) return;
    try {
      // Cria a entidade a partir do JSON para que o repository saiba lidar com ela
      const cardEntity = CustomCard.fromJSON({ ...cardData, userId: user.id });
      const savedCard = await firebaseCardRepository.saveCard(cardEntity);
      
      if (savedCard) {
        setCloudCustomCards(prev => {
          const index = prev.findIndex(c => c.id === savedCard.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = savedCard.toJSON();
            return updated;
          }
          return [...prev, savedCard.toJSON()];
        });
      }
    } catch (error) {
      console.error("Erro ao sincronizar carta customizada:", error);
    }
  };

  const deleteCustomCardFromCloud = async (cardId) => {
    if (!user) return;
    try {
      await firebaseCardRepository.deleteCard(cardId); 
      setCloudCustomCards(prev => prev.filter(c => c.id !== cardId));
    } catch (error) {
      console.error("Erro ao deletar carta customizada da nuvem:", error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      stats, 
      diary, 
      cloudCardSets,
      cloudBoardConfigs,
      cloudCustomCards,
      loading, 
      addDiaryEntry, 
      removeDiaryEntry, 
      updateDiaryEntry, 
      updateStats,
      syncCardSetsToCloud,
      syncBoardConfigsToCloud,
      syncCustomCardToCloud,
      deleteCustomCardFromCloud
    }}>
      {children}
    </UserContext.Provider>
  );
};
