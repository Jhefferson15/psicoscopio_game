import { useState } from 'react';
import { GenerateRandomBoardConfig } from '../../domain/usecases/GenerateRandomBoardConfig';
import { BoardConfigRepository } from '../../data/repositories/BoardConfigRepository';

export const useBoardEditor = ({
  activeBoardConfig,
  availableBoardConfigs,
  changeActiveBoardConfig,
  saveNewBoardConfig,
  updateBoardConfig,
  deleteBoardConfig,
  importBoardConfig,
  showSystemPopup,
  TILE_TYPES,
  TILE_ACTIONS,
  COLORS
}) => {
  const [editingConfig, setEditingConfig] = useState(() => 
    activeBoardConfig ? JSON.parse(JSON.stringify(activeBoardConfig)) : null
  );
  const [configName, setConfigName] = useState(activeBoardConfig?.name || '');
  const [selectedTileIndex, setSelectedTileIndex] = useState(null);
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState(null); // Para definir posição inicial

  const handleSave = () => {
    const isNew = editingConfig.id === 'default' || editingConfig.id.startsWith('temp-');
    
    if (isNew) {
      const nameToSave = editingConfig.id === 'default' ? `${configName} (Cópia)` : configName;
      const newId = saveNewBoardConfig(nameToSave, editingConfig.tiles, editingConfig.mechanics);
      
      setEditingConfig(prev => ({ ...prev, id: newId, name: nameToSave }));
      setConfigName(nameToSave);
      changeActiveBoardConfig(newId);
    } else {
      updateBoardConfig(editingConfig.id, editingConfig.tiles, editingConfig.mechanics, configName);
      changeActiveBoardConfig(editingConfig.id);
    }

    showSystemPopup({
      title: 'Sucesso!',
      message: 'Configuração de tabuleiro salva com sucesso.',
      type: 'success'
    });
  };

  const handleTileChange = (index, field, value) => {
    setEditingConfig(prev => {
      const newTiles = [...prev.tiles];
      newTiles[index] = { ...newTiles[index], [field]: value };
      return { ...prev, tiles: newTiles };
    });
  };

  const handleMechanicChange = (field, value) => {
    setEditingConfig(prev => ({
      ...prev,
      mechanics: { 
        ...prev.mechanics, 
        [field]: (field === 'enableCardCreationStep' || field === 'showBoardLabels' || field === 'showCardLabels' || field === 'centerText' || field === 'initialPositions' || field === 'randomStart') 
          ? value 
          : (parseInt(value) || 0) 
      }
    }));
  };

  const handleCenterTextChange = (index, value) => {
    setEditingConfig(prev => {
      const newCenterText = [...(prev.mechanics.centerText || [])];
      newCenterText[index] = value;
      return {
        ...prev,
        mechanics: { ...prev.mechanics, centerText: newCenterText }
      };
    });
  };

  const handleInitialPositionChange = (playerIndex, tileIndex) => {
    setEditingConfig(prev => {
      const newPositions = [...(prev.mechanics.initialPositions || [0, 0, 0, 0])];
      newPositions[playerIndex] = tileIndex;
      return {
        ...prev,
        mechanics: { ...prev.mechanics, initialPositions: newPositions }
      };
    });
  };

  const handleRandomizeInitialPositions = () => {
    const outerTileIndices = editingConfig.tiles
      .map((tile, idx) => tile.ring === 'outer' ? idx : -1)
      .filter(idx => idx !== -1);
    
    if (outerTileIndices.length === 0) return;

    // Embaralha para garantir posições únicas se possível
    const shuffled = [...outerTileIndices].sort(() => Math.random() - 0.5);
    
    setEditingConfig(prev => {
      const newPositions = [0, 1, 2, 3].map((_, i) => shuffled[i % shuffled.length]);
      return {
        ...prev,
        mechanics: { ...prev.mechanics, initialPositions: newPositions }
      };
    });
    
    showSystemPopup({
      title: 'Posições Definidas',
      message: 'Jogadores posicionados aleatoriamente na borda.',
      type: 'success'
    });
  };


  const handleRandomize = () => {
    const randomBoard = GenerateRandomBoardConfig.execute(
      editingConfig.tiles, 
      TILE_TYPES, 
      TILE_ACTIONS, 
      COLORS
    );
    
    setEditingConfig({
      ...editingConfig,
      name: randomBoard.name,
      mechanics: randomBoard.mechanics,
      tiles: randomBoard.tiles
    });
    setConfigName(randomBoard.name);

    showSystemPopup({
      title: 'Aleatorizado!',
      message: 'Novo tabuleiro gerado com sucesso.',
      type: 'success'
    });
  };

  const startNewBoard = () => {
    const defaultConfig = availableBoardConfigs.find(c => c.id === 'default') || BoardConfigRepository.getDefaultConfig();
    const newConfig = JSON.parse(JSON.stringify(defaultConfig));
    newConfig.id = 'temp-' + Date.now();
    newConfig.name = 'Novo Tabuleiro';
    setEditingConfig(newConfig);
    setConfigName('Novo Tabuleiro');
    setSelectedTileIndex(null);

    showSystemPopup({
      title: 'Novo Tabuleiro',
      message: 'Um novo rascunho de tabuleiro foi criado. Ele aparecerá na lista como rascunho até que você o salve.',
      type: 'success'
    });
  };

  const handleExport = (config) => {
    const data = JSON.stringify(config, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.name.toLowerCase().replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const newId = importBoardConfig(json);
        if (newId) {
          showSystemPopup({
            title: 'Importado!',
            message: 'Configuração de tabuleiro importada com sucesso.',
            type: 'success'
          });
        }
      } catch {
        showSystemPopup({
          title: 'Erro',
          message: 'Falha ao ler o arquivo JSON.',
          type: 'error'
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const selectConfig = (config) => {
    setEditingConfig(JSON.parse(JSON.stringify(config)));
    setConfigName(config.name);
    setSelectedTileIndex(null);
    changeActiveBoardConfig(config.id);
  };

  const handleDelete = () => {
    if (editingConfig.id === 'default') return;

    showSystemPopup({
      title: 'Excluir Tabuleiro?',
      message: `Tem certeza que deseja excluir "${editingConfig.name}"? Esta ação não pode ser desfeita.`,
      type: 'confirm',
      onConfirm: () => {
        if (!editingConfig.id.startsWith('temp-')) {
          deleteBoardConfig(editingConfig.id);
        }
        
        // Volta para o default após excluir
        const defaultConfig = availableBoardConfigs.find(c => c.id === 'default') || BoardConfigRepository.getDefaultConfig();
        selectConfig(defaultConfig);
        
        showSystemPopup({
          title: 'Excluído',
          message: 'Tabuleiro removido com sucesso.',
          type: 'success'
        });
      }
    });
  };

  return {
    editingConfig,
    setEditingConfig,
    configName,
    setConfigName,
    selectedTileIndex,
    setSelectedTileIndex,
    selectedPlayerIdx,
    setSelectedPlayerIdx,
    handleSave,
    handleTileChange,
    handleMechanicChange,
    handleCenterTextChange,
    handleInitialPositionChange,
    handleRandomizeInitialPositions,
    handleRandomize,
    startNewBoard,
    handleExport,
    handleImport,
    selectConfig,
    handleDelete
  };
};
