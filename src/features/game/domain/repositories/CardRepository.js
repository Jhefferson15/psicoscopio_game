/**
 * @interface CardRepository
 */
export class CardRepository {
  async saveCard(_card) { // eslint-disable-line no-unused-vars
    throw new Error('Method not implemented');
  }

  async getCards() {
    throw new Error('Method not implemented');
  }

  async deleteCard(_id) { // eslint-disable-line no-unused-vars
    throw new Error('Method not implemented');
  }
}
