export class CustomCard {
  constructor({ id, type, content, contentType, color, createdAt }) {
    this.id = id || Date.now().toString();
    this.type = type; // e.g., 'Reflexão', 'Desafio'
    this.content = content; // Canvas dataURL, text string, or image dataURL
    this.contentType = contentType; // 'drawing', 'text', 'image'
    this.color = color;
    this.createdAt = createdAt || new Date().toISOString();
  }

  isValid() {
    if (!this.content) return false;
    if (this.contentType === 'text' && this.content.trim().length === 0) return false;
    return true;
  }
}
