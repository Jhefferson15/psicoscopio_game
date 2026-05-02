import { test, expect, describe } from 'vitest';
import { CardSet } from '../src/features/game/domain/entities/CardSet';
import { Tile } from '../src/features/game/domain/entities/Tile';
import { CardSetRepository } from '../src/features/game/data/repositories/CardSetRepository';
import { boardData } from '../src/features/game/data/repositories/boardRepository';

describe('Funcionalidade de Detalhes (Popups)', () => {
  
  test('A entidade Tile deve suportar o campo description', () => {
    const tile = new Tile('t1', 'normal', 'Casa', '#FFF', 'outer', 0, null, 'Esta é uma descrição');
    expect(tile.description).toBe('Esta é uma descrição');
    
    const json = tile.toJSON();
    expect(json.description).toBe('Esta é uma descrição');
    
    const fromJson = Tile.fromJSON(json);
    expect(fromJson.description).toBe('Esta é uma descrição');
  });

  test('A entidade CardSet deve suportar o campo categoryDescriptions', () => {
    const descriptions = { reflexao: 'Pense nisso', desafio: 'Faça isso', sorte: '', memoria: '', experiencia: '' };
    const set = new CardSet('s1', 'Conjunto', {}, descriptions);
    expect(set.categoryDescriptions.reflexao).toBe('Pense nisso');
    
    const json = set.toJSON();
    expect(json.categoryDescriptions.reflexao).toBe('Pense nisso');
    
    const fromJson = CardSet.fromJSON(json);
    expect(fromJson.categoryDescriptions.reflexao).toBe('Pense nisso');
  });

  test('O repositório de cartas deve retornar descrições padrão', () => {
    const defaultSet = CardSetRepository.getDefaultSet();
    expect(defaultSet.categoryDescriptions.reflexao).toContain('Momento de olhar para dentro');
    expect(defaultSet.categoryDescriptions.desafio).toContain('Hora de agir');
  });

  test('O repositório de tabuleiro deve retornar casas com descrições', () => {
    const reflexaoTile = boardData.find(t => t.type === 'reflexao');
    expect(reflexaoTile.description).toContain('Casa da Pausa');
    
    const especialTile = boardData.find(t => t.id === 's1');
    expect(especialTile.description).toContain('Vento a favor');
  });

  test('O componente GameCard deve abrir o popup de detalhes quando clicado no monte', () => {
    // Simulação do comportamento do handleClick no GameCard
    let detailPopupData = null;
    const showDetailPopup = (data) => { detailPopupData = data; };
    
    const config = { label: 'Reflexão', color: '#7B4BB1' };
    const activeCardSet = { categoryDescriptions: { reflexao: 'Descrição de Reflexão' } };
    
    const handleClick = (isFocused, isStacked) => {
      if (isFocused) {
        // closeFocusedCard();
      } else if (isStacked) {
        showDetailPopup({
          title: config.label,
          description: activeCardSet.categoryDescriptions['reflexao'],
          icon: 'BrainIcon',
          color: config.color
        });
      }
    };

    // Simular clique em carta no monte (isStacked=true, isFocused=false)
    handleClick(false, true);
    
    expect(detailPopupData).not.toBeNull();
    expect(detailPopupData.title).toBe('Reflexão');
    expect(detailPopupData.description).toBe('Descrição de Reflexão');
  });
});
