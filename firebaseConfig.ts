
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyASARhsCisO8S59X9v9XheCQDb4Aoto2D8',
  authDomain: 'drivewise-group6-f26.firebaseapp.com',
  projectId: 'drivewise-group6-f26',
  storageBucket: 'drivewise-group6-f26.firebasestorage.app',
  messagingSenderId: '580118838296',
  appId: '1:580118838296:web:08e8091b4a4aa58e33976d',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
