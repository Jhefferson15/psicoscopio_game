import { CardRepository } from '../../domain/repositories/CardRepository';
import { CustomCard } from '../../domain/entities/CustomCard';

export class LocalStorageCardRepository extends CardRepository {
  constructor() {
    super();
    this.STORAGE_KEY = 'psicoscopio_custom_cards';
  }

  async saveCard(card) {
    if (!card.isValid()) {
      console.warn('Attempted to save an invalid card', card);
      return null;
    }
    const cards = await this.getCards();
    const index = cards.findIndex(c => c.id === card.id);
    
    if (index >= 0) {
      cards[index] = card;
    } else {
      cards.push(card);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cards));
    return card;
  }

  async saveAllCards(cards) {
    const validCards = cards
      .map(c => c instanceof CustomCard ? c : new CustomCard(c))
      .filter(c => c.isValid());
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validCards));
  }

  async getCards() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      // Filter out invalid cards (legacy cleanup)
      return parsed
        .map(c => new CustomCard(c))
        .filter(card => card.isValid());
    } catch (e) {
      console.error('Error parsing custom cards', e);
      return [];
    }
  }

  async deleteCard(id) {
    let cards = await this.getCards();
    cards = cards.filter(c => c.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cards));
  }

  async reportCard(id, reason) {
    const cards = await this.getCards();
    const index = cards.findIndex(c => c.id === id);
    if (index >= 0) {
      cards[index].isReported = true;
      cards[index].reportReason = reason;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cards));
      return cards[index];
    }
    return null;
  }
}

export const customCardRepository = new LocalStorageCardRepository();
