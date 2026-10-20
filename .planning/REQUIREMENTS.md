# Requirements: Edsy Advanced Notes Mobile App

## v1 Requirements

### Data & Local Persistence
- [x] **DATA-01**: User notes, folders, tags, canvas sketches, and audio attachments persist in browser local storage / IndexedDB across page reloads.
- [x] **DATA-02**: App loads with rich pre-seeded sample notes demonstrating all block types, sketches, tags, and bi-directional links.
- [ ] **DATA-03**: User can export individual notes as Markdown files or download a full JSON backup.

### Note Editor & Multi-Modal Blocks
- [ ] **NOTE-01**: Note detail screen adapts `/course-detail` layout with dynamic title, cream action CTA (`#E5E7DA`), and segmented tabs ("Write", "Preview", "Canvas").
- [ ] **NOTE-02**: User can write and edit Markdown with live rendered formatting (headings, code blocks, lists, quotes).
- [ ] **NOTE-03**: User can structure notes with modular blocks (text, interactive checklist items, callout boxes).
- [ ] **NOTE-04**: User can switch to the Canvas tab to draw/sketch freehand doodles with stroke controls and save them into the note.
- [ ] **NOTE-05**: User can record and playback audio memos with progress bar and timestamp indicator.

### Views & Navigation
- [x] **VIEW-01**: Home screen adapts `/study-planning` layout with horizontal snap card carousel displaying colored note cards (`#6F91B6`, `#DCE3EB`, `#CABC3F`).
- [x] **VIEW-02**: Bottom `DatePager` allows navigating notes by date and jumping to daily journal entries.
- [x] **VIEW-03**: All Notes catalog screen adapts `/course-overview` with stacked note cards, timestamps, and favorite heart toggles.
- [x] **VIEW-04**: `SearchPill` provides instant live search filtering notes by title, tag, or content.
- [x] **VIEW-05**: Outlined filter pills row allows 1-tap filtering by tag or category.

### Organization & Backlinks
- [ ] **ORG-01**: Full-screen slide-up menu adapts `/menu` with giant `.text-menu` typography for Notebooks, Tags, Pinned, Archive, and Trash.
- [ ] **ORG-02**: User can organize notes into notebooks/folders and assign custom tags.
- [ ] **ORG-03**: User can write `[[Note Title]]` backlinks that auto-link to corresponding notes and display connected references.
- [ ] **ORG-04**: User can pin important notes to top and send unwanted notes to Trash with restore/permanent delete.

### AI Assistant
- [ ] **AI-01**: Built-in AI action drawer provides 1-tap assistance (Summarize, Extract Action Items, Auto-generate Tags, Rephrase).

---

## v2 Requirements (Deferred)

- **V2-01**: Cloud sync across multiple devices via encrypted peer-to-peer or Supabase backend.
- **V2-02**: Optical Character Recognition (OCR) to extract text from image attachments.
- **V2-03**: Interactive force-directed knowledge graph view of all inter-note backlinks.

---

## Out of Scope

- Multi-user real-time collaborative editing — Single-user mobile focus.
- Native Android Kotlin codebase — Web simulation in 390px `PhoneShell` is the primary target.
- Proprietary locked formats — Everything is plain-text and portable.

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Passed |
| DATA-02 | Phase 1 | Passed |
| DATA-03 | Phase 8 | Pending |
| NOTE-01 | Phase 4 | Pending |
| NOTE-02 | Phase 4 | Pending |
| NOTE-03 | Phase 5 | Pending |
| NOTE-04 | Phase 6 | Pending |
| NOTE-05 | Phase 6 | Pending |
| VIEW-01 | Phase 2 | Passed |
| VIEW-02 | Phase 2 | Passed |
| VIEW-03 | Phase 3 | Passed |
| VIEW-04 | Phase 3 | Passed |
| VIEW-05 | Phase 3 | Passed |
| ORG-01 | Phase 7 | Pending |
| ORG-02 | Phase 7 | Pending |
| ORG-03 | Phase 8 | Pending |
| ORG-04 | Phase 7 | Pending |
| AI-01 | Phase 9 | Pending |
