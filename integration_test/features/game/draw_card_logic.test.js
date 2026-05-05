import { test, expect, describe } from 'vitest';

// Simulação simplificada da lógica de drawCard para teste unitário
function createDrawCard(activeCardSet, drawnCards, setDrawnCards) {
  return (type) => {
    const cardList = activeCardSet?.content?.[type] || [];
    if (cardList.length === 0) return { content: "Nenhuma carta disponível.", index: 0 };

    const usedIndices = drawnCards[type] || [];
    const availableIndices = cardList
      .map((_, i) => i)
      .filter(i => !usedIndices.includes(i));

    let selectedIndex;
    let newUsedIndices = [...usedIndices];

    if (availableIndices.length === 0) {
      selectedIndex = Math.floor(Math.random() * cardList.length);
      newUsedIndices = [selectedIndex];
    } else {
      selectedIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      newUsedIndices.push(selectedIndex);
    }

    setDrawnCards(type, newUsedIndices);
    return { content: cardList[selectedIndex], index: selectedIndex };
  };
}

describe('Lógica de Sorteio de Cartas', () => {
  test('Deve sortear todas as cartas sem repetir antes de reiniciar', () => {
    const activeCardSet = {
      content: {
        reflexao: ['Carta 1', 'Carta 2', 'Carta 3']
      }
    };
    let drawnCards = { reflexao: [] };
    const setDrawnCards = (type, indices) => { drawnCards[type] = indices; };

    const drawCard = createDrawCard(activeCardSet, drawnCards, setDrawnCards);

    const first = drawCard('reflexao');
    const second = drawCard('reflexao');
    const third = drawCard('reflexao');

    const results = [first.index, second.index, third.index];
    expect(new Set(results).size).toBe(3); // Todos únicos
    expect(drawnCards.reflexao.length).toBe(3);

    // Quarta carta deve reiniciar
    drawCard('reflexao');
    expect(drawnCards.reflexao.length).toBe(1);
  });
});
