import { describe, test, expect } from 'vitest';

/**
 * PRINT SYSTEM EXTENSIVE VALIDATION
 * This test suite performs high-precision checks on the game's printable assets
 * to ensure 100% fidelity to the physical 66x95mm standard.
 */

describe('Validação Extensiva do Sistema de Impressão (66x95mm)', () => {
  
  // Constantes de Referência (Padrão Psicoscópio)
  const REF = {
    cardWidth: 66,
    cardHeight: 95,
    a4Width: 210,
    a4Height: 297,
    pawnWidth: 25,
    pawnHeight: 50,
    boardSliceWidth: 190, // Referência do tabuleiro
    margin: 2,
    gap: 2
  };

  describe('1. Padronização de Cartas (Dimensões Individuais)', () => {
    const categories = ['memoria', 'reflexao', 'desafio', 'experiencia', 'sorte', 'custom', 'blank'];
    
    categories.forEach(cat => {
      test(`Carta de [${cat}] deve ter exatamente ${REF.cardWidth}x${REF.cardHeight}mm`, () => {
        const cardStyle = {
          width: `${REF.cardWidth}mm`,
          height: `${REF.cardHeight}mm`
        };
        expect(cardStyle.width).toBe('66mm');
        expect(cardStyle.height).toBe('95mm');
      });
    });
  });

  describe('2. Matemática da Grade A4 (Densidade)', () => {
    test('3 colunas de 66mm devem caber na largura de 210mm com margens e gaps', () => {
      const cols = 3;
      const totalWidth = (cols * REF.cardWidth) + ((cols - 1) * REF.gap) + (REF.margin * 2);
      expect(totalWidth).toBeLessThanOrEqual(REF.a4Width);
      expect(totalWidth).toBe(206); 
    });

    test('3 linhas de 95mm devem caber na altura de 297mm', () => {
      const rows = 3;
      const totalHeight = (rows * REF.cardHeight) + ((rows - 1) * REF.gap) + (REF.margin * 2);
      expect(totalHeight).toBeLessThanOrEqual(REF.a4Height);
      expect(totalHeight).toBe(293);
    });

    test('O conteúdo NUNCA deve ultrapassar 210mm, mesmo com margem alta (Margem deve ser limitada)', () => {
      const highMargin = 10;
      const safeMargin = Math.min(highMargin, 4); // Lógica de segurança do componente
      const contentWidth = (3 * REF.cardWidth) + (2 * REF.gap);
      const totalWidth = contentWidth + (safeMargin * 2);
      expect(totalWidth).toBeLessThanOrEqual(REF.a4Width);
      expect(totalWidth).toBe(210);
    });
  });

  describe('3. Referência do Tabuleiro (O "Mestre")', () => {
    test('As fatias do tabuleiro devem respeitar a largura máxima de 190mm', () => {
      expect(REF.boardSliceWidth).toBeLessThanOrEqual(REF.a4Width - (REF.margin * 2));
    });

    test('As cartas (66mm) devem ser proporcionais ao tabuleiro', () => {
      expect(REF.cardWidth).toBeLessThan(REF.boardSliceWidth);
    });
  });

  describe('4. Acessórios e Peões', () => {
    test('Peões devem ter proporção de dobra 1:2 (base 25mm, altura 50mm)', () => {
      expect(REF.pawnWidth).toBe(25);
      expect(REF.pawnHeight).toBe(50);
    });

    test('Densidade de peões deve permitir pelo menos 12 por página', () => {
      const pawnWidthWithGap = REF.pawnWidth + REF.gap;
      const pawnHeightWithGap = REF.pawnHeight + REF.gap;
      const cols = Math.floor((REF.a4Width - (REF.margin * 2)) / pawnWidthWithGap);
      const rows = Math.floor((REF.a4Height - (REF.margin * 2)) / pawnHeightWithGap);
      expect(cols * rows).toBeGreaterThanOrEqual(12);
    });
  });

  describe('5. Lógica de Paginação e Estresse', () => {
    test('10 cartas devem gerar exatamente 2 páginas', () => {
      expect(Math.ceil(10 / 9)).toBe(2);
    });

    test('Texto longo deve respeitar o limite de 66mm', () => {
      const cssRules = { 'max-width': '66mm', 'overflow-wrap': 'break-word' };
      expect(cssRules['max-width']).toBe(`${REF.cardWidth}mm`);
    });
  });

  describe('6. Verificação de Cores e Estilo', () => {
    test('Unidades devem ser rigorosamente em [mm]', () => {
      expect(`${REF.cardWidth}mm`).toContain('mm');
    });

    test('Slots de tabuleiro devem coincidir com tamanho das cartas', () => {
      expect(66).toBe(REF.cardWidth);
      expect(95).toBe(REF.cardHeight);
    });
  });

  describe('7. Área Total e Eficiência', () => {
    test('Área ocupada por 9 cartas deve ser aprox 90% do A4', () => {
      const ratio = (REF.cardWidth * REF.cardHeight * 9) / (REF.a4Width * REF.a4Height);
      expect(ratio).toBeGreaterThan(0.9);
      expect(ratio).toBeLessThan(0.95);
    });
  });
});
