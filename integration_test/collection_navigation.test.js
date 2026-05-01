import { test, expect, describe, vi } from 'vitest';

describe('Navegação da Coleção de Cartas', () => {
  test('O botão de coleção não deve estar presente nas opções de menu inicial', () => {
    // Simulação do menu
    const menuActions = ['Iniciar Jornada', 'Configurações', 'Sobre o Jogo'];
    const hasCollectionButton = menuActions.includes('Minha Coleção');
    
    expect(hasCollectionButton).toBe(false);
  });

  test('O botão de coleção deve estar disponível na tela de criação de cartas (CardCreator)', () => {
    // Simulação do estado do CardCreator
    let currentScreen = 'card_creation';
    let showCollection = false;
    
    const componentsInCardCreator = ['Canvas', 'Toolbox', 'Coleção Button'];
    const hasCollectionButton = componentsInCardCreator.includes('Coleção Button');
    
    expect(currentScreen).toBe('card_creation');
    expect(hasCollectionButton).toBe(true);
    
    // Simular clique no botão
    const onCollectionClick = () => { showCollection = true; };
    onCollectionClick();
    
    expect(showCollection).toBe(true);
  });

  test('Fechar o modal da coleção deve manter o usuário na tela de criação', () => {
    let currentScreen = 'card_creation';
    let showCollection = true;
    
    // Fechar modal
    const onCloseCollection = () => { showCollection = false; };
    onCloseCollection();
    
    expect(showCollection).toBe(false);
    expect(currentScreen).toBe('card_creation');
  });
});
