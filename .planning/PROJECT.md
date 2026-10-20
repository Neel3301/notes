# Edsy Advanced Notes: Cross-Platform Web & Mobile App

## What This Is

An advanced, cross-platform note-taking platform combining a desktop-optimized responsive dashboard and a native-parity Android mobile app, utilizing the high-contrast minimalist design system from the Edsy UI kit. It features rich Markdown editing, Notion-style modular blocks, canvas sketches, audio notes, bi-directional linking, client-side zero-knowledge end-to-end encryption (E2EE), optional Supabase cloud sync, and secure public/private note sharing.

## Core Value

Deliver an aesthetically stunning, friction-free note-taking experience with uncompromised user privacy. Provide local-first operation without mandatory accounts, client-side end-to-end encrypted cloud sync when desired, flexible note sharing via links, and a full-width desktop dashboard alongside an Android mobile APK.

## Current Milestone: v2.0.0 Supabase E2EE Cloud Sync, Secure Sharing, and Desktop Dashboard

**Goal:** Transform the application into a complete, cross-platform note-taking ecosystem by introducing a responsive desktop dashboard layout, optional Supabase authentication, client-side zero-knowledge E2EE cloud sync, secure public and password-protected note sharing, and mobile shared note access.

**Target Features:**
1. **Responsive Web Application Dashboard:** Full-width layout on desktop/laptop screens with collapsible sidebar and multi-pane note workspace, while preserving 100% mobile UI parity on screens <768px and Android APK.
2. **Supabase Integration & E2EE Cloud Sync:** Optional authentication (email/password), optional user-controlled cloud sync toggle, zero-knowledge client-side AES-256-GCM encryption before upload, and offline sync queue.
3. **Secure Note Sharing:** Public sharing with random or custom slugs, password-protected private sharing with client-side derived key decryption, and standalone web reader.
4. **Mobile Shared Notes Access:** Open, view, and import shared notes in the mobile application.

---

## Requirements

### Validated (Milestone v1.0.0)

- [x] Local offline-first persistence (IndexedDB / LocalStorage) with pre-seeded sample data.
- [x] Timeline & Daily Notes carousel (`/` & `/study-planning`) with `DatePager`.
- [x] All Notes catalog and live search (`/notes`) with tags and favorites.
- [x] Multi-modal note editor with Markdown rendering, checklist blocks, callouts (`/notes/:id`).
- [x] Freehand canvas sketchpad and audio recording memo player.
- [x] Slide-up navigation menu (`/menu`), notebooks, tags, and trash.
- [x] Bi-directional linking `[[Note Title]]` and markdown/JSON export.
- [x] AI Assistant action drawer.
- [x] Semantic route alignment (`TimelineScreen`, `NotesCatalogScreen`, `NoteEditorScreen`).
- [x] React Native Expo mobile app and compiled Android APK (`apk/edsy-notes.apk`).
- [x] 100% UI and functional parity between Web and Android APK via embedded WebView.

### Active (Milestone v2.0.0)

- [ ] **DSH-01**: Responsive Desktop Dashboard Layout - Desktop/laptop view renders full-width layout with collapsible Left Sidebar and responsive multi-pane interface.
- [ ] **DSH-02**: Multi-Pane Note Workspace - On desktop, users can view note lists, search, tags, and active note editor side-by-side without modal jumping.
- [ ] **DSH-03**: Mobile Layout Preservation - Viewport <768px (and inside the mobile APK) retains the exact mobile design reference layout (`AppHeader`, horizontal carousel, bottom `DatePager`, slide-up menu).
- [ ] **DSH-04**: Edsy Aesthetic Continuity - Desktop dashboard preserves the dark minimalist theme (`#000000`, `#E5E7DA`, Inter Tight, card accents `#6F91B6`, `#DCE3EB`, `#CABC3F`).
- [ ] **SYNC-01**: Optional Local-First Note-Taking - All note-taking features function completely offline without requiring account creation.
- [ ] **SYNC-02**: Optional Supabase Authentication - Users can optionally create an account and sign in via Supabase Auth (email/password) to unlock cloud capabilities.
- [ ] **SYNC-03**: End-to-End Encryption (E2EE) - Note content, blocks, sketches, and audio are encrypted client-side using AES-256-GCM before uploading to Supabase; zero-knowledge encryption ensures server never sees plaintext.
- [ ] **SYNC-04**: User-Controlled Cloud Sync - Signed-in users can opt-in or opt-out of cloud synchronization with a toggle switch, manual "Sync Now" action, and clear sync status indicators.
- [ ] **SYNC-05**: Conflict Resolution & Offline Queue - Offline changes are queued and synced upon reconnection with timestamp-based conflict resolution.
- [ ] **SHR-01**: Public Note Sharing - Users can generate a public share link (random slug or custom slug if available); recipients can view the formatted note in any browser without an account.
- [ ] **SHR-02**: Private Note Sharing - Users can password-protect shared notes; note is encrypted with a password-derived key and recipients must enter the correct password to decrypt and view it.
- [ ] **SHR-03**: Custom Slug Support - Users can provide a custom slug/name for share links, with real-time availability check against existing shared notes.
- [ ] **SHR-04**: Mobile Shared Notes Access - Mobile users can open, view, and import shared notes into their local offline library from share links or slugs.
- [ ] **PRT-04**: Android APK Parity Rebuild - Updated web bundle is embedded into React Native Android project and compiled to a new release APK (`apk/edsy-notes.apk`) with 100% parity.

### Out of Scope

- Multi-user real-time collaborative concurrent typing (operational transform / CRDT live cursor).
- Storing unencrypted note plaintexts on cloud servers (all cloud sync must be strictly zero-knowledge encrypted).
- Mandatory paywalls or mandatory cloud accounts for basic note-taking.

---

## Context

- Workspace contains both `web/` (canonical React app) and `mobile/` (React Native Expo host with offline WebView embedding the production web bundle).
- Production web bundle is copied into `mobile/android/app/src/main/assets/web/` so mobile users run 100% offline with zero remote server lag.
- Web app was previously constrained to 390px via `PhoneShell.jsx`. Milestone v2.0.0 redesigns this into a responsive dashboard that expands on desktop while retaining mobile presentation on smaller viewports.

## Constraints

- **Zero Plaintext Cloud Leakage**: Note titles, contents, blocks, sketches, and audio MUST be encrypted client-side using Web Crypto before hitting Supabase.
- **Offline-First Guarantee**: Must function completely without an account and without internet access.
- **Visual Fidelity**: Strictly follow Edsy design system (pure black `#000000`, card colors `#6F91B6`, `#DCE3EB`, `#CABC3F`, cream CTA `#E5E7DA`, Inter Tight).
- **Dual-Surface Compatibility**: `web/` must build with relative paths (`base: './'`) and `HashRouter` to run both on web domains and inside Android APK WebView.

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-20 for Milestone v2.0.0*
