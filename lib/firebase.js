// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyA8IDsiyN1ngsfRVcKaOEwG0zEv0qvoHGQ',
  authDomain: 'firsthash-e8b71.firebaseapp.com',
  projectId: 'firsthash-e8b71',
  storageBucket: 'firsthash-e8b71.firebasestorage.app',
  messagingSenderId: '417262778687',
  appId: '1:417262778687:web:d9a7cb7a128b080f36fb8a',
};

// Initialize app once
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
