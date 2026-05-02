export class CardSet {
  constructor(id, name, content, categoryDescriptions = null) {
    this.id = id;
    this.name = name;
    this.content = content || {
      reflexao: [],
      desafio: [],
      sorte: [],
      memoria: [],
      experiencia: []
    };
    this.categoryDescriptions = categoryDescriptions || {
      reflexao: '',
      desafio: '',
      sorte: '',
      memoria: '',
      experiencia: ''
    };
    this.updatedAt = Date.now();
  }

  static fromJSON(json) {
    const set = new CardSet(json.id, json.name, json.content, json.categoryDescriptions);
    if (json.updatedAt) set.updatedAt = json.updatedAt;
    return set;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      content: this.content,
      categoryDescriptions: this.categoryDescriptions,
      updatedAt: this.updatedAt
    };
  }
}
