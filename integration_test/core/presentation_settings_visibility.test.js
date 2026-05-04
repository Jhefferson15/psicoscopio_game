import { describe, it, expect } from 'vitest';
import { BoardConfig } from '../../src/features/game/domain/entities/BoardConfig';
import { getDefaultBoardConfig } from '../../src/features/game/data/repositories/boardRepository';

describe('Integração de Configurações de Visibilidade', () => {
  it('deve incluir showBoardLabels e showCardLabels nas mecânicas padrão', () => {
    const defaultConfig = getDefaultBoardConfig();
    expect(defaultConfig.mechanics).toHaveProperty('showBoardLabels');
    expect(defaultConfig.mechanics).toHaveProperty('showCardLabels');
    expect(defaultConfig.mechanics.showBoardLabels).toBe(true);
    expect(defaultConfig.mechanics.showCardLabels).toBe(true);
  });

  it('deve persistir e recuperar as novas mecânicas de visibilidade', () => {
    const customMechanics = {
      turnTime: 60,
      diceMin: 2,
      diceMax: 8,
      enableCardCreationStep: true,
      showBoardLabels: false,
      showCardLabels: false
    };
    
    const config = new BoardConfig('test-id', 'Test Board', [], customMechanics);
    
    // Simula salvamento
    const json = config.toJSON();
    const recovered = BoardConfig.fromJSON(json);
    
    expect(recovered.mechanics.showBoardLabels).toBe(false);
    expect(recovered.mechanics.showCardLabels).toBe(false);
    expect(recovered.mechanics.diceMin).toBe(2);
    expect(recovered.mechanics.diceMax).toBe(8);
  });

  it('deve garantir que os campos de dado aceitem valores numéricos maiores que zero', () => {
    const config = getDefaultBoardConfig();
    config.mechanics.diceMin = 5;
    config.mechanics.diceMax = 10;
    
    expect(config.mechanics.diceMin).toBe(5);
    expect(config.mechanics.diceMax).toBe(10);
    expect(config.mechanics.diceMax).toBeGreaterThan(config.mechanics.diceMin);
  });
});
