# Phase 1: Local Data Store & Note Schema - Context

**Gathered:** 2026-10-20
**Status:** Ready for planning
**Phase:** 01-local-data-store-note-schema

<domain>
## Phase Boundary

Build the client-side, offline-first data layer and note storage engine. This provides the single source of truth for notes, notebooks, tags, attachments (canvas drawings, audio clips), and bi-directional links across the entire app. It will power the Timeline (`study-planning`), Catalog (`course-overview`), Editor (`course-detail`), and Navigation Menu (`menu`).
</domain>

<decisions>
## Implementation Decisions

### 1. Storage Engine
- **Engine**: Browser `localStorage` with JSON serialization + schema versioning and optional fallback/extension for larger binary blobs (sketches/audio).
- **Reactive State Hook**: Provide `useNotesStore()` hook using React 19 `useSyncExternalStore` or standard reactive event emitter pattern so any write immediately and seamlessly re-renders all mounted views without page reloads.

### 2. Note Model Schema
- Every note record MUST support:
  - `id`: unique string (e.g., `note-1`, `note-2`)
  - `title`: string (supports multi-line formatting as shown in reference cards)
  - `author` / `notebook`: string (e.g., "Design Systems", "Product Strategy", "Engineering", "Personal")
  - `content`: string (raw markdown text)
  - `color`: card visual palette token (`'blue'` | `'light'` | `'yellow'`) mapped to `#6F91B6`, `#DCE3EB`, `#CABC3F`
  - `tags`: array of string tags (e.g., `['UX', 'Design']`, `['Architecture']`, `['Meeting']`)
  - `date`: ISO string or formatted date (e.g., `"Mon. 12"`, `"2026-10-12"`)
  - `time`: display time string matching reference cards (e.g., `"10:00 am – 11:30 am"`, `"02:15 pm"`)
  - `liked`: boolean (toggled by the heart icon)
  - `pinned`: boolean (for quick access at top of lists)
  - `archived`: boolean
  - `trashed`: boolean (soft delete support)
  - `blocks`: array of structured blocks:
    - `{ id, type: 'text' | 'checklist' | 'callout' | 'sketch' | 'audio', data: ... }`
  - `sketchData`: base64 / SVG data string for doodle canvas
  - `audioData`: duration + audio metadata
  - `backlinks`: derived or computed array of linked note IDs

### 3. Pre-Seeded Sample Notes
- Pre-seed with rich, realistic notes matching the sample content from the Edsy UI kit:
  1. **Intro to Design Systems** (Color: `blue` / `#6F91B6`, Author: `Alexander Spatari`, Time: `10:00 am – 11:30 am`, Liked: `true`, Tags: `['Design', 'System']`)
  2. **Product Strategy & User Journey** (Color: `light` / `#DCE3EB`, Author: `Studio Koto`, Time: `01:00 pm – 02:30 pm`, Liked: `false`, Tags: `['Strategy', 'UX']`)
  3. **Creative Direction & Branding** (Color: `yellow` / `#CABC3F`, Author: `Design Milk`, Time: `03:45 pm – 05:00 pm`, Liked: `true`, Tags: `['Branding', 'Art']`)
  4. **Architecture & State Management** (Color: `blue` / `#6F91B6`, Author: `Dan Abramov`, Time: `Yesterday`, Liked: `false`, Tags: `['Tech', 'React']`)
- Include markdown blocks, interactive checklists ("Design icon set", "Verify contrast ratio"), and cross-references (`[[Creative Direction & Branding]]`).

### 4. Zero External Backend
- 100% self-contained in frontend code. No external servers or API keys required.
</decisions>

<canonical_refs>
## Canonical References
- `src/theme.js` — Color tokens and theme definitions
- `src/index.css` — Design system CSS variables and typography classes
- `src/data/content.js` — Existing mock data structures
- `design-reference/all.webp` — Overview of visual cards and components
</canonical_refs>
