# Guru 2 u — Mobile (React Native / Expo, Android + iOS)

Standalone Expo app (all 5 reading flows, Firebase auth, Stripe checkout, i18n + RTL).

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill in values.
3. `npm run dev` (or `npx expo start`) — then run on Android/iOS via Expo Go or a dev build.

Shared code (API client, locales) is vendored in `vendor/`. Point `EXPO_PUBLIC_DOMAIN` at your deployed backend's bare hostname.

## Building & deploying
- **Web (static export)**: `npm run build:web` (runs `expo export --platform web`, output in `dist/`); serve it with `npm run serve:web` or any static host/CDN.
- **Native app-store binaries**: uses [EAS Build](https://docs.expo.dev/build/introduction/) — requires a free Expo account. Run `eas login` once, then `eas build:configure`, then `npm run build:android` / `npm run build:ios`. Build profiles live in `eas.json` (`development`, `preview`, `production`).
