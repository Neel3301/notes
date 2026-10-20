---
phase: 04-note-editor-core-markdown-engine-reusing-course-detail-jpg
plan: 01
type: implementation
prefix: NOTE
wave: 1
depends_on: []
files_modified:
  - src/components/note/MarkdownRenderer.jsx
  - src/screens/CourseDetailScreen.jsx
  - src/data/verify-editor.js
autonomous: true
requirements:
  - NOTE-01
  - NOTE-02
must_haves:
  artifacts:
    - src/components/note/MarkdownRenderer.jsx
    - src/screens/CourseDetailScreen.jsx
    - src/data/verify-editor.js
  key_links:
    - from: src/screens/CourseDetailScreen.jsx
      to: src/components/note/MarkdownRenderer.jsx
      description: Renders formatted markdown inside Preview tab
    - from: src/screens/CourseDetailScreen.jsx
      to: src/data/notesStore.js
      description: Reads active note and persists edits via saveNote()
  truths:
    - CourseDetailScreen renders back chevron, notebook badge, note title, and cream button (#E5E7DA)
    - Segmented tabs switch between Write, Preview, and Canvas
    - Markdown renders headings, bold, code, lists, and quotes
---

<objective>
Transform `CourseDetailScreen` into the primary Note Detail & Editor view matching `design-reference/course-detail.jpg`. Implement the Markdown rendering engine (`MarkdownRenderer.jsx`), editable title and body with auto-save to `notesStore`, segmented tabs ("Write", "Preview", "Canvas"), and cream CTA button (`#E5E7DA`).
</objective>

<context>
- `design-reference/course-detail.jpg` specifies the visual layout: back header with notebook label, hero heading, signature cream CTA button, segmented tabs, and structured content.
- `src/screens/CourseDetailScreen.jsx` currently displays static lesson accordion.
- `src/data/notesStore.js` provides `useNotesStore()`, `getNoteById()`, and `saveNote()`.
- `NOTE-01`: Note detail screen adapts `/course-detail` layout with dynamic title, cream action CTA (`#E5E7DA`), and segmented tabs ("Write", "Preview", "Canvas").
- `NOTE-02`: User can write and edit Markdown with live rendered formatting (headings, code blocks, lists, quotes).
</context>

<tasks>

<task>
<name>Create Markdown Renderer Component (src/components/note/MarkdownRenderer.jsx)</name>
<files>src/components/note/MarkdownRenderer.jsx</files>
<action>
Create `src/components/note/MarkdownRenderer.jsx` to parse and render markdown text into clean semantic JSX:
1. Headings: `# ` (h1), `## ` (h2), `### ` (h3) with theme typography.
2. Inline formatting: `**bold**`, `*italic*`, `` `code` ``.
3. Code blocks: multi-line fenced code blocks with dark pill background, monospaced font, and subtle border.
4. Lists: unordered bullet lists (`- ` or `* `) and ordered numeric lists (`1. `).
5. Blockquotes: `> ` with left border in slate blue (`#6F91B6`).
6. Backlinks: `[[Note Title]]` rendered as clickable pill badges jumping to the referenced note if onLinkClick is provided.
7. Line break and paragraph spacing handling.
</action>
<verify>
Verify `MarkdownRenderer` can be imported and renders semantic markdown structures without errors.
</verify>
<done>
`MarkdownRenderer.jsx` is implemented and styled with dark theme typography tokens.
</done>
</task>

<task>
<name>Update CourseDetailScreen with Note Editor and Tabs (src/screens/CourseDetailScreen.jsx)</name>
<files>src/screens/CourseDetailScreen.jsx</files>
<action>
Enhance `src/screens/CourseDetailScreen.jsx`:
1. Import `useNotesStore` from `../data/notesStore` and `MarkdownRenderer` from `../components/note/MarkdownRenderer`.
2. Resolve active note from `location.state?.noteId` or fallback to first available note in `notesStore`.
3. Provide editable note title and notebook category.
4. Update tabs to: `['Preview', 'Write', 'Canvas']`:
   - "Preview": renders `MarkdownRenderer` for note content and expandable block sections.
   - "Write": multi-line textarea with auto-resizing, live word counter, and auto-save.
   - "Canvas": sketch pad preview container (placeholder for Phase 6).
5. Update Cream CTA button (`variant="cream"`):
   - In "Preview" tab: Label "Edit note", switches to "Write" tab.
   - In "Write" tab: Label "Done", persists note to `notesStore` and switches to "Preview".
6. Auto-save all changes to `notesStore.saveNote({ id, title, content })`.
7. Retain header back button navigating to previous screen (`onBackClick`).
</action>
<verify>
Check that `CourseDetailScreen.jsx` compiles cleanly, switches tabs, renders markdown preview, and auto-saves edits to `notesStore`.
</verify>
<done>
`CourseDetailScreen` functions as a full-featured note detail editor matching `course-detail.jpg`.
</done>
</task>

<task>
<name>Automated Editor Verification Script (src/data/verify-editor.js)</name>
<files>src/data/verify-editor.js</files>
<action>
Create `src/data/verify-editor.js` to test:
1. Markdown token parsing (headings, bold, lists, quotes, code, backlinks).
2. Live note title update in `notesStore`.
3. Live note body update in `notesStore`.
4. Verification of `notesStore.exportAsMarkdown()`.
5. Exit with code 0 on all assertions passing.
</action>
<verify>
Run `node src/data/verify-editor.js` and verify it exits with code 0.
</verify>
<done>
Verification script confirms editor auto-save and markdown parser integrity.
</done>
</task>

</tasks>

<verification>
Execute the automated test runner:
```bash
node src/data/verify-editor.js
```
Acceptance criteria:
- All markdown parsing and note editing assertions pass.
- `npm run build` builds without errors.
</verification>

<threat_model>
- **XSS via Markdown**: Inline markdown elements are constructed purely with React virtual DOM primitives without using `dangerouslySetInnerHTML`.
- **Accidental State Loss**: Local component state initializes from `notesStore` and syncs on unmount/tab switch so edits are never lost.
</threat_model>
