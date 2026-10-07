# mosqai-mobile

The app for an individual device owner: *"What is happening with MY MosqAI
Shield?"* It covers sign-up/login, device pairing, the dashboard with
**confirmed** device state, manual control and mode switching, automatic
settings, health (camera, fan, UV-A, CO₂, power), latest images and AI
detections, history and trends, alerts, and device settings.

It talks only to `mosqai-backend` and never to a device directly.

Primary owner: Developer 1. Visual reference: the MosqAI Shield Figma design.

## Technology

React Native · Expo · TypeScript · (planned) Expo Router, TanStack Query, WebSocket client

## Setup

> Not scaffolded yet. First M3 issue: "Mobile authentication".

Planned: `pnpm install`, copy `.env.example` → `.env`, `pnpm expo start`.

## Environment variables

Only `EXPO_PUBLIC_*` values reach the app bundle. They are **public**, so never
put secrets in them. See [`.env.example`](.env.example).

## Development

Screens are built from a shared component set taken from the Figma design
(colour, type and spacing tokens). Every data view handles loading, error, empty,
and **device offline / no data** states.

## Testing

Jest + React Native Testing Library for components and API hooks.

## Deployment

EAS Build for Android/iOS, with separate dev, staging and production profiles.

## Contribution workflow

Branch from `develop` (`feature/…`, `fix/…`, `refactor/…`), use Conventional
Commits, open a PR into `develop`, one approval. Full rules:
[mosqai-docs/workflow.md](https://github.com/MosqAI-Shield/mosqai-docs/blob/develop/workflow.md).
