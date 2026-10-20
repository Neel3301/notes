# Plan: Phase 13 — Responsive Desktop Dashboard Layout & Web Revamp

## Goal
Transform the web application from a fixed 390px mobile phone simulation into a modern, full-width responsive desktop dashboard while strictly preserving 100% visual and functional mobile parity on small screens (<768px) and inside the Android APK WebView.

## Requirements Covered
- **DSH-01**: Desktop/laptop view renders a full-width responsive dashboard with collapsible Left Sidebar (`AppHeader`, Navigation, Notebooks, Tags, Settings/Account).
- **DSH-02**: Multi-pane workspace allows browsing notes list/timeline and active note editor side-by-side on desktop without modal jumping.
- **DSH-03**: Mobile viewports (<768px) and Android APK preserve the exact mobile design reference layout (`PhoneShell` styling, bottom `DatePager`, slide-up menu).
- **DSH-04**: Desktop dashboard strictly preserves Edsy dark aesthetic tokens (`#000000`, `#E5E7DA`, Inter Tight, `#6F91B6`, `#DCE3EB`, `#CABC3F`).

## Proposed Architecture
1. **Layout Container (`web/src/components/layout/AppLayout.jsx`)**:
   - Replaces `PhoneShell.jsx` in `App.jsx`.
   - On Desktop (screen >= 768px):
     - Left Sidebar (`DesktopSidebar.jsx` ~260px width) with Edsy branding, "+ New Note" cream CTA, navigation links (Timeline, All Notes, Notebooks, Tags, Shared, Trash), and Cloud Sync / Account footer.
     - Top Navigation / Status bar for quick actions.
     - Responsive content viewport that scales fluidly to 100% of available screen width.
   - On Mobile / Android APK (< 768px):
     - Left Sidebar hidden.
     - Content rendered with exact 100% mobile viewport semantics and styling.
2. **Desktop Workspace Views (`DesktopNotesWorkspace.jsx`)**:
   - Dual-pane layout on wide screens:
     - Left pane: Searchable note cards list with tag filter chips and favorite toggles.
     - Right pane: Active note editor with full markdown writing/previewing, modular blocks, canvas sketch, audio memo, and backlinks drawer.
   - Seamlessly synchronizes with `notesStore`.
3. **Verification**:
   - Automated tests verifying desktop full-width rendering (>=768px/1024px) AND mobile rendering (<768px).
   - Verify `web/` build compiles without errors.
