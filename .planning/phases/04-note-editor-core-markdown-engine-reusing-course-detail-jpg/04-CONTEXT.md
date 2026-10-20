# Phase 4: Note Editor Core & Markdown Engine - Context

**Gathered:** 2026-10-20
**Status:** Ready for planning
**Phase:** 04-note-editor-core-markdown-engine-reusing-course-detail-jpg

<domain>
## Phase Boundary

Transform `CourseDetailScreen` into the primary Note Detail & Editor Screen, strictly adhering to `design-reference/course-detail.jpg`.
Provide segmented tabs ("Write", "Preview", "Canvas"), signature cream CTA button (`#E5E7DA`), editable note title and markdown body, auto-save to `notesStore`, and rich markdown rendering.
</domain>

<decisions>
## Implementation Decisions

### 1. Visual Design Fidelity
- Strictly follow `design-reference/course-detail.jpg`:
  - `AppHeader`: Back chevron icon on left (`onBackClick` -> `navigate(-1)`), notebook name badge on right.
  - Hero Title: `Heading` component displaying note title with multi-line wrap support.
  - Signature Cream CTA: `Button variant="cream"` (`bg-[#E5E7DA] text-[#111111] px-6 py-3 rounded-button font-medium`).
    - When on "Write" tab: Label "Done" (persists note and switches to "Preview").
    - When on "Preview" tab: Label "Edit note" (switches to "Write").
  - Segmented Text Tabs: `Tabs` component with "Write", "Preview", "Canvas".
    - Active tab: `font-medium text-text-primary`.
    - Inactive tabs: `text-text-secondary hover:text-text-primary`.
    - Underline divider: `border-b border-divider pb-3`.

### 2. Markdown Parsing & Rendering
- Provide a clean, lightweight, dependency-free Markdown renderer in dark mode typography:
  - `# ` Heading 1: `text-title font-light tracking-tight mt-4 mb-2`
  - `## ` Heading 2: `text-body font-medium text-text-primary mt-3 mb-1`
  - `**bold**`, `*italic*`
  - Code blocks: `` `code` `` and ` ```code``` ` with subtle dark pill background and monospaced font
  - Bulleted lists (`- ` or `* `) and numbered lists (`1. `)
  - Blockquotes (`> `) with slate blue left border (`border-l-2 border-card-blue pl-3 py-1 text-text-secondary`)
  - Backlinks `[[Note Title]]` styled as subtle cream pills jumping to the referenced note.

### 3. Store Integration & Auto-Save
- Load note by ID from `location.state?.noteId` or URL params or fallback to the most recent note in `notesStore`.
- Debounced/immediate auto-save on change into `notesStore.saveNote()`.
</decisions>

<canonical_refs>
## Canonical References
- `design-reference/course-detail.jpg` — Exact visual reference for detail and editor
- `src/screens/CourseDetailScreen.jsx` — Existing component structure
- `src/components/ui/Button.jsx` — Cream CTA button
- `src/components/ui/Tabs.jsx` — Segmented text tab switcher
- `src/data/notesStore.js` — Reactive store API
</canonical_refs>
