import { lerp } from './solar-math';

export type Rgb = readonly [number, number, number];

export interface ColorStop {
  h: number;
  top: Rgb;
  mid: Rgb;
  bot: Rgb;
  main: Rgb;
  muted: Rgb;
  sand: Rgb;
}

export interface InterpolatedColors {
  top: Rgb;
  mid: Rgb;
  bot: Rgb;
  main: Rgb;
  muted: Rgb;
  sand: Rgb;
}

export const nightColors = {
  top: [5, 8, 20] as Rgb,
  mid: [11, 19, 43] as Rgb,
  bot: [2, 4, 10] as Rgb,
  main: [157, 178, 191] as Rgb,
  muted: [100, 130, 160] as Rgb,
  sand: [100, 130, 180] as Rgb,
};

export const dawnColors = {
  top: [45, 32, 56] as Rgb,
  mid: [112, 66, 90] as Rgb,
  bot: [196, 121, 109] as Rgb,
  main: [255, 214, 201] as Rgb,
  muted: [255, 160, 140] as Rgb,
  sand: [255, 180, 150] as Rgb,
};

export const dayColors = {
  top: [255, 235, 150] as Rgb,
  mid: [225, 140, 55] as Rgb,
  bot: [165, 75, 30] as Rgb,
  main: [255, 240, 220] as Rgb,
  muted: [255, 215, 175] as Rgb,
  sand: [180, 90, 35] as Rgb,
};

export const duskColors = {
  top: [74, 28, 33] as Rgb,
  mid: [140, 51, 37] as Rgb,
  bot: [196, 85, 37] as Rgb,
  main: [255, 179, 138] as Rgb,
  muted: [220, 100, 80] as Rgb,
  sand: [255, 100, 80] as Rgb,
};

export const defaultStops: ColorStop[] = [
  { h: 0, ...nightColors },
  { h: 4, ...nightColors },
  { h: 6, ...dawnColors },
  { h: 7, ...dayColors },
  { h: 12, ...dayColors },
  { h: 19, ...dayColors },
  { h: 19.5, ...duskColors },
  { h: 21, ...nightColors },
  { h: 24, ...nightColors },
];

export function interpolateColors(h: number, stops: ColorStop[]): InterpolatedColors {
  let stop1 = stops[0];
  let stop2 = stops[1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (h >= stops[i].h && h <= stops[i + 1].h) {
      stop1 = stops[i];
      stop2 = stops[i + 1];
      break;
    }
  }
  const range = stop2.h - stop1.h;
  const factor = range === 0 ? 0 : (h - stop1.h) / range;
  const keys: (keyof InterpolatedColors)[] = ['top', 'mid', 'bot', 'main', 'muted', 'sand'];
  const out = {} as InterpolatedColors;
  for (const key of keys) {
    const a = stop1[key];
    const b = stop2[key];
    out[key] = [lerp(a[0], b[0], factor), lerp(a[1], b[1], factor), lerp(a[2], b[2], factor)] as Rgb;
  }
  return out;
}
