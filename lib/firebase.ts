import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
// @ts-expect-error - getReactNativePersistence exists at runtime but is not in the public TS types yet
import { getReactNativePersistence } from 'firebase/auth';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithCredential,
  PhoneAuthProvider,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  type User,
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// getReactNativePersistence only exists in Firebase's React Native build.
export const auth = initializeAuth(app, {
  persistence: Platform.OS === 'web' ? browserLocalPersistence : getReactNativePersistence(AsyncStorage),
});

export function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export function signOutUser() {
  return signOut(auth);
}

export function watchAuthState(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}

export function confirmPhoneOtp(verificationId: string, code: string) {
  const credential = PhoneAuthProvider.credential(verificationId, code);
  return signInWithCredential(auth, credential);
}

export function signInWithGoogleTokens(idToken: string, accessToken: string) {
  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  return signInWithCredential(auth, credential);
}
