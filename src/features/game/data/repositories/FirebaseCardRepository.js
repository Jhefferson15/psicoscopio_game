import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc,
  serverTimestamp 
} from "firebase/firestore";
import { firestore, storage } from "../../../../config/firebase.js";
import { CardRepository } from "../../domain/repositories/CardRepository";
import { CustomCard } from "../../domain/entities/CustomCard";
import { FirebaseStorageService } from "../services/FirebaseStorageService";

export class FirebaseCardRepository extends CardRepository {
  constructor() {
    super();
    this.COLLECTION_NAME = "customCards";
  }

  async saveCard(card) {
    if (!firestore || !card.userId) {
      console.warn("[FirebaseCardRepository] Firestore não configurado ou userId ausente.");
      return null;
    }

    try {
      let finalContent = card.content;

      // Se for imagem/desenho, sobe para o Storage primeiro
      if (card.contentType === 'drawing' || card.contentType === 'image') {
        if (card.content.startsWith('data:image')) {
          finalContent = await FirebaseStorageService.uploadCardImage(
            card.userId,
            card.id,
            card.content
          );
        }
      }

      const cardData = {
        ...card.toJSON(),
        content: finalContent,
        updatedAt: serverTimestamp()
      };

      // Salva no Firestore: customCards/{cardId}
      // Usamos o cardId como ID do documento para facilitar atualizações
      const cardRef = doc(firestore, this.COLLECTION_NAME, card.id);
      await setDoc(cardRef, cardData, { merge: true });

      return CustomCard.fromJSON({ ...cardData, content: finalContent });
    } catch (error) {
      console.error("[FirebaseCardRepository] Erro ao salvar carta:", error);
      throw error;
    }
  }

  async getCards(userId) {
    if (!firestore || !userId) return [];

    try {
      const cardsRef = collection(firestore, this.COLLECTION_NAME);
      const q = query(cardsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => CustomCard.fromJSON(doc.data()));
    } catch (error) {
      console.error("[FirebaseCardRepository] Erro ao buscar cartas:", error);
      return [];
    }
  }

  async deleteCard(id) {
    if (!firestore) return;

    try {
      const cardRef = doc(firestore, this.COLLECTION_NAME, id);
      await deleteDoc(cardRef);
    } catch (error) {
      console.error("[FirebaseCardRepository] Erro ao deletar carta:", error);
      throw error;
    }
  }

  async reportCard(id, reason) {
    if (!firestore) return null;

    try {
      const cardRef = doc(firestore, this.COLLECTION_NAME, id);
      const updateData = {
        isReported: true,
        reportReason: reason,
        updatedAt: serverTimestamp()
      };
      await setDoc(cardRef, updateData, { merge: true });
      return true;
    } catch (error) {
      console.error("[FirebaseCardRepository] Erro ao denunciar carta:", error);
      throw error;
    }
  }
}

export const firebaseCardRepository = new FirebaseCardRepository();
