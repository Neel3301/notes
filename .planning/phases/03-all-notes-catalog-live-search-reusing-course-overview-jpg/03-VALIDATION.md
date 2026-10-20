# Phase 3: All Notes Catalog & Live Search - Validation Strategy

**Phase:** 03-all-notes-catalog-live-search-reusing-course-overview-jpg
**Date:** 2026-10-20
**Status:** Defined

---

## Validation Overview

| Validation Dimension | Method | Criteria |
|----------------------|--------|----------|
| **1. Full-Text Search** | Automated / Smoke | `SearchPill` filters notes across title, author, content, and tags in real time. |
| **2. Tag Filter Strip** | Component test | Selecting a tag pill filters cards by tag; selecting "Favorites" filters by `liked === true`. |
| **3. Vertical Card Stack** | Visual / Layout | Note cards render full-width stacked vertically with 20px gap (`gap-5`) and alternating colors. |
| **4. Favorite Toggling** | Store check | Tapping the heart icon on any card toggles its liked state in `notesStore` without triggering navigation. |
| **5. Empty Search State** | Component check | Zero-results search shows clear message and button to clear search or create note. |

---

## Verification Command

```bash
node src/data/verify-catalog.js
```
