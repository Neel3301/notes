# Edsy Notes - mobile (Expo + React Native)

Native Android/iOS client. Local-first notes with optional end-to-end-encrypted
cloud sync and share links, using the same Supabase backend and wire format as `../web`.

## Setup

```bash
cd mobile
cp .env.example .env.local      # Supabase URL + publishable key, public web URL
npm install --legacy-peer-deps
npx expo start                  # scan with Expo Go, or press a / i
npm test                        # crypto interoperability tests
```

Run `supabase-schema.sql` (repo root) on your Supabase project first and turn off
"Confirm email" (see the root README).

## Release builds (EAS)

```bash
npm i -g eas-cli && eas login
eas build -p android --profile preview      # installable .apk for testing
eas build -p android --profile production   # .aab for Google Play
eas build -p ios --profile production       # needs an Apple Developer account
```

Set `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` and `EXPO_PUBLIC_WEB_URL`
as EAS environment variables (`eas env:create`) so cloud builds can read them.

## Layout

| Path | Purpose |
| :--- | :--- |
| `App.js` | App shell: navigation stack, deep links (`edsy://share/<slug>`, `https://<web>/share/<slug>`), auto-sync |
| `src/screens` | Timeline, All Notes, Editor, Menu, Account & Sync, Shared note |
| `src/data/notesStore.js` | AsyncStorage-backed store with tombstones for synced deletes |
| `src/services/crypto.js` | PBKDF2 + AES-256-GCM (pure-JS noble), compatible with the web client |
| `src/services/sync.js` | Incremental E2EE sync (pull -> last-write-wins -> push) |
| `src/lib/storage.js` | Master key kept in the OS keystore (expo-secure-store) |
