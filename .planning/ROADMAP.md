# Roadmap: Edsy Advanced Notes (Milestone v2.0.0)

## Overview

Transform the Edsy prototype into a complete cross-platform note-taking platform. Milestone v1.0.0 delivered 12 phases establishing the core offline note-taking app and an Android APK. Milestone v2.0.0 expands this into an expansive desktop dashboard on web, introduces optional Supabase authentication, client-side zero-knowledge E2EE cloud sync, secure public and private note sharing, and mobile shared note access, finishing with a verified release APK.

---

## Completed Phases (Milestone v1.0.0)

- **Phase 1: Local Data Store & Note Schema** (Completed - `DATA-01`, `DATA-02`)
- **Phase 2: Timeline & Daily Notes Screen** (Completed - `VIEW-01`, `VIEW-02`)
- **Phase 3: All Notes Catalog & Live Search** (Completed - `VIEW-03`, `VIEW-04`, `VIEW-05`)
- **Phase 4: Note Editor Core & Markdown Engine** (Completed - `NOTE-01`, `NOTE-02`)
- **Phase 5: Modular Block Engine** (Completed - `NOTE-03`)
- **Phase 6: Canvas Freehand Sketch Pad & Audio Memo Player** (Completed - `NOTE-04`, `NOTE-05`)
- **Phase 7: Slide-up Navigation Menu & Smart Views** (Completed - `ORG-01`, `ORG-02`, `ORG-04`)
- **Phase 8: Bi-directional Linking & Export** (Completed - `DATA-03`, `ORG-03`)
- **Phase 9: AI Assistant Action Sheet** (Completed - `AI-01`)
- **Phase 10: Clean Architecture & Semantic Route Alignment** (Completed - `ARCH-01`)
- **Phase 11: React Native Mobile App & Android APK Build** (Completed - `MBL-01`, `MBL-02`, `MBL-03`)
- **Phase 12: Unified Web & Mobile UI Parity via Embedded React Native WebView** (Completed - `PRT-01`, `PRT-02`, `PRT-03`)

---

## Active Phases (Milestone v2.0.0)

### Phase 13: Responsive Desktop Dashboard Layout & Web Revamp
**Goal**: Transform the web app from a fixed 390px mobile frame into an expansive, responsive desktop dashboard while strictly preserving the mobile view on narrow screens (<768px) and Android APK.
- Refactor `PhoneShell.jsx` into a responsive `AppLayout.jsx` container.
- Implement collapsible desktop Left Sidebar: Edsy branding, "New Note" CTA, Navigation items ("Timeline", "All Notes", "Notebooks", "Tags", "Shared", "Settings/Cloud"), sync indicator pill.
- Multi-pane workspace: Notes catalog list on left + active note editor / preview on right on screens >=1024px; wide timeline carousel view with `DatePager`.
- Responsive breakpoint handling: Mobile viewports (<768px) render the exact mobile `PhoneShell` / bottom `DatePager` / slide-up menu experience.
- Desktop-optimized Editor: expansive editor view with side-by-side or quick toggle preview, full-width canvas tab, backlinks drawer.
- *Requirements covered: DSH-01, DSH-02, DSH-03, DSH-04*
- *Success Criteria:*
  1. Desktop viewports (>=1024px) display a full-width dashboard with Left Sidebar and multi-pane note list/editor.
  2. Mobile viewports (<768px) and Android WebView preserve the 100% pixel-perfect mobile reference layout.
  3. Edsy color palette (`#000000`, `#E5E7DA`, `#6F91B6`, `#DCE3EB`, `#CABC3F`) and typography are maintained consistently.

### Phase 14: Supabase Client, Optional Authentication & E2EE Cloud Sync
**Goal**: Integrate Supabase for authentication, cloud storage, and client-side end-to-end encrypted note synchronization with full local-first offline support.
- Supabase client integration (`web/src/services/supabaseClient.js`).
- Web Crypto E2EE service (`web/src/services/cryptoService.js`): AES-256-GCM + PBKDF2 passphrase key derivation. Zero plaintext leaves the client.
- Optional Auth UI & state (`AuthModal.jsx` / `useAuth.js`): Sign up, Sign in, Sign out with Email/Password.
- User-controlled Cloud Sync engine (`web/src/services/syncService.js`):
  - Sync toggle switch (Opt-in / Opt-out).
  - Sync queue: offline changes queued and flushed upon reconnect.
  - Status indicators: "Synced", "Syncing...", "Offline", "Sync Disabled".
  - Manual "Sync Now" button.
  - Offline-first: Full local note-taking works 100% without logging in.
- *Requirements covered: SYNC-01, SYNC-02, SYNC-03, SYNC-04, SYNC-05*
- *Success Criteria:*
  1. User can create, edit, and organize notes offline without creating an account.
  2. User can optionally sign up and sign in via Supabase Auth.
  3. User can enable/disable cloud sync; when enabled, notes are encrypted client-side with AES-256-GCM before upload.
  4. Sync status reflects real-time network and upload states.

### Phase 15: Public & Private Secure Note Sharing
**Goal**: Introduce public and password-protected note sharing with custom slugs and a standalone responsive web viewer.
- `ShareNoteModal.jsx`:
  - Public sharing toggle: Generates public link (random slug or custom slug availability check).
  - Private sharing toggle: User specifies password, note is encrypted with password-derived key.
  - Custom slug input with real-time uniqueness validation.
  - Copy link action with toast notification.
- Supabase `shared_notes` table operations (create, lookup, update, revoke).
- Standalone Share View route (`web/src/screens/SharedNoteScreen.jsx` at `#/share/:slug`):
  - Accessible in any web browser without logging in.
  - Password prompt modal if note is private.
  - Renders markdown, blocks, canvas doodles, and audio notes with Edsy aesthetic.
- *Requirements covered: SHR-01, SHR-02, SHR-03*
- *Success Criteria:*
  1. User can share a note publicly with a random or custom slug and open it in a browser without an account.
  2. User can share a note privately with a password; recipient cannot view or decrypt note without the correct password.
  3. Custom slugs can be checked for availability and claimed.

### Phase 16: Mobile Shared Notes Access & Release APK Parity Rebuild
**Goal**: Enable mobile access to shared notes and rebuild the standalone Android APK with 100% visual and functional parity.
- Mobile "Shared Notes" section & Link Opener dialog to paste a share URL or slug and view/import into local notes.
- Build production web distribution (`npm run build` in `web/`).
- Copy bundle to `mobile/android/app/src/main/assets/web/`.
- Recompile release APK via Gradle to `apk/edsy-notes.apk`.
- Verify complete cross-platform parity (test suite with automated assertions).
- *Requirements covered: SHR-04, PRT-04*
- *Success Criteria:*
  1. Mobile app allows opening, viewing, and importing shared notes into local library.
  2. Release APK compiles successfully at `apk/edsy-notes.apk`.
  3. 100% visual and functional parity across Web and Mobile is verified.

---

## Verification & Guardrails

- All cryptographic operations use standard Web Crypto API (`SubtleCrypto` AES-GCM + PBKDF2).
- Zero plaintext leak to Supabase: titles, contents, blocks, sketches, and audio MUST be encrypted client-side.
- Zero breaking changes to existing local-first note-taking features.
- Full responsive fidelity across mobile (<768px), tablet (768px-1023px), and desktop (>=1024px).
- Release APK must be fully self-contained for offline use.
