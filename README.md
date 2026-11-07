# anime-manga

A browsing app for anime and manga, built with React, TypeScript, Vite, and
Tailwind CSS.

## Features

- **Discover** — trending/seasonal anime and top manga
- **Browse** — search anime or manga, filter by genre
- **Genres** — jump into any genre
- **Detail pages** — synopsis, score, episode/chapter counts, genres, and
  opening/ending theme song titles & artists
- **Media Lab** — bring your own video clip and subtitle file(s) to try:
  - dual subtitle tracks
  - karaoke-style word highlighting for sing-alongs
  - voice isolation (center-channel cancellation) for dub practice
  - record-along with your microphone, with a downloadable take

Anime/manga metadata and cover art come live from the public
[Jikan API](https://jikan.moe/) (a MyAnimeList wrapper) — nothing is bundled
or embedded in the repo. The Media Lab works entirely on files you provide
locally in your browser; it ships with no video, audio, or lyrics content of
its own.

## Getting started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
