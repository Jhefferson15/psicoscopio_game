import { test, expect, describe } from 'vitest';
import { ProcessTileActionUseCase } from '../../../src/features/game/domain/usecases/ProcessTileActionUseCase';

describe('Fallback de Cartas Customizadas', () => {
  test('Deve disparar PROCESS_CUSTOM_CARD quando cair em uma casa customizada', () => {
    const tile = { type: 'custom_card', id: 'c1' };
    const player = { position: 0 };
    const allPlayers = [player];
    const activeBoardConfig = { tiles: [tile] };
    const getRingIndices = () => [0];
    const movePlayerUseCase = { execute: () => 0 };

    const result = ProcessTileActionUseCase.execute(
      tile,
      player,
      allPlayers,
      activeBoardConfig,
      getRingIndices,
      movePlayerUseCase,
      0
    );

    const hasAction = result.uiActions.some(a => a.type === 'PROCESS_CUSTOM_CARD');
    expect(hasAction).toBe(true);
    expect(result.modalOpened).toBe(true);
  });
});
