# Phase 1: Local Data Store & Note Schema - Research

**Phase:** 01-local-data-store-note-schema
**Date:** 2026-10-20
**Status:** Completed

---

## 1. Technical Analysis: Client-Side Offline Persistence

### Storage Strategy
In a client-side mobile app preview running in the browser, data needs to persist reliably across browser reloads, route transitions, and dev server HMR (Hot Module Replacement) updates.

We evaluate two complementary approaches:
1. **`localStorage` (Primary)**:
   - Synchronous, zero-dependency, universally supported.
   - Ideal for note metadata, titles, markdown text, tags, and block hierarchies.
   - Storage limit is ~5MB-10MB per origin, which easily supports hundreds of notes, checklists, and formatted documents.
   - Simple JSON serialization with schema versioning (`edsy_notes_v1`).
2. **Binary Attachment Storage (Future/Sketches)**:
   - Canvas sketches (data URLs) and audio recordings can be stored either as compressed base64 strings directly in the note document or in IndexedDB if size exceeds quota.
   - For Phase 1 and initial sample data, SVG / compact vector paths or compressed canvas base64 payloads easily fit within `localStorage`.

### State Management & React 19 Reactivity
In React 19, reading from external mutable stores without tearing or unnecessary re-renders is best handled via **`useSyncExternalStore`**:
- `subscribe(listener)`: Register callback when store changes.
- `getSnapshot()`: Returns the current immutable snapshot of notes state.
- `getServerSnapshot()`: Fallback for SSR/initial load.

This guarantees:
- Synchronous UI updates across all components (`CourseCard`, `StudyPlanningScreen`, `CourseOverviewScreen`, `CourseDetailScreen`, `MenuScreen`).
- Zero extra dependencies (no Redux, Zustand, or MobX required; zero runtime weight).

---

## 2. Note Schema Specification

```typescript
interface NoteBlock {
  id: string;
  type: 'text' | 'checklist' | 'callout' | 'sketch' | 'audio';
  content?: string;           // Markdown text or block description
  items?: Array<{             // For checklist blocks
    id: string;
    text: string;
    completed: boolean;
  }>;
  calloutType?: 'info' | 'tip' | 'warning';
  sketchData?: string;        // Canvas data URL or SVG path
  audioDuration?: number;     // Seconds
  audioUrl?: string;          // Blob or simulated audio memo
}

interface Note {
  id: string;
  title: string;              // Multi-line formatted title string
  author: string;             // Author / Notebook category
  notebook: string;           // e.g., "Design Systems", "Product Strategy"
  content: string;            // Primary markdown text
  color: 'blue' | 'light' | 'yellow'; // Design system card color token
  tags: string[];             // e.g., ["UX", "Design"]
  date: string;               // Display date e.g. "Mon. 12"
  time?: string;              // Display time e.g. "10:00 am – 11:30 am"
  liked: boolean;             // Favorite status
  pinned: boolean;            // Pinned to top
  archived: boolean;          // In archive
  trashed: boolean;           // In trash (soft delete)
  blocks: NoteBlock[];        // Notion-style blocks
  createdAt: number;          // Timestamp
  updatedAt: number;          // Timestamp
}
```

---

## 3. Seed Data Specification

The seed data will directly match the visual cards from the reference prototype:
- **Note 1 (Blue Card `#6F91B6`)**:
  - Title: `Intro to\nFrontend Development`
  - Author / Notebook: `Alexander Spatari`
  - Color: `blue`
  - Liked: `true`
  - Date: `Mon. 12`
  - Time: `10:00 am – 11:30 am`
  - Tags: `['Frontend', 'Design']`
  - Blocks: Multi-paragraph markdown overview, 3-item checklist, and reference callout.
- **Note 2 (Light Card `#DCE3EB`)**:
  - Title: `Digital\nIllustration: Vector Art`
  - Author / Notebook: `Studio Koto`
  - Color: `light`
  - Liked: `false`
  - Date: `Mon. 12`
  - Time: `01:00 pm – 02:30 pm`
  - Tags: `['Art', 'Vector']`
- **Note 3 (Yellow Card `#CABC3F`)**:
  - Title: `Color Theory &\nVisual Hierarchy`
  - Author / Notebook: `Design Milk`
  - Color: `yellow`
  - Liked: `true`
  - Date: `Tue. 13`
  - Time: `03:45 pm – 05:00 pm`
  - Tags: `['Design', 'Color']`
- **Note 4 (Blue Card `#6F91B6`)**:
  - Title: `Design Systems &\nToken Architecture`
  - Author / Notebook: `Figma Community`
  - Color: `blue`
  - Liked: `false`
  - Date: `Wed. 14`
  - Time: `09:00 am – 10:15 am`
  - Tags: `['Tokens', 'Architecture']`

---

## 4. API Surface for `notesStore`

```javascript
// Storage operations
getNotes(): Note[]
getNoteById(id: string): Note | undefined
saveNote(note: Partial<Note> & { id?: string }): Note
deleteNote(id: string, permanent?: boolean): void
restoreNote(id: string): void
toggleLike(id: string): boolean
togglePin(id: string): boolean
filterNotes(options: { query?: string, tag?: string, notebook?: string, date?: string, liked?: boolean, trashed?: boolean }): Note[]
exportAsMarkdown(id: string): string
exportAllAsJson(): string
importFromJson(jsonString: string): boolean
resetToSeed(): void

// React hook
useNotesStore(): {
  notes: Note[],
  getNote: (id: string) => Note | undefined,
  saveNote: (note: Partial<Note>) => Note,
  deleteNote: (id: string) => void,
  toggleLike: (id: string) => void,
  togglePin: (id: string) => void,
  resetToSeed: () => void,
}
```

---

## 5. Validation Architecture

To verify Phase 1 implementation without manual UI interaction:
1. **Automated Store Verification**:
   - Create a test script `src/data/__tests__/notesStore.test.js` or run a Node verification script that executes CRUD operations against the store (in-memory or mocked localStorage).
   - Test: Seed initialization, note creation, note update, toggle like, soft-delete to trash, restore, and JSON export/import.
2. **Live Browser Verification**:
   - Verify that `useNotesStore` can be imported and consumed in `App.jsx` or any component without errors.
   - Verify that changes persist across page reloads.
