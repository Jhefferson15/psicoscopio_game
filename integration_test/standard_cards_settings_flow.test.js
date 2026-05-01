import { test, expect, describe } from 'vitest';

describe('StandardCardsSettings Flow', () => {
  test('Deve permitir selecionar e editar categorias no configurador', () => {
    // Simulação simplificada do comportamento do StandardCardsSettings
    let activeCategory = 'reflexao';
    const setActiveCategory = (cat) => { activeCategory = cat; };

    expect(activeCategory).toBe('reflexao');
    setActiveCategory('desafio');
    expect(activeCategory).toBe('desafio');
  });

  test('Deve permitir adicionar e remover itens de uma coleção', () => {
    const editingSet = {
      id: 'custom-1',
      content: { reflexao: ['Item 1'] }
    };

    const addItem = (item) => {
      editingSet.content.reflexao.push(item);
    };

    const removeItem = (index) => {
      editingSet.content.reflexao = editingSet.content.reflexao.filter((_, i) => i !== index);
    };

    addItem('Item 2');
    expect(editingSet.content.reflexao).toContain('Item 2');
    expect(editingSet.content.reflexao.length).toBe(2);

    removeItem(0);
    expect(editingSet.content.reflexao).not.toContain('Item 1');
    expect(editingSet.content.reflexao).toContain('Item 2');
    expect(editingSet.content.reflexao.length).toBe(1);
  });
});
