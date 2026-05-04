import { describe, it, expect } from 'vitest';

describe('Prevencao de double-passTurn (race condition)', () => {
  it('deve ignorar chamadas duplicadas ao passTurn no mesmo turno', () => {
    const isTurnBeingPassedRef = { current: false };
    let turnsPassed = 0;

    const passTurn = () => {
      if (isTurnBeingPassedRef.current) {
        console.warn('passTurn ignorado: turno ja esta sendo passado.');
        return;
      }
      isTurnBeingPassedRef.current = true;
      turnsPassed++;
      // Simula reset offline apos um tick
      setTimeout(() => { isTurnBeingPassedRef.current = false; }, 50);
    };

    // Simula timer e movePlayer chamando passTurn ao mesmo tempo
    passTurn();
    passTurn(); // deve ser ignorado
    passTurn(); // deve ser ignorado

    expect(turnsPassed).toBe(1);
    expect(isTurnBeingPassedRef.current).toBe(true);
  });

  it('deve permitir nova chamada apos o flag ser resetado', async () => {
    const isTurnBeingPassedRef = { current: false };
    let turnsPassed = 0;

    const passTurn = () => {
      if (isTurnBeingPassedRef.current) return;
      isTurnBeingPassedRef.current = true;
      turnsPassed++;
      setTimeout(() => { isTurnBeingPassedRef.current = false; }, 10);
    };

    passTurn(); // turno 1
    expect(turnsPassed).toBe(1);

    // Aguarda o reset do flag
    await new Promise(r => setTimeout(r, 50));

    passTurn(); // turno 2 - deve ser permitido
    expect(turnsPassed).toBe(2);
  });
});
