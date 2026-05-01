import { test, expect, vi } from 'vitest';

test('Deve seguir o fluxo: Rolar -> Delay -> Resultado Aparece -> Delay -> Movimento Começa', async () => {
  let isMoving = false;
  let isRolling = false;
  let lastDiceRoll = 0;
  let players = [{ id: 1, position: 0 }];

  const rollDice = async () => {
    isRolling = true;
    isMoving = true;
    lastDiceRoll = 0;
    
    await new Promise(r => setTimeout(r, 100)); // Simula rolagem
    
    lastDiceRoll = 4;
    isRolling = false; // O resultado deve aparecer agora
    
    // Verificamos o estado no meio do caminho
    expect(isRolling).toBe(false);
    expect(lastDiceRoll).toBe(4);
    expect(isMoving).toBe(true); // Ainda bloqueado para o movimento
    
    await new Promise(r => setTimeout(r, 100)); // Simula visualização
    
    await movePlayer(4);
  };

  const movePlayer = async (steps) => {
    for (let i = 0; i < steps; i++) {
      players[0].position += 1;
      await new Promise(r => setTimeout(r, 20));
    }
    isMoving = false;
  };

  const rollPromise = rollDice();
  expect(isRolling).toBe(true);
  
  await rollPromise;
  
  expect(players[0].position).toBe(4);
  expect(isMoving).toBe(false);
  expect(isRolling).toBe(false);
});
