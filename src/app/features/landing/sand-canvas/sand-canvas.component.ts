import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  NgZone,
  viewChild,
} from '@angular/core';
import { SolarEnvironmentService } from '@app/core/solar';
import { Particle } from './particle';

@Component({
  selector: 'app-sand-canvas',
  standalone: true,
  template: '<canvas id="sandCanvas" #sandCanvas></canvas>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SandCanvasComponent implements AfterViewInit {
  private readonly zone = inject(NgZone);
  private readonly solar = inject(SolarEnvironmentService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('sandCanvas');

  private ctx!: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private particles: Particle[] = [];
  private rafId: number | undefined;
  private readonly resizeListener = () => this.resize();

  ngAfterViewInit(): void {
    const canvas = this.canvasRef().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    this.ctx = ctx;

    this.zone.runOutsideAngular(() => {
      this.resize();
      window.addEventListener('resize', this.resizeListener);

      const count = window.innerWidth < 768 ? 80 : 250;
      for (let i = 0; i < count; i++) {
        this.particles.push(new Particle(this.width, this.height));
      }

      const tick = () => {
        this.animateFrame();
        this.rafId = requestAnimationFrame(tick);
      };
      tick();
    });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', this.resizeListener);
      if (this.rafId !== undefined) {
        cancelAnimationFrame(this.rafId);
      }
    });
  }

  private resize(): void {
    const canvas = this.canvasRef().nativeElement;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    canvas.width = this.width;
    canvas.height = this.height;
  }

  private animateFrame(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const nightFactor = this.solar.nightFactor();
    const sandRgb = this.solar.sandColorRgbString();

    for (const p of this.particles) {
      p.update();
      p.draw(this.ctx, sandRgb, nightFactor, this.height);
    }
  }
}
