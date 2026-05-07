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

  // 4. Accessories
  if (printSettings.includeAccessories) {
    list.push({ type: 'accessories', id: 'acc' });
    list.push({ type: 'pawns', id: 'pawns' });
  }

  // 5. Collect ALL printable items
  let allPrintableItems = [];
  const categories = ['memoria', 'reflexao', 'desafio', 'experiencia', 'sorte', 'custom'];

  categories.forEach(cat => {
    // Add Real Cards for this category
    if (cat === 'custom' && printSettings.includeCustomCards) {
      const cards = (activeCardSet.content.custom || []).map(text => ({ 
        category: 'custom', text, isBlank: false 
      }));
      allPrintableItems = [...allPrintableItems, ...cards];
    } else if (cat !== 'custom' && printSettings.includeStandardCards) {
      const cards = (activeCardSet.content[cat] || []).map(text => ({ 
        category: cat, text, isBlank: false 
      }));
      allPrintableItems = [...allPrintableItems, ...cards];
    }

    // Add Blank Templates for this category
    if (printSettings.includeBlankCards) {
      for (let i = 0; i < 12; i++) {
        allPrintableItems.push({ category: cat, isBlank: true });
      }
    }
  });

  // 6. Alignment Padding
  // If we have backs, we must ensure the "Cards" section starts on an ODD page index (1-based).
  // Current page count is list.length.
  if (printSettings.includeBacks && list.length % 2 !== 0) {
    list.push({ type: 'padding', id: 'padding-alignment' });
  }

  // 7. Chunk and add cards
  for (let i = 0; i < allPrintableItems.length; i += 9) {
    const frontData = allPrintableItems.slice(i, i + 9);
    // Fill remaining slots with null to maintain 3x3 grid integrity
    while (frontData.length < 9) frontData.push(null);

    list.push({ type: 'cards', id: `cards-${i}`, data: frontData });
    
    if (printSettings.includeBacks) {
      list.push({ 
        type: 'cards-back', 
        id: `cards-back-${i}`, 
        data: getMirroredData(frontData) 
      });
    }
  }

  return list;
};
