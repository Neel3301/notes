# Graph Report - design-1  (2026-10-20)

## Corpus Check
- Corpus is ~15,427 words - fits in a single context window. You may not need a graph.

## Summary
- 109 nodes · 252 edges · 12 communities (8 shown, 4 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.94)
- Token cost: 1,250 input · 1,850 output

## Community Hubs (Navigation)
- Project Dependencies & Tooling
- Architecture & Mobile Shell Layout
- Theme System & Color Tokens
- Course Card Components & Shapes
- Course Detail & Interactive Tabs
- Header Navigation & Menu Overlay
- Course Catalog & Search Controls
- Study Planning & Carousel Controls
- Typography & Inter Tight Font
- Design Mockups Reference Suite
- Build Verification & Acceptance
- HTML Viewport Configuration

## God Nodes (most connected - your core abstractions)
1. `react` - 21 edges
2. `ComponentsScreen()` - 14 edges
3. `lucide-react` - 11 edges
4. `AppHeader()` - 11 edges
5. `Heading()` - 10 edges
6. `StudyPlanningScreen()` - 10 edges
7. `AppRoutes()` - 9 edges
8. `CourseDetailScreen()` - 9 edges
9. `CourseOverviewScreen()` - 9 edges
10. `CourseCard()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Shapes & Borders Specification` --references--> `CourseCard()`  [INFERRED]
  docs/design-spec.md → src/components/course/CourseCard.jsx
- `390px Viewport Mobile Frame Constraint` --conceptually_related_to--> `PhoneShell()`  [INFERRED]
  docs/design-spec.md → src/components/layout/PhoneShell.jsx
- `Spacing & Layout Metrics` --references--> `PhoneShell()`  [INFERRED]
  docs/design-spec.md → src/components/layout/PhoneShell.jsx
- `Study Planning Screen Mockup` --conceptually_related_to--> `DatePager()`  [INFERRED]
  design-reference/study-planning.jpg → src/components/ui/DatePager.jsx
- `Typography Metrics & Font Selection` --references--> `Heading()`  [INFERRED]
  docs/design-spec.md → src/components/ui/Heading.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Core Mobile Screen Navigation Flow** — src_screens_studyplanningscreen_studyplanningscreen, src_screens_courseoverviewscreen_courseoverviewscreen, src_screens_coursedetailscreen_coursedetailscreen, src_screens_menuscreen_menuscreen [EXTRACTED 1.00]
- **Design Token Specification & Definition** — docs_design_spec_colors, docs_design_spec_typography, docs_design_spec_spacing, src_data_content_tokencolors [INFERRED 0.95]
- **Visual Design Reference Suite** — design_reference_study_planning_mockup, design_reference_course_overview_mockup, design_reference_course_detail_mockup, design_reference_menu_mockup [EXTRACTED 1.00]

## Communities (12 total, 4 thin omitted)

### Community 0 - "Project Dependencies & Tooling"
Cohesion: 0.08
Nodes (25): dependencies, framer-motion, lucide-react, react, react-dom, react-router-dom, devDependencies, tailwindcss (+17 more)

### Community 1 - "Architecture & Mobile Shell Layout"
Cohesion: 0.12
Nodes (20): 390px Viewport Mobile Frame Constraint, Phased Implementation Plan, Spacing & Layout Metrics, Content Customization Architecture, Edsy Mobile Design Template Overview, Routes and Navigation Specification, react-dom, App() (+12 more)

### Community 2 - "Theme System & Color Tokens"
Cohesion: 0.22
Nodes (9): Design System Rules and Tokens, Minimalist High-Contrast Dark Aesthetic, Color Palette Specification, Theme System and Mode Switching, activeTheme, applyTheme(), setTheme(), THEMES (+1 more)

### Community 3 - "Course Card Components & Shapes"
Cohesion: 0.42
Nodes (5): Shapes & Borders Specification, lucide-react, CourseCard(), DatePager(), ComponentsScreen()

### Community 4 - "Course Detail & Interactive Tabs"
Cohesion: 0.50
Nodes (5): Course Detail Screen Mockup, LessonRow(), Button(), Tabs(), CourseDetailScreen()

### Community 5 - "Header Navigation & Menu Overlay"
Cohesion: 0.50
Nodes (5): Menu Overlay Mockup, react, AppHeader(), MenuItem(), MenuScreen()

### Community 6 - "Course Catalog & Search Controls"
Cohesion: 0.52
Nodes (4): Course Overview Screen Mockup, Heading(), SearchPill(), CourseOverviewScreen()

### Community 7 - "Study Planning & Carousel Controls"
Cohesion: 0.60
Nodes (3): IconButton(), Pill(), StudyPlanningScreen()

## Knowledge Gaps
- **14 isolated node(s):** `tailwindcss`, `Edsy Mobile Design Template Overview`, `Routes and Navigation Specification`, `Content Customization Architecture`, `Theme System and Mode Switching` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 35 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Header Navigation & Menu Overlay` to `Project Dependencies & Tooling`, `Architecture & Mobile Shell Layout`, `Course Card Components & Shapes`, `Course Detail & Interactive Tabs`, `Course Catalog & Search Controls`, `Study Planning & Carousel Controls`?**
  _High betweenness centrality (0.266) - this node is a cross-community bridge._
- **What connects `tailwindcss`, `Edsy Mobile Design Template Overview`, `Routes and Navigation Specification` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Project Dependencies & Tooling` be split into smaller, more focused modules?**
  _Cohesion score 0.07977207977207977 - nodes in this community are weakly interconnected._
- **Should `Architecture & Mobile Shell Layout` be split into smaller, more focused modules?**
  _Cohesion score 0.12307692307692308 - nodes in this community are weakly interconnected._