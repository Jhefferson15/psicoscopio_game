import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, update } from 'firebase/database';
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

const db = getDatabase(app);

async function testRules() {
  console.log('Testing Firebase Rules...');
  try {
    const testRoomRef = ref(db, 'rooms/test_room_123/gameState');
    console.log('Attempting to set valid game state...');
    
    // Simulating startOnlineGame payload
    await set(testRoomRef, {
      players: [
        { id: 1, name: 'Player 1', color: '#fff', position: 0, timeLeft: 120 },
        { id: 2, name: 'Player 2', color: '#000', position: 0, timeLeft: 120 }
      ],
      currentPlayerIndex: 0,
      lastDiceRoll: 0,
      boardRotation: 0,
      playerAttributes: {}
    });
    console.log('SUCCESS: Initial state set.');

    console.log('Attempting to update step-by-step movement...');
    await update(testRoomRef, {
      players: [
        { id: 1, name: 'Player 1', color: '#fff', position: 1, timeLeft: 120 },
        { id: 2, name: 'Player 2', color: '#000', position: 0, timeLeft: 120 }
      ]
    });
    console.log('SUCCESS: Movement updated.');
    
    console.log('Attempting to update lastRoll...');
    await update(testRoomRef, {
      players: [
        { id: 1, name: 'Player 1', color: '#fff', position: 1, timeLeft: 120, lastRoll: 4 },
        { id: 2, name: 'Player 2', color: '#000', position: 0, timeLeft: 120 }
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
