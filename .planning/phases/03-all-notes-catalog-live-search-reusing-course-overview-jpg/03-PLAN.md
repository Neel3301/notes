---
phase: 03-all-notes-catalog-live-search-reusing-course-overview-jpg
plan: 01
type: implementation
prefix: VIEW
wave: 1
depends_on: []
files_modified:
  - src/screens/CourseOverviewScreen.jsx
  - src/App.jsx
  - src/data/verify-catalog.js
autonomous: true
requirements:
  - VIEW-03
  - VIEW-04
  - VIEW-05
must_haves:
  artifacts:
    - src/screens/CourseOverviewScreen.jsx
    - src/data/verify-catalog.js
  key_links:
    - from: src/screens/CourseOverviewScreen.jsx
      to: src/data/notesStore.js
      description: Consumes useNotesStore to render live notes catalog and handle like/search/filter
    - from: src/App.jsx
      to: src/screens/CourseOverviewScreen.jsx
      description: Mounts CourseOverviewScreen at /course-overview and /notes
  truths:
    - SearchPill filters notes by title, author, content, and tags
    - Tag pill filter strip filters notes by tag and favorites
    - Cards render full-width stacked vertically matching course-overview.jpg
---

<objective>
Transform `CourseOverviewScreen` into the primary All Notes Catalog & Live Search screen, strictly matching `design-reference/course-overview.jpg`. Connect it reactively to `useNotesStore()`, enhance `SearchPill` with multi-field search, introduce a horizontal tag filter pill strip, and support instant favoriting and note opening.
</objective>

<context>
- `design-reference/course-overview.jpg` specifies the exact visual contract: pure black screen, 46px hero heading, `SearchPill` with clear action, more options button, and vertical full-width stacked cards.
- `src/screens/CourseOverviewScreen.jsx` currently displays static dummy props.
- `src/data/notesStore.js` provides `useNotesStore()` with reactive CRUD, `toggleLike()`, and `filterNotes()`.
- `VIEW-03`: All Notes catalog screen adapts `/course-overview` with stacked note cards, timestamps, and favorite heart toggles.
- `VIEW-04`: `SearchPill` provides instant live search filtering notes by title, tag, or content.
- `VIEW-05`: Outlined filter pills row allows 1-tap filtering by tag or category.
</context>

<tasks>

<task>
<name>Update CourseOverviewScreen with Reactive Store, Tag Filter Strip, and Live Search (src/screens/CourseOverviewScreen.jsx)</name>
<files>src/screens/CourseOverviewScreen.jsx</files>
<action>
Enhance `src/screens/CourseOverviewScreen.jsx`:
1. Import `useNotesStore` from `../data/notesStore`.
2. Support receiving `cards` from props or falling back dynamically to `store.notes`.
3. Add a horizontal scrollable tag filter strip below the search bar:
   - Tags: `['All', 'Favorites', 'Design', 'Frontend', 'Art', 'Tokens']`.
   - Active tag pill highlighted in cream (`bg-cream-bg text-cream-text font-medium`), inactive in outlined border.
4. Enhance `SearchPill` with instant multi-field search matching note titles, content, authors, and tags.
5. Add quick action menu on the `MoreVertical` button ("+ New Note", "Show Favorites", "Sort by Date").
6. Pass `onLikeToggle={(e) => { e.stopPropagation(); store.toggleLike(card.id); }}` to each `CourseCard`.
7. Render cards in `fullWidth={true}` with stacked 20px gap (`gap-5`), alternating colors (`blue`, `light`, `yellow`), and responsive touch handlers.
8. Empty search state:
   - "No notes matching '{query}'"
   - Button: "Clear search" and "+ Create note" to instantly draft a note with that title.
</action>
<verify>
Check that `CourseOverviewScreen.jsx` compiles cleanly, renders the full-width card stack, and responds to search typing and tag clicks.
</verify>
<done>
`CourseOverviewScreen` renders all notes with live search, tag filters, and favorite toggles.
</done>
</task>

<task>
<name>Connect Routes in App.jsx (src/App.jsx)</name>
<files>src/App.jsx</files>
<action>
Update `src/App.jsx`:
1. In `AppRoutes`, ensure `/course-overview` and alias `/notes` pass navigation handlers:
   - `onCardClick={(card) => navigate('/course-detail', { state: { note: card, noteId: card.id } })}`
   - `onMenuClick={() => navigate('/menu')}`
2. Maintain backward compatibility with existing links.
</action>
<verify>
Run `npm run build` to verify routes resolve without type or compilation errors.
</verify>
<done>
Routing connects catalog screen to note detail and navigation drawer.
</done>
</task>

<task>
<name>Automated Catalog Verification Script (src/data/verify-catalog.js)</name>
<files>src/data/verify-catalog.js</files>
<action>
Create `src/data/verify-catalog.js` to test:
1. Multi-field search matching titles, content, author, and tags.
2. Tag pill filtering ('Design', 'Art', 'Tokens').
3. 'Favorites' filter returning only `liked === true` notes.
4. Favorite toggling updating live store state.
5. Exit with code 0 on all assertions passing.
</action>
<verify>
Run `node src/data/verify-catalog.js` and verify it exits with code 0.
</verify>
<done>
Verification script confirms catalog search and tag filter logic.
</done>
</task>

</tasks>

<verification>
Execute the automated test runner:
```bash
node src/data/verify-catalog.js
```
Acceptance criteria:
- All catalog search, tag filter, and favorite toggle assertions pass.
- `npm run build` builds without errors.
</verification>

<threat_model>
- **Special Regex Characters in Search**: Sanitize search query with `String.prototype.includes` instead of raw `RegExp` to avoid regex injection crashes on symbols like `[` or `*`.
- **Large Dataset Rendering**: Clean mapping with React unique keys on `card.id` prevents DOM re-mounting thrash.
</threat_model>
