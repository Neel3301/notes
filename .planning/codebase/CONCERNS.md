# Codebase Concerns

**Analysis Date:** 2026-10-20

## Tech Debt

**Lack of Automated Testing Suite:**
- Issue: No test runner (Vitest/Jest) or component tests are installed in `package.json`.
- Why: Rapid prototyping phase focused on visual fidelity against reference mockups.
- Impact: Regressions in interactive behaviors (like/favorite toggling, accordion opening, search filtering) must be caught manually.
- Fix approach: Install `vitest`, `@testing-library/react`, and `jsdom`; add test scripts to `package.json`.

**Static Content Coupling:**
- Issue: While data is centralized in `src/data/content.js`, dynamic mutations (e.g. adding a new course or editing lesson state) do not persist to a database or browser storage.
- Why: Template intended as an off-the-shelf mobile UI kit.
- Impact: Refreshing the browser resets all user interactions to initial constants.
- Fix approach: Introduce a React Context or lightweight Zustand store with `localStorage` persistence.

## Known Fragile Areas

**Multi-Project Git Monorepo Structure:**
- Issue: The root repository is located at `d:\Mobile Designs`, containing multiple sibling directories (`design-1`, `design-3`, `kit-factory-2`).
- Impact: Running Git commands from inside `design-1` can accidentally stage untracked files from sibling projects if not scoped carefully.
- Recommendation: Ensure `.gitignore` and `git add` commands are always scoped to the active workspace directory.

**Tailwind CSS v4 Configuration:**
- Issue: Tailwind v4 deprecates `tailwind.config.js` in favor of CSS `@theme` directives in `src/index.css`.
- Impact: Third-party component snippets expecting legacy Tailwind v3 config files might require translation to CSS custom property directives.
- Mitigation: All design tokens are cleanly declared in `src/index.css` under the `@theme` block.

## Security Considerations

**External Font Asset CDN:**
- Risk: Google Fonts dependency requires network connectivity for `Inter Tight` to render.
- Current mitigation: Fallback to system sans-serif font stack.
- Recommendation: Download font WOFF2 files into `public/fonts/` for self-hosted, offline-ready operation.

**Client-Side Script Injections:**
- Risk: Low. All data rendered from `src/data/content.js` is sanitized by standard React JSX escaping.
- Mitigation: No usage of `dangerouslySetInnerHTML`.

## Performance Considerations

**Framer Motion Bundle Size:**
- Current State: Framer Motion v12 is bundled in full for slide-up modals and micro-animations.
- Optimization: In production, consider tree-shaking or using `LazyMotion` with `domAnimation` features to reduce initial bundle payload.
