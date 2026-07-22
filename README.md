# Korath Landing (Angular)

Landing page for **korath.ovh** (and optionally **patelnia.ovh**) with solar cycle, sand canvas, and Firebase Auth.

## Brand by domain

`#mainTitle` resolves from `location.hostname`:

- `patelnia.ovh` / `*.patelnia.ovh` → `PATELNIA.OVH`
- everything else (including `korath.ovh` and localhost) → `KORATH.OVH`

## Local development

```bash
npm ci
npm start
```

Production build:

```bash
npm run build
# output: dist/korath/browser/
```

## Firebase

Uses existing Firebase project `patelnia-landing`. In Firebase Console → Authentication → Settings → Authorized domains, add:

- `korath.ovh`
- `www.korath.ovh`
- `patelnia.ovh`

## Deploy

Push to `master` runs GitHub Actions: `npm ci` → `ng build` → SCP `dist/korath/browser/` to `/var/www/html/korath.ovh`.

## Legacy

The older static / Angular work lived in `patelnia-landing`. This repo is the single source of truth going forward.
