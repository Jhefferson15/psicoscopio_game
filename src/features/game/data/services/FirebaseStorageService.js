import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage } from "../../../../config/firebase.js";

export class FirebaseStorageService {
  /**
   * Faz upload de uma imagem em formato DataURL para o Firebase Storage
   * @param {string} userId ID do usuário dono da carta
   * @param {string} cardId ID da carta para nomear o arquivo
   * @param {string} dataUrl Conteúdo da imagem em Base64
   * @returns {Promise<string>} URL de download da imagem
   */
  static async uploadCardImage(userId, cardId, dataUrl) {
    if (!storage || !dataUrl || !dataUrl.startsWith('data:image')) {
      return dataUrl; // Retorna o próprio conteúdo se não for imagem ou storage não estiver pronto
    }

    try {
      // O caminho será: custom_cards/{userId}/{cardId}.png
      const storageRef = ref(storage, `custom_cards/${userId}/${cardId}.png`);
      
      // Upload do DataURL (format: 'data_url' para o Firebase saber lidar com o prefixo)
      const uploadResult = await uploadString(storageRef, dataUrl, 'data_url');
      
      // Obtém a URL pública para salvar no Firestore
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      return downloadURL;
    } catch (error) {
      console.error("[FirebaseStorageService] Erro ao fazer upload da imagem:", error);
      throw error;
    }
  }
}
