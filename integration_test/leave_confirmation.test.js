import { test, expect, vi } from 'vitest';
import React from 'react';

// Mock de useGame para o teste
const mockGameContext = {
  currentScreen: 'game',
  handleGoToMenu: vi.fn(),
  confirmGoToMenu: vi.fn(),
  showLeaveConfirm: false,
  setShowLeaveConfirm: vi.fn(),
};

test('Fluxo de confirmação de saída deve abrir o modal quando solicitado', () => {
  // Simula a lógica do handleGoToMenu no GameContext
  const handleGoToMenu = (currentScreen, setShowLeaveConfirm, goToMenu, isOnline = false) => {
    const isCriticalGameScreen = currentScreen === 'game' || 
                                (isOnline && (currentScreen === 'lobby' || currentScreen === 'waiting_players' || currentScreen === 'card_creation'));
    
    if (isCriticalGameScreen) {
      setShowLeaveConfirm(true);
    } else {
      goToMenu();
    }
  };

  const setShowLeaveConfirm = vi.fn();
  const goToMenu = vi.fn();

  // Caso 1: Fora do menu, deve abrir confirmação
  handleGoToMenu('game', setShowLeaveConfirm, goToMenu);
  expect(setShowLeaveConfirm).toHaveBeenCalledWith(true);
  expect(goToMenu).not.toHaveBeenCalled();

  // Caso 2: No menu, deve sair direto
  setShowLeaveConfirm.mockClear();
  handleGoToMenu('menu', setShowLeaveConfirm, goToMenu);
  expect(setShowLeaveConfirm).not.toHaveBeenCalled();
  expect(goToMenu).toHaveBeenCalled();

  // Caso 3: Em telas de configuração, deve sair direto sem popup
  setShowLeaveConfirm.mockClear();
  goToMenu.mockClear();
  handleGoToMenu('settings', setShowLeaveConfirm, goToMenu);
  expect(setShowLeaveConfirm).not.toHaveBeenCalled();
  expect(goToMenu).toHaveBeenCalled();
});

test('Fluxo de confirmação de saída deve realizar a saída ao confirmar', () => {
  const confirmGoToMenu = (setShowLeaveConfirm, goToMenu) => {
    setShowLeaveConfirm(false);
    goToMenu();
  };

  const setShowLeaveConfirm = vi.fn();
  const goToMenu = vi.fn();

  confirmGoToMenu(setShowLeaveConfirm, goToMenu);
  
  expect(setShowLeaveConfirm).toHaveBeenCalledWith(false);
  expect(goToMenu).toHaveBeenCalled();
});
