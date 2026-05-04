import { describe, it, expect } from 'vitest';

// Simulação da nova lógica de processamento de casas
async function simulateGameFlow(steps, initialPos, boardTiles, ringIndices) {
  let player = { position: initialPos };
  let relativePos = ringIndices.indexOf(player.position);
  
  // 1. Movimento do dado (não para mais em casas de transição)
  for (let i = 0; i < steps; i++) {
    relativePos = (relativePos + 1) % ringIndices.length;
    player.position = ringIndices[relativePos];
  }

  const finalSteps = [];
  
  // 2. Processamento de ações (recursivo)
  function handleAction(tile, depth = 0) {
    if (depth > 5) return;
    finalSteps.push(tile.id);
    
    let nextPos = -1;
    if (tile.action === 'MOVE_2') {
       const rel = ringIndices.indexOf(player.position);
       nextPos = ringIndices[(rel + 2) % ringIndices.length];
    } else if (tile.action === 'MOVE_INNER') {
       // Simplificado: move para a casa correspondente no próximo anel (mesmo index)
       nextPos = player.position + 10; 
    }
    
    if (nextPos !== -1) {
      player.position = nextPos;
      handleAction(boardTiles[player.position], depth + 1);
    }
  }

  handleAction(boardTiles[player.position]);
  return { finalPos: player.position, sequence: finalSteps };
}

describe('Lógica de Movimento e Ações Encadeadas', () => {
  const mockBoard = [];
  // Cria 20 casas (0-9 outer, 10-19 inner)
  for(let i=0; i<10; i++) mockBoard.push({ id: i.toString(), ring: 'outer', action: null });
  for(let i=10; i<20; i++) mockBoard.push({ id: i.toString(), ring: 'inner', action: null });
  
  const ringIndicesOuter = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  it('deve passar por casas de transição sem parar durante o movimento do dado', async () => {
    mockBoard[2].action = 'MOVE_INNER'; // Transição na casa 2
    
    // Começa na 0, dado 4. Deve terminar na 4, ignorando a ação da 2.
    const { finalPos, sequence } = await simulateGameFlow(4, 0, mockBoard, ringIndicesOuter);
    expect(finalPos).toBe(4);
    expect(sequence).toEqual(['4']); // Apenas a ação da casa final é processada
  });

  it('deve disparar a ação se cair exatamente na casa de transição', async () => {
    mockBoard[2].action = 'MOVE_INNER';
    
    // Começa na 0, dado 2. Deve cair na 2 e disparar MOVE_INNER para a 12.
    const { finalPos, sequence } = await simulateGameFlow(2, 0, mockBoard, ringIndicesOuter);
    expect(finalPos).toBe(12);
    expect(sequence).toEqual(['2', '12']);
  });

  it('deve encadear múltiplas ações (MOVE_2 -> MOVE_INNER)', async () => {
    mockBoard[2].action = 'MOVE_2';
    mockBoard[4].action = 'MOVE_INNER';
    
    // Começa na 0, dado 2. 
    // 1. Cai na 2.
    // 2. Ação MOVE_2 leva para a 4.
    // 3. Ação MOVE_INNER da 4 leva para a 14.
    const { finalPos, sequence } = await simulateGameFlow(2, 0, mockBoard, ringIndicesOuter);
    expect(finalPos).toBe(14);
    expect(sequence).toEqual(['2', '4', '14']);
  });
});
