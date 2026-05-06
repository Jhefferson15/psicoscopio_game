export class CustomCard {
  constructor({ id, type, content, contentType, color, createdAt, userId, isReported, reportReason }) {
    this.id = id || Date.now().toString();
    this.type = type; // e.g., 'Reflexão', 'Desafio'
    this.content = content; // Canvas dataURL, text string, or image dataURL
    this.contentType = contentType; // 'drawing', 'text', 'image'
    this.color = color;
    this.createdAt = createdAt || new Date().toISOString();
    this.userId = userId || null;
    this.isReported = isReported || false;
    this.reportReason = reportReason || null;
  }

  isValid() {
    if (!this.content) return false;
    if (this.contentType === 'text' && (typeof this.content !== 'string' || this.content.trim().length === 0)) return false;
    return true;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      content: this.content,
      contentType: this.contentType,
      color: this.color,
      createdAt: this.createdAt,
      userId: this.userId,
      isReported: this.isReported,
      reportReason: this.reportReason
    };
  }

  static fromJSON(data) {
    return new CustomCard(data);
  }
}

