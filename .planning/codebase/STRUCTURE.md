# Codebase Structure

**Analysis Date:** 2026-10-20

## Directory Layout

```
design-1/
├── .agent/              # GSD runtime configuration, skills, and hooks
├── .agents/             # Antigravity agent workflows and rules
├── .planning/           # GSD planning artifacts and codebase maps
│   └── codebase/        # 7 structured codebase documentation files
├── design-reference/    # Reference design mockups and screenshots
├── docs/                # Design specifications and implementation plans
├── graphify-out/        # Knowledge graph visualizer and reports
├── src/                 # Application source code
│   ├── components/      # Reusable React components
│   │   ├── course/      # Course-specific domain components
│   │   ├── layout/      # App framing and header layout components
│   │   └── ui/          # Generic UI primitives and widgets
│   ├── data/            # Single source of truth mock copy and data
│   ├── screens/         # Route screen components
│   ├── App.jsx          # Top-level routing component
│   ├── index.css        # Tailwind v4 theme and typography rules
│   ├── main.jsx         # React DOM bootstrap entry point
│   └── theme.js         # Theme switcher utility
├── index.html           # HTML5 host document
├── package.json         # Project metadata and dependencies
└── vite.config.js       # Vite bundler and plugin configuration
```

## Directory Purposes

**`src/components/layout/`:**
- Purpose: Frame layout and top navigation bars.
- Key files:
  - `PhoneShell.jsx`: 390px mobile viewport wrapper with centered desktop backdrop.
  - `AppHeader.jsx`: Unified top navigation bar supporting hamburger menu, back chevron, and close button.

**`src/components/ui/`:**
- Purpose: Reusable atomic widgets with strict styling contracts.
- Key files:
  - `Button.jsx`: Primary cream CTA button (`#E5E7DA`) and secondary outlines.
  - `IconButton.jsx`: Circular icon button with 1px border.
  - `Heading.jsx`: Large display typography (`.text-display`, 46px / 300).
  - `Pill.jsx`: Filter pill with rounded borders.
  - `SearchPill.jsx`: Search input field wrapped in pill styling.
  - `DatePager.jsx`: Horizontal day navigation strip with active indicator.
  - `Tabs.jsx`: Tab switcher with hairline divider border.
  - `MenuItem.jsx`: Large typographic menu item with diagonal arrow.

**`src/components/course/`:**
- Purpose: Course curriculum and overview components.
- Key files:
  - `CourseCard.jsx`: Color-coded course card (blue, light, yellow variants) with favorite toggle.
  - `LessonRow.jsx`: Expandable syllabus accordion with video preview thumbnail.

**`src/screens/`:**
- Purpose: Top-level page views corresponding to application routes.
- Key files:
  - `StudyPlanningScreen.jsx`: Schedule view with horizontal card carousel (`/`, `/study-planning`).
  - `CourseOverviewScreen.jsx`: Course search and catalogue view (`/course-overview`).
  - `CourseDetailScreen.jsx`: Course outline and curriculum view (`/course-detail`).
  - `MenuScreen.jsx`: Slide-up full-screen navigation modal (`/menu`).
  - `TokensScreen.jsx`: Visual design token showcase (`/tokens`).
  - `ComponentsScreen.jsx`: UI component testing sandbox (`/components`).

**`src/data/`:**
- Purpose: Data layer isolating copy from UI presentation.
- Key files:
  - `content.js`: Comprehensive exports for all screen datasets and token definitions.

**`docs/`:**
- Purpose: High-fidelity specifications extracted from design assets.
- Key files:
  - `design-spec.md`: Color codes, font metrics, spacing dimensions, and shape rules.
  - `build-plan.md`: Phased milestone plan and verification criteria.

## Key File Locations

**Entry Points:**
- `index.html`: Web document host
- `src/main.jsx`: React client entry
- `src/App.jsx`: Route table

**Configuration:**
- `vite.config.js`: Bundler settings
- `package.json`: Dependency manifests
- `src/index.css`: Tailwind v4 theme variables

**Core Data & State:**
- `src/data/content.js`: Content repository
- `src/theme.js`: Active theme manager
