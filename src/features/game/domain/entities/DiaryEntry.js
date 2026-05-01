export class DiaryEntry {
  constructor(id, text, type = 'reflexao', timestamp = new Date().toISOString(), mood = 'neutral') {
    this.id = id;
    this.text = text;
    this.type = type;
    this.timestamp = timestamp;
    this.mood = mood;
  }

  static fromJSON(json) {
    return new DiaryEntry(
      json.id,
      json.text,
      json.type,
      json.timestamp,
      json.mood
    );
  }

  toJSON() {
    return {
      id: this.id,
      text: this.text,
      type: this.type,
      timestamp: this.timestamp,
      mood: this.mood
    };
  }
}
