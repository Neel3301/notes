# Phase 3: All Notes Catalog & Live Search - Research

**Phase:** 03-all-notes-catalog-live-search-reusing-course-overview-jpg
**Date:** 2026-10-20
**Status:** Completed

---

## 1. Visual & Layout Specifications

### Reference Screen: `design-reference/course-overview.jpg`
1. **Header**:
   - `AppHeader`: Left hamburger menu icon (`left="menu"`), right `.edsy` brandmark.
2. **Hero Heading**:
   - Two lines: `All\nNotes` (or `Course\nOverview`).
   - Typography: `.text-display` (46px font-light, leading 1.05, tracking -0.035em).
3. **Search & Action Bar**:
   - `SearchPill`: Pill container with search magnifying glass on left, text input, and `X` clear button on right when query is non-empty.
   - Right: Plain circular `IconButton` with `MoreVertical`.
4. **Tag / Category Strip**:
   - Scrollable pill row directly below search:
     - Tags: `['All', 'Favorites', 'Design', 'Frontend', 'Art', 'Tokens']`.
     - Active styling: `bg-cream-bg text-cream-text font-medium`.
     - Inactive styling: `border border-border-subtle text-text-secondary`.
5. **Vertical Note Card Stack**:
   - `flex flex-col gap-5`.
   - `CourseCard fullWidth={true}`: `w-full h-[320px] rounded-card p-5`.
   - Card colors alternate between `blue` (#6F91B6), `light` (#DCE3EB), `yellow` (#CABC3F).
   - Top row: Author/Notebook on left, Heart icon button on right.
   - Center: Multi-line title (`text-title font-light`).
   - Bottom: Timestamp and tag indicators.

---

## 2. Search & Filter Algorithm

```javascript
const filteredNotes = notes.filter((note) => {
  if (note.trashed) return false;

  // Tag filter
  if (activeTag === 'Favorites') {
    if (!note.liked) return false;
  } else if (activeTag !== 'All') {
    if (!note.tags || !note.tags.includes(activeTag)) return false;
  }

  // Search query filter (checks title, author, content, tags)
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    const titleMatch = note.title && note.title.toLowerCase().includes(q);
    const authorMatch = note.author && note.author.toLowerCase().includes(q);
    const contentMatch = note.content && note.content.toLowerCase().includes(q);
    const tagMatch = note.tags && note.tags.some((t) => t.toLowerCase().includes(q));
    if (!titleMatch && !authorMatch && !contentMatch && !tagMatch) {
      return false;
    }
  }

  return true;
});
```

---

## 3. Validation Architecture

1. **Automated Verification**:
   - `src/data/verify-catalog.js` to verify:
     - Full-text search on titles and markdown content.
     - Tag pill filtering.
     - Favorite-only filtering.
     - Live favorite toggling on stacked cards.
2. **Build Verification**:
   - `npm run build` succeeds without errors.
