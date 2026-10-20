# Roadmap: Edsy Advanced Notes Mobile App

## Overview

Transform the Edsy prototype into a fully functional, offline-first Advanced Notes Mobile App running within a 390px mobile viewport preview. Every screen and component strictly preserves the exact visual design language, colors, typography, and layout rules from `design-reference/`.

## Design Reference Mapping Guarantee

| Screen in `design-reference/` | Notes App Screen & Role | Design Elements Preserved |
|-------------------------------|-------------------------|---------------------------|
| `study-planning.jpg` | **Daily Notes & Timeline** (`/` & `/study-planning`) | `AppHeader` (menu + `.edsy`), Hero heading (`text-display`), filter pill, round calendar icon button, horizontal snap card carousel with colored cards (`#6F91B6`, `#DCE3EB`, `#CABC3F`), and bottom `DatePager` (`Mon. 12` / `Tue. 13` + arrow). |
| `course-overview.jpg` | **All Notes Catalog & Search** (`/notes`) | Hero heading ("All\nNotes"), `SearchPill` input with clear action, more options button, stacked vertical full-width cards with favorite heart toggles and timestamps. |
| `course-detail.jpg` | **Note Editor & Detail View** (`/notes/:id`) | Header with back chevron, note title heading, signature cream CTA button (`#E5E7DA`), border-b text tabs ("Write", "Preview", "Canvas"), expandable numbered blocks (`01`, `02`...) with divider lines. |
| `menu.jpg` | **Navigation Drawer & Smart Views** (`/menu`) | Full-screen slide-up overlay with Framer Motion, close button (`X`), large high-contrast typographic items (`.text-menu`, 38px font-light) with arrow indicators for Notebooks, Tags, Pinned, Trash. |

---

## Phases

### Phase 1: Local Data Store & Note Schema
**Goal**: Establish offline persistence and seed notes so subsequent UI phases have reactive, persistent data.
- Implement `src/data/notesStore.js` with localStorage / IndexedDB persistence.
- Define note schema: `id`, `title`, `content`, `blocks[]`, `color` (`blue` | `light` | `yellow`), `notebook`, `tags[]`, `liked`, `pinned`, `archived`, `trashed`, `date`, `time`, `sketch`, `audio`.
- Pre-seed with sample notes showcasing all block types, sketches, tags, and bi-directional links.
- Create reactive React hook `useNotesStore()` for instant state updates across all screens.
- *Requirements covered: DATA-01, DATA-02*

### Phase 2: Timeline & Daily Notes Screen (reusing `study-planning.jpg`)
**Goal**: Turn `StudyPlanningScreen` into the primary Notes Timeline & Daily Journal view.
- Update `StudyPlanningScreen` / `TimelineScreen` to pull notes dynamically from `useNotesStore()`.
- Display horizontal scroll-snap card carousel of active notes in signature colors (`#6F91B6`, `#DCE3EB`, `#CABC3F`).
- Wire the filter pill dropdown ("Today", "This week", "All").
- Wire bottom `DatePager` to navigate days and filter notes matching the selected date.
- Tapping any card navigates to Note Editor (`/notes/:id`).
- Add "New Note" quick action trigger via the calendar/action button.
- *Requirements covered: VIEW-01, VIEW-02*

### Phase 3: All Notes Catalog & Live Search (reusing `course-overview.jpg`)
**Goal**: Transform `CourseOverviewScreen` into a searchable note catalog.
- Wire `SearchPill` with instant live search across titles, content, and tags.
- Add horizontal tag pill filter strip below search (e.g. "All", "Work", "Ideas", "Design", "Personal").
- Render stacked vertical note cards (`fullWidth`) in alternating theme colors with favorite heart toggles and timestamps.
- Empty search state matching the design reference aesthetic with 1-tap "Clear search".
- *Requirements covered: VIEW-03, VIEW-04, VIEW-05*

### Phase 4: Note Editor Core & Markdown Engine (reusing `course-detail.jpg`)
**Goal**: Implement the core note editor screen matching `course-detail.jpg`.
- Top header with back chevron and notebook badge.
- Editable hero title with `Heading` (`text-display` / `text-title`).
- Signature cream action CTA (`#E5E7DA`, `text-[#111111]`, `rounded-button`, label: "Add block" or "Done").
- Segmented text tabs: "Write", "Preview", "Canvas".
- In "Preview" tab: Markdown renderer supporting bold, italics, code blocks, lists, quotes with theme typography.
- In "Write" tab: Streamlined text editor with auto-save to `notesStore`.
- *Requirements covered: NOTE-01, NOTE-02*

### Phase 5: Modular Block Engine (Notion-style Blocks)
**Goal**: Implement modular, reorderable blocks styled like the expandable lesson rows in `course-detail.jpg`.
- Numbered block rows (`01`, `02`, `03`...) with subtle dividers and expand/collapse accordions.
- Text block with markdown support.
- Checklist block: Interactive task items with custom checkboxes and completed strike-through.
- Callout block: Framed callout box with border and highlight accent.
- Quick toolbar to add, remove, and reorder blocks.
- *Requirements covered: NOTE-03*

