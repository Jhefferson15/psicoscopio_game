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
    await updateDoc(userRef, {
      diary: arrayUnion(entry)
    });
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
}
