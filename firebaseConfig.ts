import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
// @ts-expect-error React Native export is missing from Firebase's TypeScript declarations
import { getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyASARhsCisO8S59X9v9XheCQDb4Aoto2D8',
  authDomain: 'drivewise-group6-f26.firebaseapp.com',
  projectId: 'drivewise-group6-f26',
  storageBucket: 'drivewise-group6-f26.firebasestorage.app',
  messagingSenderId: '580118838296',
  appId: '1:580118838296:web:08e8091b4a4aa58e33976d',
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
