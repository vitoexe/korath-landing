import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthAccessDeniedError, AuthService } from '@app/core/auth';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly isSubmitDisabled = computed(() => this.loading());

  protected async signIn(): Promise<void> {
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.auth.signInWithGoogle();
      await this.router.navigateByUrl('/dashboard');
    } catch (e) {
      if (e instanceof AuthAccessDeniedError) {
        this.error.set(e.message);
      } else if (e instanceof Error && /popup-closed-by-user|cancelled/i.test(e.message)) {
        this.error.set(null);
      } else {
        this.error.set(e instanceof Error ? e.message : 'Logowanie nie powiodło się.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
