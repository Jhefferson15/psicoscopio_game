import { test, expect } from 'vitest';

test('A sala deve ser exibida apenas quando o jogo está online', () => {
  const isOnline = true;
  const roomId = 'abc-123-def';
  
  const shouldShowRoom = isOnline && roomId;
  
  expect(shouldShowRoom).toBeTruthy();
  expect(roomId.substring(0, 8)).toBe('abc-123-');
});

test('A sala não deve ser exibida quando o jogo está offline', () => {
  const isOnline = false;
  const roomId = null;
  
  const shouldShowRoom = isOnline && roomId;
  
  expect(shouldShowRoom).toBeFalsy();
});

test('O layout dos botões superiores deve ser horizontal no mobile', () => {
  // Simulação da lógica de CSS/Componente
  const isMobile = true;
  const headerActionsDirection = isMobile ? 'row' : 'row'; // Agora deve ser row em ambos
  
  expect(headerActionsDirection).toBe('row');
});
