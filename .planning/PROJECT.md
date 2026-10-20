# Edsy Advanced Notes Mobile App

## What This Is

An advanced mobile note-taking application designed for Android, utilizing the high-contrast minimalist design system from the Edsy UI kit. It combines rich Markdown editing, Notion-style block organization, canvas sketches, audio notes, and bi-directional linking within a 390px mobile viewport preview.

## Core Value

Deliver an aesthetically stunning, friction-free note-taking experience that faithfully adheres to the reference mobile design language while providing powerful offline-first organization and editing capabilities.

## Requirements

### Validated

<!-- Shipped and confirmed valuable from the initial design-1 prototype. -->

- [x] 390px mobile viewport frame (`PhoneShell`) on centered desktop backdrop (`#DDE3EA`)
- [x] Edsy design token system (pure black canvas `#000000`, Inter Tight typography, curated card palette: `#6F91B6`, `#DCE3EB`, `#CABC3F`, `#E5E7DA`)
- [x] React Router v7 navigation flow across all screens with Framer Motion slide-up animations
- [x] Atomic UI primitives: `AppHeader`, `Heading`, `Pill`, `SearchPill`, `Button`, `IconButton`, `Tabs`, `DatePager`, `MenuItem`
- [x] Component test showcase (`/components`) and design token explorer (`/tokens`)

### Active

<!-- Scope for the Advanced Notes evolution. -->

- [ ] **Note Data Layer & Persistence:** Local offline-first persistence (IndexedDB / LocalStorage) for notes, folders, tags, attachments, and sketches with pre-seeded sample data.
- [ ] **Timeline & Daily Notes Screen (`/` & `/study-planning`):** Horizontal snap card carousel for active notes, tag filter pills, and bottom `DatePager` to navigate notes by date.
- [ ] **All Notes & Search Screen (`/course-overview`):** Full-text search with `SearchPill`, category tabs, and vertical stacked note cards with favorite toggles.
- [ ] **Advanced Note Editor Screen (`/course-detail`):** Multi-modal note view with tabs ("Write", "Preview", "Canvas"), expandable block sections, rich markdown rendering, checklist items, and cream CTA.
- [ ] **Media & Sketch Integration:** Embedded canvas doodling/sketch pad and audio memo recorder/player within note blocks.
- [ ] **Navigation & Tag Drawer (`/menu`):** Full-screen slide-up menu with giant `.text-menu` typography for Notebooks, Tags, Pinned Notes, Archive, and Trash.
- [ ] **Bi-directional Linking:** Support for `[[Note Title]]` backlinks connecting related thoughts and ideas.
- [ ] **Export & Backup:** One-click export to Markdown or JSON.

### Out of Scope

- Remote cloud database authentication server (Firebase/Supabase backend) — v1 is self-contained and offline-first.
- Native Android Gradle/APK build setup — web container at 390px is the primary preview surface.
- Multi-user live collaborative editing — solo agentic workflow.

## Context

- The project was originally prototyped from a Dribbble mobile UI inspiration (`design-reference/`).
- The user has no physical device or Android emulator access, so all UI/UX testing is conducted through the browser-based 390px mobile shell.
- Codebase has been mapped into `.planning/codebase/` and verified with Graphify.

## Constraints

- **Visual Fidelity**: Must strictly match the visual language, typography metrics, padding, and color roles in `docs/design-spec.md` and `design-reference/*.jpg`.
- **Viewport**: Fixed 390px mobile canvas constraint.
- **Tech Stack**: React 19, Tailwind CSS v4, Framer Motion, Lucide Icons, Vite.
- **Offline Reliability**: Must function without active network connections.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Adapt Edsy UI Kit for Notes App | Existing design system has polished components, typography, and card carousels ideal for notes | ✓ Good |
| Web Viewport Preview over Emulator | Fast HMR iteration without requiring Android Studio or device setup | ✓ Good |
| Local Offline Persistence | Instant load times, privacy, and zero backend maintenance | ✓ Good |

---
*Last updated: 2026-10-20 after /gsd-new-project initialization*
