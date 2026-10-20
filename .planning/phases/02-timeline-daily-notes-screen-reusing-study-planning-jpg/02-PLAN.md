---
phase: 02-timeline-daily-notes-screen-reusing-study-planning-jpg
plan: 01
type: implementation
prefix: VIEW
wave: 1
depends_on: []
files_modified:
  - src/screens/StudyPlanningScreen.jsx
  - src/App.jsx
  - src/data/verify-timeline.js
autonomous: true
requirements:
  - VIEW-01
  - VIEW-02
must_haves:
  artifacts:
    - src/screens/StudyPlanningScreen.jsx
    - src/data/verify-timeline.js
  key_links:
    - from: src/screens/StudyPlanningScreen.jsx
      to: src/data/notesStore.js
      description: Consumes useNotesStore to render live notes and handle like/filter actions
    - from: src/App.jsx
      to: src/screens/StudyPlanningScreen.jsx
      description: Mounts StudyPlanningScreen at / and /study-planning with note detail navigation
  truths:
    - Carousel renders notes with correct card color tokens (blue #6F91B6, light #DCE3EB, yellow #CABC3F)
    - Tapping the heart icon toggles liked state in notesStore without opening the note
    - DatePager advances active date and filters carousel notes
---

<objective>
Transform `StudyPlanningScreen` into the primary Notes Timeline & Daily Notes dashboard, adhering 100% to `design-reference/study-planning.jpg`. Connect it reactively to `useNotesStore()`, wire interactive favorite toggles, implement working filter pills ("This week", "Today", "All notes"), and connect `DatePager` date navigation.
</objective>

<context>
- `design-reference/study-planning.jpg` specifies the exact visual contract: pure black screen, hero heading, pill filter, round calendar icon, horizontal snap card carousel with right peek offset, and bottom DatePager.
- `src/screens/StudyPlanningScreen.jsx` currently displays static dummy props.
- `src/data/notesStore.js` provides `useNotesStore()` with reactive CRUD, `toggleLike()`, and `filterNotes()`.
- `VIEW-01`: Home screen adapts `/study-planning` layout with horizontal snap card carousel displaying colored note cards (`#6F91B6`, `#DCE3EB`, `#CABC3F`).
- `VIEW-02`: Bottom `DatePager` allows navigating notes by date and jumping to daily journal entries.
</context>

<tasks>

<task>
<name>Update StudyPlanningScreen with Reactive Store and Actions (src/screens/StudyPlanningScreen.jsx)</name>
<files>src/screens/StudyPlanningScreen.jsx</files>
<action>
Enhance `src/screens/StudyPlanningScreen.jsx`:
1. Import `useNotesStore` from `../data/notesStore`.
2. Support receiving `notes` from props or falling back to `useNotesStore()`.
3. Add interactive filter pill state toggling between "This week", "Today", and "All notes" with dropdown menu or cycle on click.
4. Add quick action menu on the `MoreVertical` button ("+ New Note" quick create, "All Notes" navigation).
5. Pass `onLikeToggle={(e) => { e.stopPropagation(); toggleLike(card.id); }}` to each `CourseCard` so tapping the heart toggles like status.
6. Filter cards based on selected filter pill and active date:
   - "Today": shows notes where `note.date === activeDate.current`.
   - "This week": shows weekday notes for the current week.
   - "All notes": shows all non-trashed notes.
7. Add an empty state matching the Edsy design when a date has no notes:
   - Message: "No notes for this date"
   - Button: Cream CTA "+ Create note" to instantly draft a note for that date.
8. Retain all visual styles from `design-reference/study-planning.jpg` (padding `px-5 pt-3 pb-8`, carousel snap `snap-x snap-mandatory`, peek spacing, font classes).
</action>
<verify>
Check that `StudyPlanningScreen.jsx` compiles cleanly, renders the card carousel from `notesStore`, and allows toggling favorites and changing dates.
</verify>
<done>
`StudyPlanningScreen` renders live notes from `notesStore` with full interactive controls.
</done>
</task>

<task>
<name>Connect Routes and Note Navigation in App.jsx (src/App.jsx)</name>
<files>src/App.jsx</files>
<action>
Update `src/App.jsx`:
1. In `AppRoutes`, ensure `/study-planning` and default `/` route pass proper navigation handlers to `StudyPlanningScreen`:
   - `onCardClick={(card) => navigate('/course-detail', { state: { note: card, noteId: card.id } })}`
   - `onMenuClick={() => navigate('/menu')}`
2. Maintain backward compatibility with existing routes while linking live note states.
</action>
<verify>
Run `npm run build` to verify routes and component props resolve without type or compilation errors.
</verify>
<done>
Routing seamlessly connects home timeline view to note detail and navigation drawer.
</done>
</task>

<task>
<name>Automated Timeline Verification Script (src/data/verify-timeline.js)</name>
<files>src/data/verify-timeline.js</files>
<action>
Create `src/data/verify-timeline.js` to test:
1. Note filtering by date matching `DatePager` active day.
2. Filter pill logic ("Today", "This week", "All notes").
3. Favorite toggling integration with `notesStore`.
4. Creation of quick notes for a given date.
5. Exit with code 0 on all assertions passing.
</action>
<verify>
Run `node src/data/verify-timeline.js` and verify it exits with code 0.
</verify>
<done>
Verification script confirms Timeline view logic and store interaction.
</done>
</task>

</tasks>

<verification>
Execute the automated test runner:
```bash
node src/data/verify-timeline.js
```
Acceptance criteria:
- All timeline filtering and store interaction assertions pass.
- `npm run build` builds without errors.
</verification>

<threat_model>
- **State De-synchronization**: Ensure `toggleLike` and note creation trigger immediate `notesStore` reactive updates so the carousel stays in sync without manual refresh.
- **Malformed Date String**: Guard date comparisons against null/undefined note dates by falling back safely to showing the note under "All notes".
</threat_model>
