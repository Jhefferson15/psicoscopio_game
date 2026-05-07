/**
 * Mirroring logic for 3x3 card grid
 * If front is [C1, C2, C3, C4, C5, C6, C7, C8, C9]
 * Back page must be [B3, B2, B1, B6, B5, B4, B9, B8, B7]
 */
export const getMirroredData = (frontData) => {
  if (!frontData || frontData.length === 0) return [];
  const mirrored = [];
  for (let row = 0; row < 3; row++) {
    const start = row * 3;
    // Swap column 0 and column 2 in each row
    const c0 = frontData[start];
    const c1 = frontData[start + 1];
    const c2 = frontData[start + 2];
    mirrored.push(c2 || null, c1 || null, c0 || null);
  }
  return mirrored;
};

export const getPrintPages = (printSettings, activeCardSet) => {
  const list = [];
  
  // 1. Cover
  list.push({ type: 'cover', id: 'cover' });

  // 2. Rules
  if (printSettings.includeRules) {
    list.push({ type: 'rules', id: 'rules' });
  }

  // 3. Board
  if (printSettings.includeBoard) {
    list.push({ type: 'board-left', id: 'board-l' });
    list.push({ type: 'board-right', id: 'board-r' });
  }

  // 3. Accessories
  if (printSettings.includeAccessories) {
    list.push({ type: 'accessories', id: 'acc' });
    list.push({ type: 'pawns', id: 'pawns' });
  }

  // 4. Standard Cards
  if (printSettings.includeStandardCards) {
    const cats = ['memoria', 'reflexao', 'desafio', 'experiencia', 'sorte'];
    let allCards = [];
    cats.forEach(cat => {
      const cards = (activeCardSet.content[cat] || []).map(text => ({ category: cat, text }));
      allCards = [...allCards, ...cards];
    });

    for (let i = 0; i < allCards.length; i += 9) {
      const frontData = allCards.slice(i, i + 9);
      list.push({ type: 'cards', id: `std-${i}`, data: frontData });
      
      if (printSettings.includeBacks) {
        list.push({ 
          type: 'cards-back', 
          id: `std-back-${i}`, 
          data: getMirroredData(frontData) 
        });
      }
    }
  }

  // 5. Custom Cards
  if (printSettings.includeCustomCards) {
    const customCards = (activeCardSet.content.custom || []).map(text => ({ category: 'custom', text }));
    for (let i = 0; i < customCards.length; i += 9) {
      const frontData = customCards.slice(i, i + 9);
      list.push({ type: 'cards', id: `cust-${i}`, data: frontData });
      
      if (printSettings.includeBacks) {
        list.push({ 
          type: 'cards-back', 
          id: `cust-back-${i}`, 
          data: getMirroredData(frontData) 
        });
      }
    }
  }

  // 6. Blank Templates
  if (printSettings.includeBlankCards) {
    ['memoria', 'reflexao', 'desafio', 'experiencia', 'sorte', 'custom'].forEach(cat => {
      list.push({ type: 'blank', id: `blank-${cat}`, data: { category: cat } });
      
      if (printSettings.includeBacks) {
        list.push({ type: 'blank-back', id: `blank-back-${cat}`, data: { category: cat } });
      }
    });
  }

  return list;
};
