---
phase: 01-local-data-store-note-schema
plan: 01
type: implementation
prefix: DATA
wave: 1
depends_on: []
files_modified:
  - src/data/seedNotes.js
  - src/data/notesStore.js
  - src/data/verify-store.js
autonomous: true
requirements:
  - DATA-01
  - DATA-02
must_haves:
  artifacts:
    - src/data/seedNotes.js
    - src/data/notesStore.js
    - src/data/verify-store.js
  key_links:
    - from: src/data/notesStore.js
      to: src/data/seedNotes.js
      description: Imports initialSeedNotes for fallback and default initialization
  truths:
    - notesStore initializes with 4 seed notes matching design-reference cards
    - CRUD operations (saveNote, deleteNote, toggleLike) persist to localStorage
    - useNotesStore hook provides reactive state updates across screens
---

<objective>
Implement the client-side offline persistence layer (`notesStore.js`) and pre-seeded note dataset (`seedNotes.js`) for the Edsy Advanced Notes app. This provides the reactive single source of truth for notes, notebooks, tags, modular blocks, and favorite/pin states across all screens while strictly matching the colors (`blue` #6F91B6, `light` #DCE3EB, `yellow` #CABC3F) and typography from `design-reference/`.
</objective>

<context>
- `src/theme.js` & `src/index.css` define the design system color tokens and typography metrics.
- `design-reference/*.jpg` defines the exact card format (author/category at top, multiline title in center, date/time at bottom, liked heart).
- `DATA-01`: User notes, folders, tags, canvas sketches, and audio attachments persist in browser local storage / IndexedDB across page reloads.
- `DATA-02`: App loads with rich pre-seeded sample notes demonstrating all block types, sketches, tags, and bi-directional links.
</context>

<tasks>

<task>
<name>Create Seed Notes Dataset (src/data/seedNotes.js)</name>
<files>src/data/seedNotes.js</files>
<action>
Create `src/data/seedNotes.js` exporting `initialSeedNotes` containing 4 rich, pre-configured notes that directly match the reference visual cards:
1. `note-1`:
   - Title: "Intro to\nFrontend Development"
   - Author / Notebook: "Alexander Spatari"
   - Color: "blue" (maps to `#6F91B6`)
   - Liked: true, Pinned: true
   - Date: "Mon. 12", Time: "10:00 am – 11:30 am"
   - Tags: ["Frontend", "Design"]
   - Content: Multi-paragraph markdown exploring UI architectures and components.
   - Blocks:
     - Text block: Intro to component-driven design systems.
     - Checklist block: "Design atomic components", "Setup theme CSS variables", "Review accessibility contrast".
     - Callout block: "Key takeaway: Always design mobile-first inside the 390px shell."
2. `note-2`:
   - Title: "Digital\nIllustration: Vector Art"
   - Author / Notebook: "Studio Koto"
   - Color: "light" (maps to `#DCE3EB`)
   - Liked: false, Pinned: false
   - Date: "Mon. 12", Time: "01:00 pm – 02:30 pm"
   - Tags: ["Art", "Vector"]
   - Content: Vector illustration principles and bezier curves.
3. `note-3`:
   - Title: "Color Theory &\nVisual Hierarchy"
   - Author / Notebook: "Design Milk"
   - Color: "yellow" (maps to `#CABC3F`)
   - Liked: true, Pinned: false
   - Date: "Tue. 13", Time: "03:45 pm – 05:00 pm"
   - Tags: ["Design", "Color"]
   - Content: High contrast dark interfaces and accent hues. Includes backlink `[[Intro to Frontend Development]]`.
4. `note-4`:
   - Title: "Design Systems &\nToken Architecture"
   - Author / Notebook: "Figma Community"
   - Color: "blue" (maps to `#6F91B6`)
   - Liked: false, Pinned: false
   - Date: "Wed. 14", Time: "09:00 am – 10:15 am"
   - Tags: ["Tokens", "Architecture"]
   - Content: Token hierarchies from primitive to semantic.
</action>
<verify>
Verify `src/data/seedNotes.js` exports an array of 4 notes with all required schema fields (`id`, `title`, `author`, `color`, `tags`, `liked`, `date`).
</verify>
<done>
`initialSeedNotes` is exported and ready to populate `notesStore.js`.
</done>
</task>

<task>
<name>Implement Reactive Offline Storage Engine (src/data/notesStore.js)</name>
<files>src/data/notesStore.js</files>
<action>
Create `src/data/notesStore.js` providing:
1. `localStorage` reading and writing with key `'edsy_notes_store_v1'`. If key is missing or invalid, initialize with `initialSeedNotes`.
2. Safe fallback for non-browser or SSR/Node environments (in-memory storage).
3. Subscription emitter pattern for reactive updates.
4. Core CRUD methods:
   - `getNotes()`: returns array of notes.
   - `getNoteById(id)`: returns single note.
   - `saveNote(noteData)`: creates or updates note, setting `updatedAt`, notifies subscribers.
   - `deleteNote(id, permanent)`: moves to trash (`trashed: true`) or removes permanently.
   - `restoreNote(id)`: restores from trash (`trashed: false`).
   - `toggleLike(id)`: toggles `liked` boolean.
   - `togglePin(id)`: toggles `pinned` boolean.
   - `filterNotes({ query, tag, notebook, date, liked, trashed })`: returns filtered array.
   - `exportAsMarkdown(id)`: generates markdown string.
   - `exportAllAsJson()`: returns complete JSON string.
   - `importFromJson(jsonStr)`: parses and loads notes.
   - `resetToSeed()`: resets storage to initial seed notes.
5. React hook `useNotesStore()`:
   - Uses `useSyncExternalStore` (or `useState` + `useEffect` listener) to return reactive `{ notes, getNote, saveNote, deleteNote, restoreNote, toggleLike, togglePin, resetToSeed }`.
</action>
<verify>
Verify all CRUD functions and subscriber listeners operate synchronously and trigger notifications on mutation.
</verify>
<done>
`notesStore.js` is implemented and exports `notesStore` singleton and `useNotesStore` hook.
</done>
</task>

<task>
<name>Automated Store Verification Script (src/data/verify-store.js)</name>
<files>src/data/verify-store.js</files>
<action>
Create a standalone Node-compatible test script `src/data/verify-store.js` that:
1. Mocks a minimal `localStorage` if running outside the browser.
2. Initializes the store and asserts initial seed count equals 4.
3. Tests adding a new note and retrieving it by ID.
4. Tests updating note content and verifying changes.
5. Tests toggling `liked` and `pinned`.
6. Tests soft deletion to trash and restoration.
7. Tests JSON export and validation.
8. Exits with code 0 on all assertions passing, or code 1 with error details.
</action>
<verify>
Run `node src/data/verify-store.js` and ensure it exits with code 0 and all tests pass.
</verify>
<done>
Automated verification script confirms 100% store functionality and persistence integrity.
</done>
</task>

</tasks>

<verification>
Execute the automated test runner:
```bash
node src/data/verify-store.js
```
Acceptance criteria:
- All 8 store operations pass assertions.
- Zero uncaught exceptions.
</verification>

<threat_model>
- **Storage Quota Exhaustion**: Guard against `localStorage.setItem` quota errors by wrapping writes in `try/catch` and logging a warning.
- **Data Tampering / Corrupt JSON**: Guard against corrupt JSON in `localStorage` by validating payload shape and falling back safely to seed data without crashing the app.
- **XSS via Markdown**: Note content is user-controlled; markdown rendering in Phase 4 will use sanitized React components.
</threat_model>
