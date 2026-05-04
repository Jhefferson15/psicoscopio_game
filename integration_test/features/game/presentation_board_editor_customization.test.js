import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBoardEditor } from '../../../src/features/game/presentation/hooks/useBoardEditor';

describe('useBoardEditor Customization', () => {
  const mockActiveBoardConfig = {
    id: 'default',
    name: 'Tabuleiro Original',
    tiles: [{ id: 'o1', type: 'brain', ring: 'outer', angle: 0, label: '', color: '#D84B42' }],
    mechanics: {
      turnTime: 120,
      diceMin: 1,
      diceMax: 6,
      maxTurns: 0,
      centerText: ["A", "B", "C", "D"],
      initialPositions: [0, 0, 0, 0]
    }
  };

  const mockProps = {
    activeBoardConfig: mockActiveBoardConfig,
    availableBoardConfigs: [mockActiveBoardConfig],
    changeActiveBoardConfig: vi.fn(),
    saveNewBoardConfig: vi.fn(),
    updateBoardConfig: vi.fn(),
    importBoardConfig: vi.fn(),
    showSystemPopup: vi.fn(),
    TILE_TYPES: [],
    TILE_ACTIONS: [],
    COLORS: []
  };

  it('should update maxTurns mechanic', () => {
    const { result } = renderHook(() => useBoardEditor(mockProps));
    
    act(() => {
      result.current.handleMechanicChange('maxTurns', '10');
    });

    expect(result.current.editingConfig.mechanics.maxTurns).toBe(10);
  });

  it('should update centerText lines', () => {
    const { result } = renderHook(() => useBoardEditor(mockProps));
    
    act(() => {
      result.current.handleCenterTextChange(0, 'Novo Texto');
    });

    expect(result.current.editingConfig.mechanics.centerText[0]).toBe('Novo Texto');
    expect(result.current.editingConfig.mechanics.centerText[1]).toBe('B');
  });

  it('should update initialPositions', () => {
    const { result } = renderHook(() => useBoardEditor(mockProps));
    
    act(() => {
      result.current.handleInitialPositionChange(0, 5);
    });

    expect(result.current.editingConfig.mechanics.initialPositions[0]).toBe(5);
  });

  it('should allow multi-line labels for tiles', () => {
    const { result } = renderHook(() => useBoardEditor(mockProps));
    
    act(() => {
      result.current.handleTileChange(0, 'label', 'Linha 1\nLinha 2');
    });

    expect(result.current.editingConfig.tiles[0].label).toBe('Linha 1\nLinha 2');
  });
});
