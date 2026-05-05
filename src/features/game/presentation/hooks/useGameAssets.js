import { useState, useEffect, useMemo } from 'react';
import { CardSet } from '../../domain/entities/CardSet';
import { BoardConfig } from '../../domain/entities/BoardConfig';
import { CardSetRepository } from '../../data/repositories/CardSetRepository';
import { BoardConfigRepository } from '../../data/repositories/BoardConfigRepository';

export const useGameAssets = ({ user, cloudCardSets, syncCardSetsToCloud, cloudBoardConfigs, syncBoardConfigsToCloud, showSystemPopup, setDrawnCards }) => {

  // Estados para Conjuntos de Cartas
  const [availableCardSets, setAvailableCardSets] = useState(() => {
    const saved = CardSetRepository.getSavedSets();
    return [CardSetRepository.getDefaultSet(), ...saved];
  });

  const [activeCardSet, setActiveCardSet] = useState(() => {
    const saved = CardSetRepository.getSavedSets();
    const activeId = CardSetRepository.getActiveSetId();
    const defaultSet = CardSetRepository.getDefaultSet();
    const allSets = [defaultSet, ...saved];
    return allSets.find(s => s.id === activeId) || defaultSet;
  });

  // Estados para Configuração do Tabuleiro
  const [savedBoardConfigs, setSavedBoardConfigs] = useState(() => {
    return BoardConfigRepository.getSavedConfigs();
  });

  const availableBoardConfigs = useMemo(() => {
    const defaultConfig = BoardConfigRepository.getDefaultConfig();
    const devTestConfig = BoardConfigRepository.getDevTestBoardConfig();
    
    // Filtra para evitar duplicatas se por algum motivo já estiverem no savedBoardConfigs
    const userConfigs = savedBoardConfigs.filter(c => c.id !== 'default' && c.id !== 'teste_dev');
    
    return [defaultConfig, devTestConfig, ...userConfigs];
  }, [savedBoardConfigs]);

  const [activeBoardConfig, setActiveBoardConfig] = useState(() => {
    const activeId = BoardConfigRepository.getActiveConfigId();
    const defaultConfig = BoardConfigRepository.getDefaultConfig();
    const devTestConfig = BoardConfigRepository.getDevTestBoardConfig();
    const allConfigs = [defaultConfig, devTestConfig, ...savedBoardConfigs];
    return allConfigs.find(c => c.id === activeId) || defaultConfig;
  });

  // Sincroniza cartas locais com as da nuvem ao logar
  useEffect(() => {
    if (user && cloudCardSets && cloudCardSets.length > 0) {
      const localSets = CardSetRepository.getSavedSets();
      const mergedMap = new Map();
      
      localSets.forEach(s => mergedMap.set(s.id, s));
      
      cloudCardSets.forEach(cloudSet => {
        const local = mergedMap.get(cloudSet.id);
        if (!local || (cloudSet.updatedAt > (local.updatedAt || 0))) {
          mergedMap.set(cloudSet.id, cloudSet);
        }
      });
      
      const mergedSets = Array.from(mergedMap.values());
      
      CardSetRepository.saveSets(mergedSets);
      
      queueMicrotask(() => {
        const activeId = CardSetRepository.getActiveSetId();
        const defaultSet = CardSetRepository.getDefaultSet();
        const allSets = [defaultSet, ...mergedSets];
        
        setAvailableCardSets(allSets);
        
        const currentActive = allSets.find(s => s.id === activeId) || defaultSet;
        setActiveCardSet(currentActive);
      });
    }
  }, [user, cloudCardSets]);


  // Sincroniza tabuleiros locais com os da nuvem ao logar
  useEffect(() => {
    if (user && cloudBoardConfigs && cloudBoardConfigs.length > 0) {
      const localConfigs = BoardConfigRepository.getSavedConfigs();
      const mergedMap = new Map();
      
      // Primeiro carrega locais
      localConfigs.forEach(c => mergedMap.set(c.id, c));
      
      // Depois mescla com os da nuvem usando updatedAt como critério de desempate
      cloudBoardConfigs.forEach(cloudConfig => {
        const local = mergedMap.get(cloudConfig.id);
        if (!local || (cloudConfig.updatedAt > (local.updatedAt || 0))) {
          mergedMap.set(cloudConfig.id, cloudConfig);
        }
      });
      
      const mergedConfigs = Array.from(mergedMap.values());
      
      BoardConfigRepository.saveConfigs(mergedConfigs);
      
      queueMicrotask(() => {
        const activeId = BoardConfigRepository.getActiveConfigId();
        const savedConfigs = BoardConfigRepository.getSavedConfigs();

        setSavedBoardConfigs(savedConfigs);
        
        // Garante que o tabuleiro ativo reflita os dados mais recentes (ex: sincronizados)
        // O useMemo cuidará de injetar o default e o devTest na lista final
        const defaultConfig = BoardConfigRepository.getDefaultConfig();
        const devTestConfig = BoardConfigRepository.getDevTestBoardConfig();
        const allConfigs = [defaultConfig, devTestConfig, ...savedConfigs];
        const currentActive = allConfigs.find(c => c.id === activeId) || defaultConfig;
        setActiveBoardConfig(currentActive);
      });
    }
  }, [user, cloudBoardConfigs]);


  const changeActiveCardSet = (id) => {
    const set = availableCardSets.find(s => s.id === id);
    if (set) {
      setActiveCardSet(set);
      CardSetRepository.setActiveSetId(id);
      if (setDrawnCards) setDrawnCards({});
    }
  };


  const saveNewCardSet = (name, content) => {
    const newSet = new CardSet(Date.now().toString(), name, content);
    const saved = CardSetRepository.getSavedSets();
    const updated = [...saved, newSet];
    CardSetRepository.saveSets(updated);
    setAvailableCardSets([CardSetRepository.getDefaultSet(), ...updated]);
    if (user) syncCardSetsToCloud(updated);
    return newSet.id;
  };

  const updateCardSet = (id, content, name) => {
    if (id === 'default') return;
    const saved = CardSetRepository.getSavedSets();
    const index = saved.findIndex(s => s.id === id);
    if (index >= 0) {
      if (content) saved[index].content = content;
      if (name) saved[index].name = name;
      saved[index].updatedAt = Date.now();
      
      CardSetRepository.saveSets(saved);
      setAvailableCardSets([CardSetRepository.getDefaultSet(), ...saved]);
      if (user) syncCardSetsToCloud(saved);
      if (activeCardSet.id === id) {
        setActiveCardSet(CardSet.fromJSON(saved[index]));
      }
    }
  };

  const deleteCardSet = (id) => {
    if (id === 'default') return;
    CardSetRepository.deleteSet(id);
    const saved = CardSetRepository.getSavedSets();
    setAvailableCardSets([CardSetRepository.getDefaultSet(), ...saved]);
    if (user) syncCardSetsToCloud(saved);
    if (activeCardSet.id === id) {
      setActiveCardSet(CardSetRepository.getDefaultSet());
    }
  };

  const resetToDefault = () => {
    changeActiveCardSet('default');
  };

  const changeActiveBoardConfig = (id) => {
    const config = availableBoardConfigs.find(c => c.id === id);
    if (config) {
      setActiveBoardConfig(config);
      BoardConfigRepository.setActiveConfigId(id);
    }
  };

  const saveNewBoardConfig = (name, tiles, mechanics) => {
    const newConfig = new BoardConfig(Date.now().toString(), name, tiles, mechanics);
    const saved = BoardConfigRepository.getSavedConfigs();
    const updated = [...saved, newConfig];
    BoardConfigRepository.saveConfigs(updated);
    setSavedBoardConfigs(updated);
    if (user) syncBoardConfigsToCloud(updated);
    return newConfig.id;
  };

  const updateBoardConfig = (id, tiles, mechanics, name) => {
    if (id === 'default' || id === 'teste_dev') return;
    const saved = BoardConfigRepository.getSavedConfigs();
    const index = saved.findIndex(c => c.id === id);
    if (index >= 0) {
      if (tiles) saved[index].tiles = tiles;
      if (mechanics) saved[index].mechanics = mechanics;
      if (name) saved[index].name = name;
      saved[index].updatedAt = Date.now();
      
      BoardConfigRepository.saveConfigs(saved);
      setSavedBoardConfigs([...saved]);
      if (user) syncBoardConfigsToCloud(saved);
      if (activeBoardConfig.id === id) {
        setActiveBoardConfig(BoardConfig.fromJSON(saved[index]));
      }
    }
  };

  const deleteBoardConfig = (id) => {
    if (id === 'default' || id === 'teste_dev') return;
    BoardConfigRepository.deleteConfig(id);
    const saved = BoardConfigRepository.getSavedConfigs();
    setSavedBoardConfigs(saved);
    if (user) syncBoardConfigsToCloud(saved);
    if (activeBoardConfig.id === id) {
      setActiveBoardConfig(BoardConfigRepository.getDefaultConfig());
    }
  };

  const importCardSet = (data) => {
    try {
      if (!data.name || !data.content) throw new Error("Estrutura JSON inválida para coleção de cartas.");
      const newName = `${data.name} (Importado)`;
      return saveNewCardSet(newName, data.content);
    } catch (e) {
      console.error("Erro ao importar cartas:", e);
      showSystemPopup({
        title: 'Erro na Importação',
        message: 'O arquivo JSON não parece ser uma coleção de cartas válida.',
        type: 'error'
      });
      return null;
    }
  };

  const importBoardConfig = (data) => {
    try {
      if (!data.name || !data.tiles || !data.mechanics) throw new Error("Estrutura JSON inválida para tabuleiro.");
      const newName = `${data.name} (Importado)`;
      return saveNewBoardConfig(newName, data.tiles, data.mechanics);
    } catch (e) {
      console.error("Erro ao importar tabuleiro:", e);
      showSystemPopup({
        title: 'Erro na Importação',
        message: 'O arquivo JSON não parece ser uma configuração de tabuleiro válida.',
        type: 'error'
      });
      return null;
    }
  };

  return {
    availableCardSets,
    activeCardSet,
    setActiveCardSet,
    availableBoardConfigs,

    activeBoardConfig,
    setActiveBoardConfig,
    changeActiveCardSet,
    saveNewCardSet,
    updateCardSet,
    deleteCardSet,
    resetToDefault,
    changeActiveBoardConfig,
    saveNewBoardConfig,
    updateBoardConfig,
    deleteBoardConfig,
    importCardSet,
    importBoardConfig
  };
};
