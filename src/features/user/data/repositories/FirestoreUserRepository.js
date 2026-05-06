import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { firestore } from "../../../../config/firebase.js";

export class FirestoreUserRepository {
  async getUserStats(userId) {
    if (!firestore) return null;
    const userDoc = await getDoc(doc(firestore, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data().stats;
    }
    return { gamesPlayed: 0, totalReflections: 0, lastLogin: Date.now() };
  }

  async saveDiaryEntry(userId, entry) {
    if (!firestore) return;
    const userRef = doc(firestore, "users", userId);
    await setDoc(userRef, {
      diary: arrayUnion(entry)
    }, { merge: true });
  }

  async syncUserData(userId, data) {
    if (!firestore) return;
    const userRef = doc(firestore, "users", userId);
    await setDoc(userRef, data, { merge: true });
  }

  async getDiaryEntries(userId) {
    if (!firestore) return [];
    const userDoc = await getDoc(doc(firestore, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data().diary || [];
    }
    return [];
  }

  async deleteDiaryEntry(userId, entryId) {
    if (!firestore) return;
    const userRef = doc(firestore, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const diary = userDoc.data().diary || [];
      const updatedDiary = diary.filter(e => e.id !== entryId);
      await updateDoc(userRef, { diary: updatedDiary });
    }
  }

  async updateDiaryEntry(userId, entryId, newData) {
    if (!firestore) return;
    const userRef = doc(firestore, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const diary = userDoc.data().diary || [];
      const updatedDiary = diary.map(e => e.id === entryId ? { ...e, ...newData } : e);
      await updateDoc(userRef, { diary: updatedDiary });
    }
  }

  async getCardSets(userId) {
    if (!firestore) return [];
    const userDoc = await getDoc(doc(firestore, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data().cardSets || [];
    }
    return [];
  }

  async saveCardSets(userId, cardSets) {
    if (!firestore) return;
    const userRef = doc(firestore, "users", userId);
    // Converte instâncias para objetos simples antes de salvar
    const plainSets = cardSets.map(s => typeof s.toJSON === 'function' ? s.toJSON() : s);
    await setDoc(userRef, { cardSets: plainSets }, { merge: true });
  }

  async getBoardConfigs(userId) {
    if (!firestore) return [];
    const userDoc = await getDoc(doc(firestore, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data().boardConfigs || [];
    }
    return [];
  }

  async saveBoardConfigs(userId, boardConfigs) {
    if (!firestore) return;
    const userRef = doc(firestore, "users", userId);
    // Converte instâncias para objetos simples antes de salvar
    const plainConfigs = boardConfigs.map(c => typeof c.toJSON === 'function' ? c.toJSON() : c);
    await setDoc(userRef, { boardConfigs: plainConfigs }, { merge: true });
  }
}


