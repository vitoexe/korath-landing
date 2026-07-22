export interface SolarTimes {
  dawnStart: number;
  sunrise: number;
  noon: number;
  sunset: number;
  duskEnd: number;
}

export function lerp(start: number, end: number, amt: number): number {
  return Math.round(start + (end - start) * amt);
}

export function formatTime(decimalHours: number): string {
  const hrs = Math.floor(decimalHours);
  const mins = Math.floor((decimalHours - hrs) * 60);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function getWarsawSolarTimes(date: Date): SolarTimes {
  const lat = 52.2297;
  const lng = 21.0122;
  const rad = Math.PI / 180;
  const twilightAngleDeg = -6;

  const start = new Date(Date.UTC(date.getFullYear(), 0, 0));
  const today = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayOfYear = (today.getTime() - start.getTime()) / 86400000;

  const b = (360 / 365) * (dayOfYear - 81) * rad;
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  const tc = 4 * lng + eot;
  const decl = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * rad) * rad;

  const calcHourAngle = (angleDeg: number) => {
    const hArg =
      (Math.sin(angleDeg * rad) - Math.sin(lat * rad) * Math.sin(decl)) /
      (Math.cos(lat * rad) * Math.cos(decl));
    return (Math.acos(Math.max(-1, Math.min(1, hArg))) / rad) as number;
  };

  const noonUtc = 12 - tc / 60;
  const haSunrise = calcHourAngle(-0.833) / 15;
  const haTwilight = calcHourAngle(twilightAngleDeg) / 15;

  const toLocalHour = (utcHours: number) => {
    const d = new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        Math.floor(utcHours),
        Math.floor((utcHours % 1) * 60),
      ),
    );
    return d.getHours() + d.getMinutes() / 60;
  };

  return {
    dawnStart: toLocalHour(noonUtc - haTwilight),
    sunrise: toLocalHour(noonUtc - haSunrise),
    noon: toLocalHour(noonUtc),
    sunset: toLocalHour(noonUtc + haSunrise),
    duskEnd: toLocalHour(noonUtc + haTwilight),
  };
}
