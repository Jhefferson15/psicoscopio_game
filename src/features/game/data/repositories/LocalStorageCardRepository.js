import { CardRepository } from '../../domain/repositories/CardRepository';
import { CustomCard } from '../../domain/entities/CustomCard';

export class LocalStorageCardRepository extends CardRepository {
  constructor() {
    super();
    this.STORAGE_KEY = 'psicoscopio_custom_cards';
  }

  async saveCard(card) {
    const cards = await this.getCards();
    cards.push(card);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cards));
    return card;
  }

  async getCards() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      return parsed.map(c => new CustomCard(c));
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
}

export const customCardRepository = new LocalStorageCardRepository();
