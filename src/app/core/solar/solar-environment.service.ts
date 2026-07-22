import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, interval, switchMap } from 'rxjs';
import { formatTime, getWarsawSolarTimes } from './solar-math';
import {
  type ColorStop,
  dawnColors,
  dayColors,
  defaultStops,
  duskColors,
  interpolateColors,
  nightColors,
} from './solar-palette';
import { SolarThemeService } from './solar-theme.service';

function currentDecimalHours(): number {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
}

@Injectable({ providedIn: 'root' })
export class SolarEnvironmentService {
  private static readonly MANUAL_MODE_TIMEOUT_MS = 10_000;
  private readonly theme = inject(SolarThemeService);
  private manualModeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  readonly colorStops = signal<ColorStop[]>(defaultStops);
  readonly currentHours = signal(currentDecimalHours());
  readonly isManualMode = signal(false);

  readonly formattedTime = computed(() => formatTime(this.currentHours()));

  readonly interpolatedColors = computed(() =>
    interpolateColors(this.currentHours(), this.colorStops()),
  );

  readonly sandColorRgbString = computed(() => {
    const s = this.interpolatedColors().sand;
    return `${s[0]}, ${s[1]}, ${s[2]}`;
  });

  readonly nightFactor = computed(() => {
    const stops = this.colorStops();
    const h = this.currentHours();
    const dawnStartH = stops[1].h;
    const sunriseH = stops[2].h;
    const sunsetH = stops[6].h;
    const duskEndH = stops[7].h;

    if (h >= duskEndH || h <= dawnStartH) {
      return 1;
    }
    if (h > sunsetH && h < duskEndH) {
      return (h - sunsetH) / (duskEndH - sunsetH);
    }
    if (h > dawnStartH && h < sunriseH) {
      return 1 - (h - dawnStartH) / (sunriseH - dawnStartH);
    }
    return 0;
  });

  readonly dynamicLineText = computed(() => {
    const stops = this.colorStops();
    const h = this.currentHours();
    const dawnStartH = stops[1].h;
    const sunriseH = stops[2].h;
    const sunsetH = stops[6].h;
    const duskEndH = stops[7].h;

    if (h >= duskEndH || h < dawnStartH) {
      return 'Głęboka noc. Przenikliwy ziąb i absolutna ciemność. Słyszysz wycie z oddali.';
    }
    if (h >= dawnStartH && h < sunriseH) {
      return 'Brzask nieśmiało rozprasza mrok. Za chwilę słońce znów zacznie palić.';
    }
    if (h >= sunsetH && h < duskEndH) {
      return 'Słońce zaszło. Mrok powoli pochłania horyzont, niosąc zwodniczą ulgę.';
    }
    return 'Szukałeś oazy, ale tutaj słońce wypala nawet cień nadziei.';
  });

  readonly showSunIcon = computed(() => {
    const stops = this.colorStops();
    const h = this.currentHours();
    const sunriseH = stops[2].h;
    const sunsetH = stops[6].h;
    return h >= sunriseH && h < sunsetH;
  });

  constructor() {
    this.initSolarCycle();
    this.startAutoTick();
    this.theme.applyCssVariables(this.interpolatedColors);
  }

  startManualMode(): void {
    if (!this.isManualMode()) {
      this.isManualMode.set(true);
    }
    this.scheduleAutoResume();
  }

  onTimeSliderInput(value: number): void {
    this.startManualMode();
    this.currentHours.set(value);
  }

  /** Subscribes to a 1s interval that updates currentHours until manual mode is activated. */
  private startAutoTick(): void {
    toObservable(this.isManualMode)
      .pipe(switchMap((manual) => (manual ? EMPTY : interval(1000))))
      .subscribe(() => this.currentHours.set(currentDecimalHours()));
  }

  private scheduleAutoResume(): void {
    if (this.manualModeTimeoutId !== null) {
      clearTimeout(this.manualModeTimeoutId);
    }

    this.manualModeTimeoutId = setTimeout(() => {
      this.currentHours.set(currentDecimalHours());
      this.isManualMode.set(false);
      this.manualModeTimeoutId = null;
    }, SolarEnvironmentService.MANUAL_MODE_TIMEOUT_MS);
  }

  private initSolarCycle(): void {
    const now = new Date();
    const solar = getWarsawSolarTimes(now);

    let dawnStart = solar.dawnStart;
    const sunrise = solar.sunrise;
    const noon = solar.noon;
    const sunset = solar.sunset;
    let duskEnd = solar.duskEnd;

    if (Number.isNaN(dawnStart) || dawnStart >= sunrise) {
      dawnStart = Math.max(0, sunrise - 1.5);
    }
    if (Number.isNaN(duskEnd) || duskEnd <= sunset) {
      duskEnd = Math.min(24, sunset + 1.5);
    }
    const dayStart = Math.min(sunrise + 1, noon - 0.5);
    const dayEnd = Math.max(sunset - 0.5, noon + 0.5);

    this.colorStops.set([
      { h: 0, ...nightColors },
      { h: dawnStart, ...nightColors },
      { h: sunrise, ...dawnColors },
      { h: dayStart, ...dayColors },
      { h: noon, ...dayColors },
      { h: dayEnd, ...dayColors },
      { h: sunset, ...duskColors },
      { h: duskEnd, ...nightColors },
      { h: 24, ...nightColors },
    ]);
  }
}
