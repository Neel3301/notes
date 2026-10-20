# Phase 10 Context: Clean Architecture & Semantic Route Alignment

## Background & Need
The initial scaffolding of this project was cloned from a Dribbble exploratory template intended for a courses/study app. Throughout Phases 1–9, the Advanced Notes Mobile App was built by reusing those files to maintain zero visual regression. Now that all 9 feature phases are complete, the filenames and routes still reflect the dummy courses concept:
- `StudyPlanningScreen.jsx` -> should be `TimelineScreen.jsx`
- `CourseOverviewScreen.jsx` -> should be `NotesCatalogScreen.jsx`
- `CourseDetailScreen.jsx` -> should be `NoteEditorScreen.jsx`
- `src/components/course/CourseCard.jsx` -> should be `src/components/note/NoteCard.jsx`
- `/study-planning`, `/course-overview`, `/course-detail` -> should be `/timeline`, `/notes`, `/editor`

---

## Locked Decisions from Discussion

### 1. Screen File Naming
- Rename `src/screens/StudyPlanningScreen.jsx` -> `src/screens/TimelineScreen.jsx`
- Rename `src/screens/CourseOverviewScreen.jsx` -> `src/screens/NotesCatalogScreen.jsx`
- Rename `src/screens/CourseDetailScreen.jsx` -> `src/screens/NoteEditorScreen.jsx`
- Keep `MenuScreen.jsx`, `TokensScreen.jsx`, and `ComponentsScreen.jsx` intact.

### 2. URL Routes & Aliases
- Primary routes:
  - `/` (Home default redirect) -> `/timeline`
  - `/timeline` -> `TimelineScreen`
  - `/notes` -> `NotesCatalogScreen`
  - `/editor` (and `/note/:id`) -> `NoteEditorScreen`
  - `/menu` -> `MenuScreen`
- Backwards-compatible aliases:
  - Keep `/study-planning` redirecting to `/timeline`
  - Keep `/course-overview` redirecting to `/notes`
  - Keep `/course-detail` redirecting to `/editor`

### 3. Component Architecture
- Move `src/components/course/CourseCard.jsx` -> `src/components/note/NoteCard.jsx`
- Completely remove `src/components/course/` directory (including unused `LessonRow.jsx`).
- Update imports across screens and components to use `src/components/note/NoteCard.jsx`.

### 4. Content & Data Cleaning
- In `src/data/content.js`:
  - Rename `studyPlanningData` -> `timelineData`
  - Rename `courseOverviewData` -> `notesCatalogData`
  - Rename `courseDetailData` -> `noteEditorData`
  - Remove unused course demo structures.

### 5. Verification & Tests
- Update test scripts and documentation to reflect the clean names.
- Ensure all 9 test suites pass with 100% green assertions.
