import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

// IMPORTANTE: Preencha com suas credenciais do Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Verifica se as credenciais foram preenchidas
export const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.databaseURL &&
  firebaseConfig.databaseURL !== "YOUR_DATABASE_URL";

let authInstance = null;
let databaseInstance = null;
let googleProviderInstance = null;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    databaseInstance = getDatabase(app);
    googleProviderInstance = new GoogleAuthProvider();
  } catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
  }
}

export const auth = authInstance;
export const database = databaseInstance;
export const googleProvider = googleProviderInstance;

export default isFirebaseConfigured;
