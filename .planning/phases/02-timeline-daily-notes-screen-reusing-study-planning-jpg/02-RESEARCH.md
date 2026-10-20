# Phase 2: Timeline & Daily Notes Screen - Research

**Phase:** 02-timeline-daily-notes-screen-reusing-study-planning-jpg
**Date:** 2026-10-20
**Status:** Completed

---

## 1. Screen Architecture & Visual Analysis

### Reference Screen: `design-reference/study-planning.jpg`
1. **Header**:
   - Left: 2-line hamburger icon (standard `AppHeader left="menu"`).
   - Right: `.edsy` brandmark.
2. **Hero Heading**:
   - Two lines: `Daily\nNotes` or `Study\nPlanning`.
   - Typography: `.text-display` (46px, font-weight 300, line-height 1.05, letter-spacing -0.035em).
3. **Action Bar**:
   - Left pill: `Pill` component with label (default "This week"), down chevron, border `#333333`, rounded pill (`9999px`).
   - Center-left icon button: `IconButton` with `Calendar` icon in circular 32px outline.
   - Right: Plain `IconButton` with `MoreVertical` icon for quick actions.
4. **Horizontal Scroll-Snap Card Carousel**:
   - Container: `-mx-5 px-5 flex items-center gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2`.
   - Card dimensions: `w-[236px] h-[320px] rounded-card p-5`.
   - With 390px phone container and 20px padding (`px-5`), `390 - 40 = 350px` available. A 236px card leaves `350 - 236 - 16(gap) = 98px` for the second card to peek in from the right edge. This perfectly reproduces the peek offset visible in `study-planning.jpg`!
5. **Bottom Date Navigation Strip**:
   - `DatePager`: Centered pill with left active date (e.g. `Mon. 12`), right dimmed date (e.g. `Tue. 13`), and right circular chevron arrow button.

---

## 2. Store & Interaction Integration

1. **Reactive Data Fetching**:
   - Consume `useNotesStore()`.
   - Filter notes by `trashed: false` and active date/filter pill.
2. **Card Favorite/Like Handling**:
   - `CourseCard` provides `onLikeToggle={(e) => { e.stopPropagation(); toggleLike(card.id); }}`.
   - Updates `liked` state in `notesStore` and triggers re-render via `useSyncExternalStore`.
3. **Date Navigation**:
   - Advancing the date pager updates the active date index.
   - Notes matching `card.date === activeDate.current` or within the selected week range are surfaced.
4. **Card Navigation**:
   - Clicking a card calls `navigate('/course-detail', { state: { note: card, noteId: card.id } })`.

---

## 3. Validation Architecture

1. **Automated Verification**:
   - Test script `src/screens/__tests__/verify-timeline.js` (or Node verification) checking that:
     - `StudyPlanningScreen` renders with notes from `notesStore`.
     - Like toggle updates note in store.
     - Date filtering correctly segments notes by date.
2. **Build & Bundle Verification**:
   - `npm run build` succeeds without syntax or JSX errors.
