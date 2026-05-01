import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, update } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { readFileSync } from 'fs';

const envConfig = readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, val] = line.split('=');
  if (key && val) acc[key.trim()] = val.trim().replace(/['"]/g, '');
  return acc;
}, {});

const app = initializeApp({
  apiKey: envConfig.VITE_FIREBASE_API_KEY,
  authDomain: envConfig.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envConfig.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envConfig.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envConfig.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envConfig.VITE_FIREBASE_APP_ID,
  databaseURL: envConfig.VITE_FIREBASE_DATABASE_URL
});

const auth = getAuth(app);
const db = getDatabase(app);

async function testRules() {
  console.log('Authenticating...');
  await signInAnonymously(auth);
  console.log('Authenticated as:', auth.currentUser.uid);

  try {
    const roomId = 'test_room_' + Date.now();
    const roomRef = ref(db, `rooms/${roomId}`);
    
    console.log(`[1] Creating room ${roomId}...`);
    await set(roomRef, {
      id: roomId,
      ownerId: auth.currentUser.uid,
      status: 'waiting',
      gameState: {
        players: [
          { id: 1, name: 'P1', color: '#000', position: 0, timeLeft: 120, lastRoll: null }
        ],
        currentPlayerIndex: 0
      }
    });
    console.log('SUCCESS: Room created.');

    const gameStateRef = ref(db, `rooms/${roomId}/gameState`);

    console.log('[2] Updating isRolling to true and lastDiceRoll to 0...');
    await update(gameStateRef, {
      isRolling: true,
      lastDiceRoll: 0
    });
    console.log('SUCCESS: isRolling updated.');

    console.log('[3] Updating step-by-step movement...');
    await update(gameStateRef, {
      players: [
        { id: 1, name: 'P1', color: '#000', position: 1, timeLeft: 120, lastRoll: null }
      ]
    });
    console.log('SUCCESS: Movement updated.');
    
    console.log('[4] Updating lastRoll to 4 and lastDiceRoll to 4...');
    await update(gameStateRef, {
      isRolling: false,
      lastDiceRoll: 4,
      players: [
        { id: 1, name: 'P1', color: '#000', position: 1, timeLeft: 120, lastRoll: 4 }
      ]
    });
    console.log('SUCCESS: lastRoll updated.');

    process.exit(0);
  } catch (error) {
    console.error('FIREBASE PERMISSION ERROR:', error.message);
    process.exit(1);
  }
}

testRules();
