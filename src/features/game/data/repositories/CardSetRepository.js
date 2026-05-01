import { CardSet } from '../../domain/entities/CardSet';
import { cardContent as defaultContent } from './cardRepository';

const STORAGE_KEY = 'psicoscopio_card_sets';
const ACTIVE_SET_KEY = 'psicoscopio_active_card_set';

export class CardSetRepository {
  static getDefaultSet() {
    return new CardSet('default', 'Padrão Psicoscópio', { ...defaultContent });
  }

  static getSavedSets() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map(s => CardSet.fromJSON(s));
    } catch (e) {
      console.error("Erro ao carregar conjuntos de cartas:", e);
      return [];
    }
  }

  static saveSets(sets) {
    const toSave = sets
      .filter(s => s.id !== 'default')
      .map(s => {
        if (typeof s.toJSON === 'function') return s.toJSON();
        return s; // Se já for um objeto plano (JSON)
      });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }

  static getActiveSetId() {
    return localStorage.getItem(ACTIVE_SET_KEY) || 'default';
  }

  static setActiveSetId(id) {
    localStorage.setItem(ACTIVE_SET_KEY, id);
  }

  static saveSet(set) {
    const sets = this.getSavedSets();
    const index = sets.findIndex(s => s.id === set.id);
    if (index >= 0) {
      sets[index] = set;
    } else {
      sets.push(set);
    }
    this.saveSets(sets);
  }

  static deleteSet(id) {
    const sets = this.getSavedSets();
    const filtered = sets.filter(s => s.id !== id);
    this.saveSets(filtered);
    if (this.getActiveSetId() === id) {
      this.setActiveSetId('default');
    }
  }
}
