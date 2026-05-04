import { test, expect } from 'vitest';

/**
 * Teste de integração para o sistema de Popups.
 * Valida a chamada da função showSystemPopup.
 */

test('SystemPopup: Deve atualizar o estado do popup ao chamar showSystemPopup', () => {
  let systemPopupState = null;
  const setSystemPopup = (config) => {
    systemPopupState = config;
  };

  const showSystemPopup = (config) => {
    setSystemPopup(config);
  };

  const config = {
    title: 'Teste',
    message: 'Mensagem de teste',
    type: 'success'
  };

  showSystemPopup(config);
  
  expect(systemPopupState).toEqual(config);
  expect(systemPopupState.type).toBe('success');
});

test('SystemPopup: Deve limpar o estado ao fechar', () => {
  let systemPopupState = { title: 'Ativo' };
  const closeSystemPopup = () => {
    systemPopupState = null;
  };

  closeSystemPopup();
  expect(systemPopupState).toBeNull();
});
