# Testing Patterns

**Analysis Date:** 2026-10-20

## Test Framework

**Current State:**
- The repository does not currently include automated unit, integration, or end-to-end test runners.
- Verification has historically been executed via manual visual inspection and side-by-side design reference comparison.
- Test commands in `package.json`:
  ```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
  ```

## Recommended Test Stack

**Unit & Component Testing:**
- Recommended Runner: `Vitest` (`^2.x` or `^3.x`)
- DOM Environment: `jsdom` or `happy-dom`
- Testing Utilities: `@testing-library/react` and `@testing-library/user-event`
- Proposed Run Commands:
  ```bash
  npm test                 # Run test suite
  npm test -- --watch      # Interactive watch mode
  npm run test:coverage    # Code coverage report
  ```

**Visual Regression & E2E Testing:**
- Recommended Runner: `Playwright`
- Mobile Viewport Configuration: `390px x 844px` (iPhone 14 standard)
- Purpose: Compare live component renders against `design-reference/*.jpg` snapshots.

## Test File Organization (Proposed)

**Location:**
- Colocated with components or inside dedicated `__tests__/` directories:
  ```
  src/
  ├── components/
  │   ├── course/
  │   │   ├── CourseCard.jsx
  │   │   └── CourseCard.test.jsx
  │   ├── layout/
  │   │   ├── PhoneShell.jsx
  │   │   └── PhoneShell.test.jsx
  │   └── ui/
  │       ├── Button.jsx
  │       └── Button.test.jsx
  ```

## Critical Test Scenarios to Cover

1. **`CourseCard` Interactions:**
   - Toggling the like/heart button invokes `onLikeToggle` callback.
   - Applies correct CSS color classes for `blue`, `light`, and `yellow` variants.
2. **`LessonRow` Expansion:**
   - Click toggles accordion open/closed state.
   - Displays lesson video thumbnail and description when expanded.
3. **`Tabs` Switcher:**
   - Clicking "Details" updates active tab index and calls `onChange`.
4. **`SearchPill` Filtering:**
   - Emits change events and clear actions correctly.
5. **`theme.js` Switching:**
   - Calling `setTheme(THEMES.LIGHT)` mutates DOM document attributes without errors.
