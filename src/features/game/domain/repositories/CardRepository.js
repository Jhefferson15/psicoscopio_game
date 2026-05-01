/**
 * @interface CardRepository
 */
export class CardRepository {
  async saveCard(card) {
    throw new Error('Method not implemented');
  }

  async getCards() {
    throw new Error('Method not implemented');
  }

  async deleteCard(id) {
    throw new Error('Method not implemented');
  }
}
