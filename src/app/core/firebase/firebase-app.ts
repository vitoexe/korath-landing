import { InjectionToken } from '@angular/core';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { environment } from '@env/environment';

function isFirebaseConfigured(): boolean {
  const k = environment.firebase.apiKey;
  return Boolean(k && k !== 'REPLACE_ME');
}

let cachedApp: FirebaseApp | undefined;
let cachedAuth: Auth | undefined;

function createFirebaseAuth(): Auth | undefined {
  if (!isFirebaseConfigured()) {
    return undefined;
  }
  if (!cachedApp) {
    cachedApp = initializeApp(environment.firebase);
    cachedAuth = getAuth(cachedApp);
  }
  return cachedAuth;
}

export const FIREBASE_AUTH = new InjectionToken<Auth | undefined>('FIREBASE_AUTH', {
  providedIn: 'root',
  factory: createFirebaseAuth,
});
