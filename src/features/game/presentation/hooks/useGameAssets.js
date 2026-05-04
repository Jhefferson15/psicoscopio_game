import { useState, useEffect } from 'react';
import { CardSet } from '../../domain/entities/CardSet';
import { BoardConfig } from '../../domain/entities/BoardConfig';
import { CardSetRepository } from '../../data/repositories/CardSetRepository';
import { BoardConfigRepository } from '../../data/repositories/BoardConfigRepository';

export const useGameAssets = ({ user, cloudCardSets, syncCardSetsToCloud, cloudBoardConfigs, syncBoardConfigsToCloud, showSystemPopup }) => {
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
  const [availableBoardConfigs, setAvailableBoardConfigs] = useState(() => {
    const saved = BoardConfigRepository.getSavedConfigs();
    return [BoardConfigRepository.getDefaultConfig(), ...saved];
  });

  const [activeBoardConfig, setActiveBoardConfig] = useState(() => {
    const saved = BoardConfigRepository.getSavedConfigs();
    const activeId = BoardConfigRepository.getActiveConfigId();
    const defaultConfig = BoardConfigRepository.getDefaultConfig();
    const allConfigs = [defaultConfig, ...saved];
    return allConfigs.find(c => c.id === activeId) || defaultConfig;
  });

  // Sincroniza cartas locais com as da nuvem ao logar
  useEffect(() => {
    if (user && cloudCardSets && cloudCardSets.length > 0) {
      const localSets = CardSetRepository.getSavedSets();
      const mergedMap = new Map();
      localSets.forEach(s => mergedMap.set(s.id, s));
      cloudCardSets.forEach(s => mergedMap.set(s.id, s));
      const mergedSets = Array.from(mergedMap.values());
      
      CardSetRepository.saveSets(mergedSets);
      queueMicrotask(() => {
        setAvailableCardSets([CardSetRepository.getDefaultSet(), ...mergedSets]);
      });
    }
  }, [user, cloudCardSets]);

  // Sincroniza tabuleiros locais com os da nuvem ao logar
  useEffect(() => {
    if (user && cloudBoardConfigs && cloudBoardConfigs.length > 0) {
      const localConfigs = BoardConfigRepository.getSavedConfigs();
      const mergedMap = new Map();
      localConfigs.forEach(c => mergedMap.set(c.id, c));
      cloudBoardConfigs.forEach(c => mergedMap.set(c.id, c));
      const mergedConfigs = Array.from(mergedMap.values());
      
      BoardConfigRepository.saveConfigs(mergedConfigs);
      queueMicrotask(() => {
        setAvailableBoardConfigs([BoardConfigRepository.getDefaultConfig(), ...mergedConfigs]);
      });
    }
  }, [user, cloudBoardConfigs]);

  const changeActiveCardSet = (id) => {
    const set = availableCardSets.find(s => s.id === id);
    if (set) {
      setActiveCardSet(set);
      CardSetRepository.setActiveSetId(id);
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
    setAvailableBoardConfigs([BoardConfigRepository.getDefaultConfig(), ...updated]);
    if (user) syncBoardConfigsToCloud(updated);
    return newConfig.id;
  };

  const updateBoardConfig = (id, tiles, mechanics, name) => {
    if (id === 'default') return;
    const saved = BoardConfigRepository.getSavedConfigs();
    const index = saved.findIndex(c => c.id === id);
    if (index >= 0) {
      if (tiles) saved[index].tiles = tiles;
      if (mechanics) saved[index].mechanics = mechanics;
      if (name) saved[index].name = name;
      saved[index].updatedAt = Date.now();
      
      BoardConfigRepository.saveConfigs(saved);
      setAvailableBoardConfigs([BoardConfigRepository.getDefaultConfig(), ...saved]);
      if (user) syncBoardConfigsToCloud(saved);
      if (activeBoardConfig.id === id) {
        setActiveBoardConfig(BoardConfig.fromJSON(saved[index]));
      }
    }
  };

  const deleteBoardConfig = (id) => {
    if (id === 'default') return;
    BoardConfigRepository.deleteConfig(id);
    const saved = BoardConfigRepository.getSavedConfigs();
    setAvailableBoardConfigs([BoardConfigRepository.getDefaultConfig(), ...saved]);
    if (user) syncBoardConfigsToCloud(saved);
    if (activeBoardConfig.id === id) {
      setActiveBoardConfig(BoardConfig.getDefaultConfig());
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
