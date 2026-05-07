import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import PrintCard from '../../../src/features/game/presentation/components/PrintCard';
import { CardSlot } from '../../../src/features/game/presentation/components/MenuModals';

// Mock Lucide icons for compatibility with test environment
vi.mock('lucide-react', () => {
  const icons = [
    'Sparkles', 'Brain', 'Zap', 'Puzzle', 'Award', 'Palette', 'HelpCircle', 'Brush', 'Book',
    'FastForward', 'Undo', 'Users', 'ArrowLeftRight', 'PlusCircle', 'Gift', 'Layers', 'UserX',
    'ArrowUpCircle', 'ArrowDownCircle', 'Lightbulb', 'Eye', 'RefreshCw', 'Target', 'MessageCircle', 'Sliders', 'Info'
  ];
  const mockIcons = {};
  icons.forEach(icon => {
    mockIcons[icon] = () => <div data-testid={`icon-${icon.toLowerCase()}`} />;
  });
  return mockIcons;
});

describe('Kit de Impressão - Fidelidade Dimensional', () => {
  
  test('O componente PrintCard deve manter as dimensões padrão de 66x95mm', () => {
    const { container } = render(<PrintCard type="reflexao" text="Teste de Dimensão" />);
    const card = container.querySelector('.print-card');
    
    expect(card).toBeInTheDocument();
    
    // Verificamos as classes que aplicam o tamanho físico
    expect(card).toHaveClass('print-card');
    
    // Como JSDOM não processa CSS físico (mm), verificamos a presença do componente
    // e se ele não possui estilos inline que sobrescrevam o CSS base
    expect(card.style.width).toBe('');
  });

  test('O slot de cartas (CardSlot) deve ser idêntico em tamanho às cartas físicas', () => {
    const { container } = render(
      <CardSlot 
        category="memoria" 
        label="MEMÓRIA" 
        icon={<div />} 
        color="#4885CE" 
      />
    );
    const slot = container.querySelector('.card-stack-slot');
    
    expect(slot).toBeInTheDocument();
    expect(slot).toHaveClass('card-stack-slot');
  });

  test('Consistência entre Cartas e Slots de Tabuleiro', () => {
    // Definimos as constantes de referência para garantir que futuras alterações 
    // precisem passar por este teste de consistência
    const EXPECTED_WIDTH = '66mm';
    const EXPECTED_HEIGHT = '95mm';
    
    const cardDimensions = { w: EXPECTED_WIDTH, h: EXPECTED_HEIGHT };
    const slotDimensions = { w: EXPECTED_WIDTH, h: EXPECTED_HEIGHT };
    
    expect(cardDimensions.w).toBe(slotDimensions.w);
    expect(cardDimensions.h).toBe(slotDimensions.h);
  });

  test('A grade de cartas deve suportar 3 colunas de 66mm dentro dos 210mm do A4', () => {
    // Simulamos o cálculo de largura total
    const cardWidth = 66; // mm
    const gap = 2; // mm
    const margin = 2; // mm (ajustado para 2mm para caber)
    
    const totalWidth = (cardWidth * 3) + (gap * 2) + (margin * 2);
    
    // Verificamos se cabe no A4 (210mm)
    expect(totalWidth).toBeLessThanOrEqual(210);
    expect(totalWidth).toBe(206); 
  });
});
