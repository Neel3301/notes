# Phase 2: Timeline & Daily Notes Screen - Validation Strategy

**Phase:** 02-timeline-daily-notes-screen-reusing-study-planning-jpg
**Date:** 2026-10-20
**Status:** Defined

---

## Validation Overview

| Validation Dimension | Method | Criteria |
|----------------------|--------|----------|
| **1. Dynamic Notes Carousel** | Automated / Smoke | Carousel renders active notes from `notesStore` with matching card colors (`blue`, `light`, `yellow`), author, title, and time. |
| **2. Favorite Toggle** | Component interaction | Tapping the heart icon on any card toggles its liked state in `notesStore` without triggering navigation. |
| **3. Date Navigation** | State check | Advancing `DatePager` changes active date and filters carousel cards accordingly. |
| **4. Filter Pill** | State check | Selecting filter pill options ("This week", "Today", "All") filters notes correctly. |
| **5. Card Navigation** | Routing check | Tapping a card triggers navigation callback with note payload. |

---

## Verification Command

```bash
node src/data/verify-timeline.js
```
