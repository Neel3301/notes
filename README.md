# Edsy Notes

A local-first, end-to-end-encrypted notes app with a web client (`web/`) and a native
Android/iOS client (`mobile/`, Expo + React Native). Sign in with just a username and
password; notes sync across devices encrypted in the client, so the server never sees
your content.

## Repository layout

| Path | What it is |
| :--- | :--- |
| `web/` | Web app (React 19, Vite, Tailwind v4). Deployed to Vercel. |
| `mobile/` | Native app (Expo, React Native). No WebView. |
| `supabase-schema.sql` | Database schema + Row Level Security. Run once in Supabase. |
| `docs/` | Design spec and build plan. |

## Backend setup (Supabase)

1. Create a project at supabase.com.
2. SQL Editor -> run `supabase-schema.sql` (safe to re-run; upgrades older schemas).
3. Authentication -> Providers -> Email -> turn **off** "Confirm email". Usernames map to a
   synthetic address (`name@edsy.app`) that can never receive mail.
4. Copy the project URL and publishable (anon) key into the env files below.

## Web

```bash
cd web
cp .env.example .env.local   # fill in the Supabase URL + publishable key
npm install
npm run dev                  # http://localhost:5173
npm test                     # unit tests (crypto, sync, sharing)
npm run build
```

Deploy on Vercel: import the repo, set **Root Directory** to `web`, and add
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables.
`web/vercel.json` provides SPA rewrites and security headers.

## Mobile

See [`mobile/README.md`](mobile/README.md).

## Security model

- Notes are encrypted with AES-256-GCM using a key derived (PBKDF2-SHA256, 100k iterations)
  from your encryption passphrase (defaults to your password). Only ciphertext, ids,
  timestamps and a tombstone flag reach the server. **A forgotten passphrase cannot be
  recovered.**
- The derived key is non-extractable and kept in IndexedDB; the passphrase is never stored.
- Public share links are readable by anyone with the link (stored as plain JSON). Private
  share links are encrypted with a password that never leaves the browser.
- All tables use Row Level Security; share links are read through a single-row function so
  they cannot be enumerated.
