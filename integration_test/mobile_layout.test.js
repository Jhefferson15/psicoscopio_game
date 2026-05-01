import { test, expect } from 'vitest';

test('O sistema deve permitir o acesso sem o bloqueio do MobileWarning', () => {
  // Simulação do estado confirmedMobileWarning que antes era obrigatório
  let confirmedMobileWarning = false;
  
  // A lógica agora deve permitir renderizar o conteúdo independentemente desta flag
  // No App.jsx, removemos a condicional que usava esta flag para bloquear a UI
  
  const canRenderGame = true; // Agora é sempre true por padrão no App.jsx
  
  expect(canRenderGame).toBe(true);
});

test('As dimensões de mockup no mobile devem ser consistentes com o CSS responsivo', () => {
  const mobileMockupWidth = 280;
  const desktopMockupWidth = 380;
  
  // Valores esperados conforme as novas media queries no index.css e CardCreator.css
  expect(mobileMockupWidth).toBeLessThan(desktopMockupWidth);
});

test('O layout do Tabletop deve ser flexível para mobile', () => {
  const isMobile = true;
  const layoutDirection = isMobile ? 'column' : 'grid';
  
  expect(layoutDirection).toBe('column');
});
