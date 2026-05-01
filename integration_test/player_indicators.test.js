import { test, expect } from 'vitest';

// Simulação da lógica implementada no BoardView.jsx
const getRadius = (ring) => {
  switch (ring) {
    case 'inner': return 180;
    case 'middle': return 255;
    case 'outer': return 330;
    case 'special': return 370;
    case 'center': return 0;
    default: return 0;
  }
};

test('Deve retornar o raio correto para cada tipo de anel', () => {
  expect(getRadius('inner')).toBe(180);
  expect(getRadius('middle')).toBe(255);
  expect(getRadius('outer')).toBe(330);
  expect(getRadius('special')).toBe(370);
  expect(getRadius('center')).toBe(0);
});

test('Deve gerenciar corretamente o estado de exibição do nome do jogador', () => {
  let showNameId = null;
  const toggleName = (id) => {
    showNameId = (showNameId === id) ? null : id;
  };

  // Clica no jogador 1
  toggleName(1);
  expect(showNameId).toBe(1);

  // Clica no jogador 1 novamente (esconde)
  toggleName(1);
  expect(showNameId).toBe(null);

  // Clica no jogador 2
  toggleName(2);
  expect(showNameId).toBe(2);
  
  // Clica no jogador 3 (troca foco)
  toggleName(3);
  expect(showNameId).toBe(3);
});

test('Deve calcular o offset de ângulo quando múltiplos jogadores estão na mesma casa', () => {
  const players = [
    { id: 1, position: 5 },
    { id: 2, position: 5 },
    { id: 3, position: 5 }
  ];

  const getAngleOffset = (playerIdx, position, allPlayers) => {
    const samePosPlayers = allPlayers.filter(p => p.position === position);
    const samePosCount = samePosPlayers.length;
    const samePosIdx = samePosPlayers.findIndex(p => p.id === allPlayers[playerIdx].id);
    const markerSize = 25; // Base size
    
    return samePosCount > 1 ? (samePosIdx - (samePosCount - 1) / 2) * (markerSize * 0.25) : 0;
  };

  // Jogador 1 (primeiro de 3): (0 - 1) * 6.25 = -6.25
  expect(getAngleOffset(0, 5, players)).toBe(-6.25);
  // Jogador 2 (segundo de 3): (1 - 1) * 6.25 = 0
  expect(getAngleOffset(1, 5, players)).toBe(0);
  // Jogador 3 (terceiro de 3): (2 - 1) * 6.25 = 6.25
  expect(getAngleOffset(2, 5, players)).toBe(6.25);
});
