# Phase 3: All Notes Catalog & Live Search - Context

**Gathered:** 2026-10-20
**Status:** Ready for planning
**Phase:** 03-all-notes-catalog-live-search-reusing-course-overview-jpg

<domain>
## Phase Boundary

Transform `CourseOverviewScreen` into the primary All Notes Catalog & Live Search screen, strictly adhering to `design-reference/course-overview.jpg`. Connect it reactively to `useNotesStore()`, enhance `SearchPill` with multi-field search (title, content, tags, author), introduce a horizontal tag filter pill strip, and support instant favoriting and note opening.
</domain>

<decisions>
## Implementation Decisions

### 1. Visual Design Fidelity
- Strictly follow `design-reference/course-overview.jpg`:
  - `AppHeader`: Left hamburger menu icon, right `.edsy` brandmark.
  - Hero Heading: `Heading` component with "All\nNotes" in `text-display` (46px font-light).
  - Search & Action Bar:
    - Full-width `SearchPill` with search icon, clear button, rounded-pill border.
    - Plain `IconButton` with `MoreVertical` for quick actions ("+ New note", "Show favorites").
  - Category / Tag Filter Strip:
    - Horizontal scrollable pill row below search (e.g. "All", "Design", "Frontend", "Art", "Tokens", "Favorites").
    - Active tag pill highlighted in cream (`bg-cream-bg text-cream-text`), inactive pills in outlined subtle border.
  - Vertical Card Stack:
    - Stacked cards with `gap-5`, `w-full h-[320px] rounded-card p-5`.
    - Curated card color palette: `blue` (#6F91B6), `light` (#DCE3EB), `yellow` (#CABC3F).
    - Top: Author/Notebook and favorite heart toggle (`Heart` icon).
    - Center: Multi-line title (`text-title font-light`).
    - Bottom: Date, time, and tag pills.

### 2. Live Store Integration
- Consume `useNotesStore()` for live notes data.
- Favorite toggle updates `notesStore.toggleLike(id)` without navigating to the note.
- Live full-text search across title, content, tags, and author.
- Tag pill filtering works in unison with search queries.
- Empty state provides 1-tap "Clear search" and "+ Create new note".
</decisions>

<canonical_refs>
## Canonical References
- `design-reference/course-overview.jpg` — Exact visual reference for catalog and search
- `src/screens/CourseOverviewScreen.jsx` — Existing component structure
- `src/components/ui/SearchPill.jsx` — Search pill component
- `src/components/course/CourseCard.jsx` — Full-width card component
- `src/data/notesStore.js` — Reactive store API
</canonical_refs>
