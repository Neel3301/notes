# Architecture

**Analysis Date:** 2026-10-20

## Pattern Overview

**Overall:** Component-Driven Mobile SPA with Centered Desktop Viewport Shell

**Key Characteristics:**
- **Constrained Frame Model:** All screens render inside a fixed 390px mobile container (`PhoneShell`), centered on a soft grey desktop background (`#DDE3EA`).
- **Token-Driven Styling:** Design tokens (colors, typography, radii, spacing) are defined in CSS custom properties and mirrored in `src/data/content.js`.
- **Decoupled Data Architecture:** Screens do not hardcode copy or mock lists; all data flows from `src/data/content.js`.
- **Declarative Navigation:** Standard React Router v7 DOM routing with modal overlays orchestrated by Framer Motion.

## Layers

**1. Shell & Routing Layer (`src/App.jsx`, `src/components/layout/PhoneShell.jsx`):**
- Purpose: Establishes the mobile device frame, desktop backdrop, router history, and top-level route switches.
- Contains: `BrowserRouter`, `AppRoutes`, `PhoneShell` wrapper.
- Depends on: Screen components, React Router.
- Used by: Browser entry point (`src/main.jsx`).

**2. Screen Views Layer (`src/screens/*.jsx`):**
- Purpose: Composes layout headers, titles, cards, and controls into full screen contexts.
- Contains: `StudyPlanningScreen`, `CourseOverviewScreen`, `CourseDetailScreen`, `MenuScreen`, `TokensScreen`, `ComponentsScreen`.
- Depends on: Layout components, UI primitives, domain course components, mock data.
- Used by: `src/App.jsx`.

**3. Domain Components Layer (`src/components/course/*.jsx`):**
- Purpose: Encapsulates domain-specific educational mobile UI patterns.
- Contains: `CourseCard` (carousel cards with like toggles, color variants), `LessonRow` (collapsible accordion with video thumbnails).
- Depends on: UI primitives (`Pill`, `Button`), Lucide icons.
- Used by: Screens (`StudyPlanningScreen`, `CourseOverviewScreen`, `CourseDetailScreen`).

**4. UI Primitive Components Layer (`src/components/ui/*.jsx`):**
- Purpose: Reusable atomic widgets with strict prop contracts.
- Contains: `Button`, `IconButton`, `Heading`, `Pill`, `SearchPill`, `Tabs`, `DatePager`, `MenuItem`.
- Depends on: Tailwind utility classes, Lucide icons.
- Used by: Domain components and screens.

**5. System & Theme Layer (`src/theme.js`, `src/index.css`, `src/data/content.js`):**
- Purpose: Cross-cutting tokens, theme persistence, and mock data source.
- Contains: `THEMES` enum, `applyTheme` mutation, data structures.
- Used by: Entire component tree.

## Data Flow

**Screen Rendering Lifecycle:**

1. **Mount:** `index.html` loads fonts and mounts `src/main.jsx`.
2. **Routing:** `src/App.jsx` reads URL path (`/`, `/course-overview`, `/course-detail`, `/menu`).
3. **Data Injection:** The active screen imports structured datasets from `src/data/content.js`.
4. **Layout Wrapping:** The screen is enveloped in `PhoneShell` ensuring standard 390px boundaries.
5. **Interactive Actions:** User actions (like button click, tab switch, menu open) mutate local React state or trigger route navigation via `useNavigate`.

**State Management:**
- Local UI state: Managed via React `useState` hooks inside components (e.g., active tab index, expanded accordion row, search query string).
- Global theme state: Managed imperatively in `src/theme.js` using root class/attribute toggling.

## Key Abstractions

- **`PhoneShell`:** Encapsulates mobile responsiveness and mock device framing.
- **`AppHeader`:** Multi-mode header supporting `'menu'`, `'back'`, or `'close'` icons with brand logo.
- **`CourseCard`:** Color-variant card (`'blue'`, `'light'`, `'yellow'`) with absolute action overlays.
- **`LessonRow`:** Accordion item with smooth expand/collapse and play overlay.

## Entry Points

- `index.html` - HTML container, font declarations, and `#root` div
- `src/main.jsx` - React 19 root bootstrap (`createRoot`)
- `src/App.jsx` - Route definitions and application shell
