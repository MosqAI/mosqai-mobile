# mosqai-mobile

The app for an individual device owner: *"What is happening with MY MosqAI
Shield?"* It covers sign-up/login, device pairing, the dashboard with
**confirmed** device state, manual control and mode switching, automatic
settings, health (camera, fan, UV-A, CO₂, power), latest images and AI
detections, history and trends, alerts, and device settings.

It talks only to `mosqai-backend` and never to a device directly.

Owner: `@MosqAI/core` team (RavynX0, Hope664). Visual reference: the MosqAI Shield Figma design.

## Technology

React Native 0.86 · Expo SDK 57 · Expo Router · TypeScript · TanStack Query · expo-secure-store · react-native-svg

## Setup

Start the backend first (see `mosqai-backend` README, including `pnpm simulate --fleet`). Then:

```bash
pnpm install
cp .env.example .env.local       # EXPO_PUBLIC_API_URL = backend URL
pnpm start                       # Expo dev server; press w for web, or scan with a dev build
```

On a physical phone, set `EXPO_PUBLIC_API_URL` to your computer's LAN address
(e.g. `http://192.168.1.20:3000`), not `localhost`. For the web build, add
`http://localhost:8081` to the backend's `CORS_ORIGINS`.

Dev login: `owner@example.com` / `MosqAI-dev-2026` (owns MSQ-001 and MSQ-002).
Pair another seeded device from **Add Device → Manual Setup** with e.g. `MSQ-026` /
`PAIR-026`.

## Screens

Login, Sign Up, Dashboard, Reports, Devices, Device Details, Device Settings
(manual control), Captures, Capture Details, Analysis Result, Profile, Edit
Profile, Settings, Add Device, plus a branded splash while the session restores.

- Device switches show only the state the **device confirmed**. A command shows
  "Waiting for device" until the ack arrives, then Confirmed / Failed /
  Unconfirmed (timed out).
- Days with no reporting device are drawn as gaps marked "?", never as zero.
- Not yet: capture photos (the backend returns `imageUrl: null` until storage
  lands), QR scanning for pairing (needs `expo-camera` and a development build),
  push notifications, password reset and change.

## Environment variables

Only `EXPO_PUBLIC_*` values reach the app bundle. They are **public**, so never
put secrets in them. See [`.env.example`](.env.example).

## Development

Screens are built from a shared component set taken from the Figma design
(colour, type and spacing tokens). Every data view handles loading, error, empty,
and **device offline / no data** states.

## Testing

`pnpm lint` and `pnpm typecheck` run in CI along with a web export. Planned: Jest +
React Native Testing Library for components and API hooks.

## Deployment

EAS Build for Android/iOS, with separate dev, staging and production profiles.

## Contribution workflow

Branch from `develop` (`feature/…`, `fix/…`, `refactor/…`), use Conventional
Commits, open a PR into `develop`, one approval. Full rules:
[mosqai-docs/workflow.md](https://github.com/MosqAI/mosqai-docs/blob/develop/workflow.md).
