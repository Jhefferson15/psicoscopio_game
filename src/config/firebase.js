import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// Credenciais lidas das variáveis de ambiente (Vite)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Verifica se as credenciais mínimas foram preenchidas
export const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.projectId;

let authInstance = null;
let databaseInstance = null;
let firestoreInstance = null;
let googleProviderInstance = null;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    databaseInstance = getDatabase(app);
    firestoreInstance = getFirestore(app);
    googleProviderInstance = new GoogleAuthProvider();
    
    // Opcional: Configurações adicionais para o provedor Google
    googleProviderInstance.setCustomParameters({
      prompt: 'select_account'
    });
  } catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
  }
}

export const auth = authInstance;
export const database = databaseInstance;
export const firestore = firestoreInstance;
export const googleProvider = googleProviderInstance;

export default isFirebaseConfigured;
