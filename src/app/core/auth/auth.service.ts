import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  type Auth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import { firstValueFrom, map, Observable, of, shareReplay, take } from 'rxjs';
import { FIREBASE_AUTH } from '@app/core/firebase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(FIREBASE_AUTH);
  private readonly authState$ = this.createAuthState$(this.auth);

  readonly user = toSignal(this.authState$, { initialValue: null });
  readonly isAuthenticated = computed(() => this.user() !== null);

  readonly authReady: Promise<void>;

  constructor() {
    this.authReady = firstValueFrom(this.authState$.pipe(take(1), map(() => void 0)));
  }

  async signInWithGoogle(): Promise<void> {
    if (!this.auth) {
      throw new Error(
        'Firebase Auth is not configured. Fill firebase config in src/environments/environment.ts.',
      );
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  }

  async signOut(): Promise<void> {
    if (!this.auth) {
      return;
    }
    await signOut(this.auth);
  }

  private createAuthState$(auth: Auth | undefined): Observable<User | null> {
    if (!auth) {
      return of(null);
    }

    return new Observable<User | null>((subscriber) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => subscriber.next(user),
        (error) => subscriber.error(error),
      );
      return () => unsubscribe();
    }).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }
}
