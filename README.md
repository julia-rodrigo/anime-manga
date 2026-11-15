# anime-manga

A browsing app for anime, manga and light novels, built with React,
TypeScript, Vite and Tailwind CSS, and packaged for Android/iOS with Capacitor.

## Features

- **Discover** — trending anime, this season, trending manga, popular light novels
- **Browse** — anime, manga or light novels, with search, genre filter and "load more"
- **Genres** — pick a genre for any of the three
- **Detail pages** — synopsis, score, format, status, episode/chapter/volume
  counts and genres; anime also list opening/ending song titles when available
- **Media Lab** — bring your own video clip and subtitle file(s) to try:
  - dual subtitle tracks
  - karaoke-style word highlighting for sing-alongs
  - voice isolation (center-channel cancellation) for dub practice
  - record-along with your microphone, with a downloadable take

Catalogue data and cover art come live from the public
[AniList GraphQL API](https://docs.anilist.co/) (`src/lib/api.ts`); theme song
titles are a best-effort extra from [Jikan](https://jikan.moe/). Nothing is
bundled in the repo. The Media Lab works entirely on files you provide locally;
it ships with no video, audio or lyrics of its own.

## Web

```bash
npm install
npm run dev
```

## Android

Needs the Android SDK (`ANDROID_HOME`, or `sdk.dir` in `android/local.properties`).

```bash
npm run cap:sync
cd android && ./gradlew assembleDebug
```

The APK lands in `android/app/build/outputs/apk/debug/anime-manga-debug.apk`.
`npm run android:open` / `npm run ios:open` open the native projects in
Android Studio / Xcode instead.
