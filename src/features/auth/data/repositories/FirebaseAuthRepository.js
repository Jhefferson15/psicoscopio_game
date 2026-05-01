import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../../../../config/firebase.js";
import { User } from "../../domain/entities/User.js";
import { AuthRepository } from "../../domain/repositories/AuthRepository.js";

export class FirebaseAuthRepository extends AuthRepository {
  async loginWithGoogle() {
    if (!auth) {
      console.warn("Firebase não configurado. Simulando login para demonstração.");
      return new User("offline-user", "Usuário Local", null, null);
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const firebaseUser = result.user;
      return new User(
        firebaseUser.uid,
        firebaseUser.displayName,
        firebaseUser.email,
        firebaseUser.photoURL
      );
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      throw error;
    }
  }

  async logout() {
    if (!auth) return;
    try {
      await signOut(auth);

    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      throw error;
    }
  }

  async getCurrentUser() {
    if (!auth) return null;
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) return null;
    return new User(
      firebaseUser.uid,
      firebaseUser.displayName,
      firebaseUser.email,
      firebaseUser.photoURL
    );
  }

  onAuthStateChanged(callback) {
    if (!auth) return () => {};
    return onAuthStateChanged(auth, (firebaseUser) => {

      if (firebaseUser) {
        callback(new User(
          firebaseUser.uid,
          firebaseUser.displayName,
          firebaseUser.email,
          firebaseUser.photoURL
        ));
      } else {
        callback(null);
      }
    });
  }
}
