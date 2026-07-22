import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BrandService } from '@app/core/brand';
import { SolarEnvironmentService } from '@app/core/solar';
import { AuthService } from '@app/core/auth';
import { SandCanvasComponent } from './sand-canvas/sand-canvas.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [SandCanvasComponent, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  private static readonly CLICK_RESET_MS = 1000;
  protected readonly solar = inject(SolarEnvironmentService);
  protected readonly auth = inject(AuthService);
  protected readonly brand = inject(BrandService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly titleClickCount = signal(0);
  private resetTimerId: ReturnType<typeof setTimeout> | null = null;
  protected readonly loginHintText = computed(() => {
    const clicks = this.titleClickCount();

    if (clicks < 4 || clicks >= 8) {
      return null;
    }

    return `+${8 - clicks} zaloguj`;
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.clearClickResetTimer());
  }

  protected onTimeSliderInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    this.solar.onTimeSliderInput(parseFloat(el.value));
  }

  protected onTimeSliderInteractionStart(event: Event): void {
    this.solar.startManualMode();
  }

  protected onTitleClick(): void {
    if (this.auth.isAuthenticated()) {
      return;
    }

    this.clearClickResetTimer();
    const nextCount = this.titleClickCount() + 1;
    this.titleClickCount.set(nextCount);

    if (nextCount >= 8) {
      this.titleClickCount.set(0);
      void this.router.navigateByUrl('/login');
      return;
    }

    this.resetTimerId = setTimeout(() => {
      this.titleClickCount.set(0);
      this.resetTimerId = null;
    }, LandingComponent.CLICK_RESET_MS);
  }

  private clearClickResetTimer(): void {
    if (this.resetTimerId !== null) {
      clearTimeout(this.resetTimerId);
      this.resetTimerId = null;
    }
  }
}
