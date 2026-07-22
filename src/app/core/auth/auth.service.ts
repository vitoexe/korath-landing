import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  type Auth,
  deleteUser,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import { firstValueFrom, map, Observable, of, shareReplay, take } from 'rxjs';
import { FIREBASE_AUTH } from '@app/core/firebase';
import { environment } from '@env/environment';
import { AuthAccessDeniedError } from './auth-access-denied.error';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(FIREBASE_AUTH);
  private readonly allowedEmails = new Set(
    environment.allowedEmails.map((email) => email.trim().toLowerCase()).filter(Boolean),
  );
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
    const credential = await signInWithPopup(this.auth, provider);
    await this.enforceAllowlist(credential.user);
  }

  async signOut(): Promise<void> {
    if (!this.auth) {
      return;
    }
    await signOut(this.auth);
  }

  isEmailAllowed(email: string | null | undefined): boolean {
    if (!email) {
      return false;
    }
    return this.allowedEmails.has(email.trim().toLowerCase());
  }

  private async enforceAllowlist(user: User): Promise<void> {
    if (this.isEmailAllowed(user.email)) {
      return;
    }

    try {
      await deleteUser(user);
    } catch {
      await this.signOut();
    }

    throw new AuthAccessDeniedError();
  }

  private createAuthState$(auth: Auth | undefined): Observable<User | null> {
    if (!auth) {
      return of(null);
    }

    return new Observable<User | null>((subscriber) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          if (user && !this.isEmailAllowed(user.email)) {
            void this.rejectUnauthorizedSession(user).finally(() => subscriber.next(null));
            return;
          }
          subscriber.next(user);
        },
        (error) => subscriber.error(error),
      );
      return () => unsubscribe();
    }).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  private async rejectUnauthorizedSession(user: User): Promise<void> {
    try {
      await deleteUser(user);
    } catch {
      await this.signOut();
    }
  }
}
