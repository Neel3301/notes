# Phase 2: Timeline & Daily Notes Screen - Context

**Gathered:** 2026-10-20
**Status:** Ready for planning
**Phase:** 02-timeline-daily-notes-screen-reusing-study-planning-jpg

<domain>
## Phase Boundary

Connect and enhance the primary Timeline & Daily Notes home view (`/` and `/study-planning`), strictly adhering to `design-reference/study-planning.jpg`.
Replace static data with reactive notes from `notesStore`, wire the interactive date pager and filter pills, and support instant favoriting, date navigation, and note opening.
</domain>

<decisions>
## Implementation Decisions

### 1. Visual Design Fidelity
- Strictly follow `design-reference/study-planning.jpg`:
  - `AppHeader`: Hamburger on left (`onMenuClick` -> `/menu`), `.edsy` brandmark on right.
  - Hero Heading: `Heading` component with `Daily\nNotes` (or `Study\nPlanning`) using `.text-display` (46px font-light).
  - Action / Filter Bar:
    - Outlined `Pill` with label and `ChevronDown` (options: "This week", "Today", "All notes").
    - Outlined circular `IconButton` with `Calendar` icon.
    - Plain `IconButton` with `MoreVertical` icon for quick options (e.g. "+ New Note").
  - Horizontal Card Carousel:
    - `-mx-5 px-5 flex items-center gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2`
    - Preserves card dimensions (`w-[236px] h-[320px] rounded-card p-5`), color tokens (`blue` #6F91B6, `light` #DCE3EB, `yellow` #CABC3F), author, multi-line title, time, and heart icon.
  - Bottom `DatePager`:
    - Shows active day (e.g. `Mon. 12`) and next day (e.g. `Tue. 13`) with arrow button.
    - Advancing days updates active date filter and animates carousel notes.

### 2. State & Store Integration
- Integrate with `useNotesStore()`:
  - Cards dynamically loaded from `notesStore.getNotes()`.
  - Tapping heart icon on any card calls `notesStore.toggleLike(card.id)` with immediate feedback.
  - Filter pill options filter the active card list:
    - "This week": shows all active weekday notes.
    - "Today": shows notes for the selected date pager date.
    - "All notes": shows all non-trashed notes.
  - If a day has no notes, display an empty state matching the design aesthetic with a "+ Create note" cream CTA button.
  - Tapping any note card navigates to `/course-detail` with `{ state: { note: card, noteId: card.id } }`.

### 3. Route Configuration (`App.jsx`)
- Mount the dynamic `StudyPlanningScreen` at `/` and `/study-planning`.
</decisions>

<canonical_refs>
## Canonical References
- `design-reference/study-planning.jpg` — Exact visual reference for the timeline view
- `src/screens/StudyPlanningScreen.jsx` — Existing component structure
- `src/components/course/CourseCard.jsx` — Visual card component
- `src/components/ui/DatePager.jsx` — Bottom date pager strip
- `src/data/notesStore.js` — Reactive store API
</canonical_refs>
