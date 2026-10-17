Create a file docs/build-plan.md with exactly the content below. Do not start building yet.

# Build Plan

HOW TO WORK THROUGH THIS PLAN

- Do the steps in order. Do ONE step at a time.
- For each step: build it, open it in the browser at 390px width, screenshot it,
  compare with the matching image in /design-reference, list the differences,
  fix the top 5, and re-check once.
- Follow .agent/rules/design-system.md and use only tokens from index.css.
- Do not change files unrelated to the current step.
- When a step is done: tick its checkbox in this file, then run
  git add -A and git commit -m "<step name>".
- Then immediately continue with the next unchecked step. Do not ask me for permission between steps.
- Only stop and ask me if you are truly blocked (missing file, error you cannot fix after 2 tries).
- Reference images: study-planning.png, menu.png, course-overview.png, course-detail.png.

STEPS
[x] 1. AppHeader (src/components/layout/AppHeader.jsx): props left (menu/back/close), logo, onLeftClick. Menu icon is two thin lines. Add a /components showcase page.
[x] 2. Pill and IconButton (src/components/ui): Pill outlined fully rounded with optional icon and iconRight; IconButton circular outlined, plus variant plain for the three-dot icon.
[ ] 3. Button (cream variant) like "Start course" in course-detail.png.
[x] 4. Heading (.text-display style, keeps line breaks).
[x] 5. CourseCard (src/components/course): color blue/light/yellow, author, title with line breaks, time, liked. Width about 236px, flat color, no shadow.
[ ] 6. DatePager like the "< Mon. 12 > Tue. 13" row: props current, next, onPrev, onNext.
[ ] 7. SearchPill: outlined, rounded, search icon, working input.
[ ] 8. LessonRow (number, title, optional description, optional thumbnail with play icon using a grey placeholder, divider) and Tabs (items, active, onChange).
[ ] 9. MenuItem: giant .text-menu text, active is white with an arrow icon, inactive is muted.
[ ] 10. src/data/content.js: all demo content for the 4 screens, same wording as the references.
[ ] 11. StudyPlanning screen at /study-planning (horizontal scroll-snap cards with the second card peeking, DatePager at the bottom).
[ ] 12. CourseOverview screen at /course-overview.
[ ] 13. CourseDetail screen at /course-detail (Tabs must switch when clicked).
[ ] 14. Menu overlay screen at /menu with a short Framer Motion fade-and-slide-up.
[ ] 15. Connect everything with react-router: menu icon opens /menu, close goes back, Courses goes to /course-overview, Planning goes to /study-planning, tapping a card opens /course-detail, back arrow goes back. /study-planning is home. Wrap in PhoneShell. Test the whole flow in the browser.
[ ] 16. Theme: keep current as default, add a light theme switchable from src/theme.js.
[ ] 17. README.md (run, change content, switch theme, table of components and props, add a screen). Remove unused files.
[ ] 18. Final full-flow test, fix any problem, then commit "Template ready".

PROGRESS NOTES
(the agent writes short notes here when a step has a known remaining difference)

<!-- CHECKPOINT id="ckpt_mvcm3b6y_y0mao2" time="2026-10-17T16:29:22.666Z" note="auto" fixes=0 questions=0 highlights=0 sections="" -->

<!-- CHECKPOINT id="ckpt_mvcmg65j_5qda1w" time="2026-10-17T16:39:22.663Z" note="auto" fixes=0 questions=0 highlights=0 sections="" -->
