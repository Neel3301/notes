# Requirements: Edsy Advanced Notes (Milestone v2.0.0)

## Milestone v2.0.0 Requirements

### Desktop Dashboard Layout & Web Revamp
- [x] **DSH-01**: Desktop/laptop view renders a full-width responsive dashboard with collapsible Left Sidebar (`AppHeader`, Navigation, Notebooks, Tags, Settings/Account).
- [x] **DSH-02**: Multi-pane workspace allows browsing notes list/timeline and active note editor side-by-side on desktop without modal jumping.
- [x] **DSH-03**: Mobile viewports (<768px) and Android APK preserve the exact mobile design reference layout (`PhoneShell` styling, bottom `DatePager`, slide-up menu).
- [x] **DSH-04**: Desktop dashboard strictly preserves Edsy dark aesthetic tokens (`#000000`, `#E5E7DA`, Inter Tight, `#6F91B6`, `#DCE3EB`, `#CABC3F`).

### Supabase Integration & E2EE Cloud Sync
- [x] **SYNC-01**: Local-first note-taking is 100% functional without an account or network connection.
- [x] **SYNC-02**: Optional Supabase authentication (email/password sign-up, sign-in, session persistence) to enable cloud features.
- [x] **SYNC-03**: End-to-end encryption (E2EE) using Web Crypto (AES-256-GCM + PBKDF2) ensures note titles, bodies, blocks, sketches, and audio are encrypted client-side before upload.
- [x] **SYNC-04**: User-controlled cloud sync toggle allows users to opt-in or opt-out, trigger manual "Sync Now", and observe sync status.
- [x] **SYNC-05**: Offline sync queue handles offline edits and merges changes smoothly upon reconnection via timestamp-based conflict resolution.

### Secure Note-Sharing Functionality
- [x] **SHR-01**: Public note sharing generates a shareable web link accessible in any browser without requiring an account or app installation.
- [x] **SHR-02**: Private note sharing encrypts note content with a password-derived key; recipients must enter the correct password to view the decrypted note.
- [x] **SHR-03**: Users can customize the share link name/slug with instant availability validation against existing shared slugs.
- [ ] **SHR-04**: Mobile app provides a "Shared Notes" interface allowing mobile users to open, view, and save/import shared notes into their local library.

### Cross-Platform Parity & Release APK
- [ ] **PRT-04**: Production web bundle with desktop dashboard and Supabase sync is embedded into the React Native Android project and compiled to a new release APK (`apk/edsy-notes.apk`).

---

## Validated Requirements (Milestone v1.0.0)

- [x] **DATA-01**: User notes, folders, tags, canvas sketches, and audio attachments persist in browser local storage / IndexedDB.
- [x] **DATA-02**: App loads with rich pre-seeded sample notes demonstrating all block types, sketches, tags, and bi-directional links.
- [x] **DATA-03**: User can export individual notes as Markdown files or download a full JSON backup.
- [x] **NOTE-01**: Note detail screen adapts `/course-detail` layout with dynamic title, cream action CTA, and segmented tabs.
- [x] **NOTE-02**: User can write and edit Markdown with live rendered formatting.
- [x] **NOTE-03**: User can structure notes with modular blocks (text, interactive checklist items, callout boxes).
- [x] **NOTE-04**: Canvas tab provides freehand doodle/sketching with stroke controls and persists with note.
- [x] **NOTE-05**: Audio memo recorder and player with waveform and progress timer.
- [x] **VIEW-01**: Timeline screen adapts `/study-planning` with horizontal snap card carousel.
- [x] **VIEW-02**: Bottom `DatePager` allows navigating notes by date.
- [x] **VIEW-03**: Notes catalog screen adapts `/course-overview` with search and favorite toggles.
- [x] **VIEW-04**: `SearchPill` provides live full-text search.
- [x] **VIEW-05**: Tag filter pills row for 1-tap categorization.
- [x] **ORG-01**: Full-screen slide-up menu adapts `/menu` with giant `.text-menu` typography.
- [x] **ORG-02**: Notes organized into notebooks/folders and custom tags.
- [x] **ORG-03**: Bi-directional linking `[[Note Title]]` with backlinks references.
- [x] **ORG-04**: Pinning and Trash lifecycle (restore / permanent delete).
- [x] **AI-01**: Built-in AI assistant action drawer.
- [x] **ARCH-01**: Clean semantic note-taking routes, components, and content data structures.
- [x] **MBL-01**: Project restructuring into `web/` and `mobile/` subdirectories.
- [x] **MBL-02**: React Native mobile app implementation with Edsy design system.
- [x] **MBL-03**: Native Android APK compilation via local Android SDK and Gradle.
- [x] **PRT-01**: Relative asset resolution (`base: './'`) and `HashRouter` for offline execution.
- [x] **PRT-02**: Production web bundle embedded in React Native WebView in `mobile/App.js`.
- [x] **PRT-03**: Compiled release APK with 100% UI and functional parity.

---

## Future Requirements (Deferred)

- **V3-01**: Live multi-user collaborative editing via CRDT / WebRTC data channels.
- **V3-02**: Optical Character Recognition (OCR) to extract text from image attachments.
- **V3-03**: Interactive 3D force-directed knowledge graph view of all inter-note backlinks.

---

## Out of Scope

- Unencrypted cloud storage of sensitive note data (strictly forbidden; all cloud sync must be E2EE).
- Mandatory account creation (app must always function locally without an account).
- Vendor lock-in (export to Markdown/JSON must remain functional).

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DSH-01 | Phase 13 | Passed |
| DSH-02 | Phase 13 | Passed |
| DSH-03 | Phase 13 | Passed |
| DSH-04 | Phase 13 | Passed |
| SYNC-01 | Phase 14 | Passed |
| SYNC-02 | Phase 14 | Passed |
| SYNC-03 | Phase 14 | Passed |
| SYNC-04 | Phase 14 | Passed |
| SYNC-05 | Phase 14 | Passed |
| SHR-01 | Phase 15 | Passed |
| SHR-02 | Phase 15 | Passed |
| SHR-03 | Phase 15 | Passed |
| SHR-04 | Phase 16 | Pending |
| PRT-04 | Phase 16 | Pending |
