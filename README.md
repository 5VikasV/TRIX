# TRIX

TRIX is a live two-player Ultimate Tic Tac Toe game. Create a five-character room, share its invite link, and play against one friend in real time.

**Live demo:** https://trix-online.web.app

## Run locally

Use Node 22 or newer.

```sh
npm install
cp .env.example .env.local
```

Create a Firebase web app in your own Firebase project, then add its four public web configuration values to `.env.local`:

```sh
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

Enable Anonymous Authentication and Cloud Firestore in that project, then start the app:

```sh
npm run dev
```

Open the local URL in two separate browser profiles or private windows. A single profile shares one anonymous Firebase identity and cannot represent two players.

## Build and host

```sh
npm run build
```

Upload the generated `dist` directory to any static host. Set the same `VITE_FIREBASE_*` variables in that host's build environment so the deployed app connects to your Firebase project.

This repository intentionally excludes Firebase project files, Firestore rules, emulator state, and local environment files. Each deployment uses its own Firebase configuration.

## Tests

```sh
npm test
npm run lint
npm run build
```

## Match behavior

- The host and guest receive X and O randomly when the guest joins. The first turn is randomized separately.
- A move sends the opponent to the mini board matching its cell. If that board is complete, they may choose any open board.
- Win three mini boards in a line to win the match. A full overall board without a line is a draw.
- Both players must request a rematch. Each round randomizes the starting player.
- Room URLs and anonymous identity restore a match after refresh. A disconnected guest slot remains reserved for five minutes.