### Phase 6: Canvas Freehand Sketch Pad & Audio Memo Player
**Goal**: Support visual sketches and audio notes directly in the note detail view.
- "Canvas" tab in Note Editor:
  - Interactive HTML5 drawing canvas with pen, eraser, brush sizes, and theme color palette swatches.
  - Save and load sketch data URLs directly into the note model.
- Audio Memo block:
  - Audio recording interface with duration timer and record/stop toggle.
  - Audio player pill with waveform visualization, play/pause toggle, and timestamp.
- *Requirements covered: NOTE-04, NOTE-05*

### Phase 7: Slide-up Navigation Menu & Smart Views (reusing `menu.jpg`)
**Goal**: Enhance `MenuScreen` to drive navigation across Notebooks, Tags, Pinned, and Trash.
- Replicate `design-reference/menu.jpg` typography and bottom-anchored layout.
- Menu items: "Timeline", "All Notes", "Notebooks", "Tags", "Pinned", "Trash".
- Slide-up sub-drawers or views for:
  - Notebooks & Tags filtering.
  - Pinned Notes view.
  - Trash screen: view deleted notes, restore note, or permanently purge.
- *Requirements covered: ORG-01, ORG-02, ORG-04*

### Phase 8: Bi-directional Linking (`[[Note Title]]`) & Export
**Goal**: Enable connected thought organization and data portability.
- Parse `[[Note Title]]` syntax in text and blocks to create clickable navigation pills.
- Add "Linked References" (backlinks) section at the bottom of Note Editor showing all notes mentioning the current note.
- Add Note Export action: Download note as `.md` Markdown file.
- Add Full Backup action: Download all notes and notebooks as JSON.
- *Requirements covered: DATA-03, ORG-03*

### Phase 9: AI Assistant Action Sheet
**Goal**: Provide 1-tap intelligent note transformations matching the minimal Edsy UI.
- Accessible via the header "..." more options button.
- Bottom sheet drawer with high-contrast pill actions:
  - "Summarize note"
  - "Extract action items"
  - "Auto-tag note"
  - "Fix spelling & tone"
- Inserts generated results directly as new blocks or tags into the active note.
- *Requirements covered: AI-01*

### Phase 10: Clean Architecture & Semantic Route Alignment
**Goal**: Replace all legacy dummy course-related filenames, routes, and data structures with clean, intuitive note app semantics.
- Screens:
  - `StudyPlanningScreen.jsx` -> `TimelineScreen.jsx`
  - `CourseOverviewScreen.jsx` -> `NotesCatalogScreen.jsx`
  - `CourseDetailScreen.jsx` -> `NoteEditorScreen.jsx`
- Routes:
  - `/` & `/timeline` -> `TimelineScreen`
  - `/notes` -> `NotesCatalogScreen`
  - `/editor` (and `/note/:id`) -> `NoteEditorScreen`
  - Backwards-compatible redirects for `/study-planning`, `/course-overview`, and `/course-detail`.
- Components:
  - Refactor `src/components/course/CourseCard.jsx` -> `src/components/note/NoteCard.jsx`
  - Delete `src/components/course/` directory.
- Data & Content:
  - Refactor `src/data/content.js` to use `timelineData`, `notesCatalogData`, `noteEditorData`.
- *Requirements covered: ARCH-01*

### Phase 11: React Native Mobile App & Android APK Build
**Goal**: Build a native React Native (Expo) Android mobile app in `/mobile` while preserving the existing web app in `/web`, on dedicated branch `react-native-mobile`, and compile a standalone `.apk` for installation on physical Android phones.
- Restructure project: `web/` (preserved web app) and `mobile/` (React Native Expo app).
- Implement React Native mobile UI strictly adhering to the Edsy dark design system:
  - `TimelineScreen.js` with swipeable `NoteCard` carousel and `DatePager`.
  - `NotesCatalogScreen.js` with live search and tag filters.
  - `NoteEditorScreen.js` with markdown editing, modular blocks, and backlink pills.
  - `MenuScreen.js` with slide-up drawers for notebooks, tags, and trash.
- Run `expo prebuild` to generate native `android/` project.
- Compile standalone Android `.apk` via Gradle (`gradlew assembleDebug` / `assembleRelease`).
- Output installable `.apk` file into `apk/` directory.
- *Requirements covered: MBL-01, MBL-02, MBL-03*

---

## Verification & Guardrails

- Every screen MUST render inside the 390px `PhoneShell` container.
- All interactive controls MUST be verified for mouse and touch events.
- Zero visual deviation from `design-reference/*.jpg` (colors `#000000`, `#6F91B6`, `#DCE3EB`, `#CABC3F`, `#E5E7DA`, font metrics, padding `px-5`, `pt-3`, `pb-8`).
