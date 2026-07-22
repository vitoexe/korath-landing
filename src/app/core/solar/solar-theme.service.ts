import { DOCUMENT, effect, inject, Injectable, type Signal } from '@angular/core';
import type { InterpolatedColors } from './solar-palette';

@Injectable({ providedIn: 'root' })
export class SolarThemeService {
  private readonly document = inject(DOCUMENT);

  applyCssVariables(colors: Signal<InterpolatedColors>): void {
    effect(() => {
      const c = colors();
      const root = this.document.documentElement;
      root.style.setProperty('--bg-top', c.top.join(','));
      root.style.setProperty('--bg-mid', c.mid.join(','));
      root.style.setProperty('--bg-bottom', c.bot.join(','));
      root.style.setProperty('--text-main', c.main.join(','));
      root.style.setProperty('--text-muted', c.muted.join(','));
    });
  }
}
