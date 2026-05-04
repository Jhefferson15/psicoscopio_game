import { describe, it, expect } from 'vitest';

describe('Sincronização de Cronômetro Serverless', () => {
  it('deve calcular o tempo restante corretamente com base no timestamp do servidor e offset', () => {
    const turnDuration = 120;
    const serverTimeOffset = -5000; // Servidor está 5s atrás do cliente
    const now = Date.now(); // Tempo local do cliente
    
    // Simula que o turno começou há 30 segundos no servidor
    const turnStartTimeServer = (now + serverTimeOffset) - 30000; 
    
    // Cálculo implementado no GameContext:
    const calculateRemaining = (localNow, offset, startTime, duration) => {
      const serverNow = localNow + offset;
      const elapsed = Math.floor((serverNow - startTime) / 1000);
      return Math.max(0, duration - elapsed);
    };

    const remaining = calculateRemaining(now, serverTimeOffset, turnStartTimeServer, turnDuration);
    
    // 120 - 30 = 90
    expect(remaining).toBe(90);
  });

  it('deve lidar com turnStartTime nulo usando o tempo atual (fallback)', () => {
    const turnDuration = 120;
    const serverTimeOffset = 0;
    const now = Date.now();
    
    const calculateRemaining = (localNow, offset, startTime, duration) => {
      const serverNow = localNow + offset;
      const effectiveStartTime = startTime || serverNow;
      const elapsed = Math.floor((serverNow - effectiveStartTime) / 1000);
      return Math.max(0, duration - elapsed);
    };

    const remaining = calculateRemaining(now, serverTimeOffset, null, turnDuration);
    
    expect(remaining).toBe(120);
  });
});
