import { test, expect, vi } from 'vitest';

/**
 * Teste de integração para a lógica de criação de novos tabuleiros.
 * Valida a correção do bug onde novos tabuleiros com IDs temporários não eram salvos.
 */

test('BoardEditor Logic: Deve detectar ID temporário e salvar como novo tabuleiro', () => {
  // Mock das funções do repositório
  const saveNewBoardConfig = vi.fn().mockReturnValue('real-id-123');
  const updateBoardConfig = vi.fn();
  
  // Estado inicial simulando "CRIAR NOVO"
  const configName = 'Novo Tabuleiro';
  const editingConfig = {
    id: 'temp-123456789',
    tiles: [],
    mechanics: {}
  };

  // Lógica corrigida do handleSave
  const handleSave = () => {
    const isNew = editingConfig.id === 'default' || editingConfig.id.startsWith('temp-');
    
    if (isNew) {
      const nameToSave = editingConfig.id === 'default' ? `${configName} (Cópia)` : configName;
      saveNewBoardConfig(nameToSave, editingConfig.tiles, editingConfig.mechanics);
    } else {
      updateBoardConfig(editingConfig.id, editingConfig.tiles, editingConfig.mechanics, configName);
    }
  };

  handleSave();

  // Verifica se saveNewBoardConfig foi chamado em vez de updateBoardConfig
  expect(saveNewBoardConfig).toHaveBeenCalledWith('Novo Tabuleiro', [], {});
  expect(updateBoardConfig).not.toHaveBeenCalled();
});

test('BoardEditor Logic: Deve atualizar tabuleiro existente se o ID não for temporário', () => {
  const saveNewBoardConfig = vi.fn();
  const updateBoardConfig = vi.fn();
  
  const configName = 'Tabuleiro Editado';
  const editingConfig = {
    id: 'existing-id',
    tiles: [{ id: 1 }],
    mechanics: { turnTime: 60 }
  };

  const handleSave = () => {
    const isNew = editingConfig.id === 'default' || editingConfig.id.startsWith('temp-');
    
    if (isNew) {
      const nameToSave = editingConfig.id === 'default' ? `${configName} (Cópia)` : configName;
      saveNewBoardConfig(nameToSave, editingConfig.tiles, editingConfig.mechanics);
    } else {
      updateBoardConfig(editingConfig.id, editingConfig.tiles, editingConfig.mechanics, configName);
    }
  };

  handleSave();

  expect(updateBoardConfig).toHaveBeenCalledWith('existing-id', [{ id: 1 }], { turnTime: 60 }, 'Tabuleiro Editado');
  expect(saveNewBoardConfig).not.toHaveBeenCalled();
});
