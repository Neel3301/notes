# Coding Conventions

**Analysis Date:** 2026-10-20

## Naming Patterns

**Files & Directories:**
- React components: `PascalCase.jsx` (e.g., `CourseCard.jsx`, `AppHeader.jsx`, `StudyPlanningScreen.jsx`)
- Utilities & Data: `camelCase.js` (e.g., `theme.js`, `content.js`)
- Documentation: `kebab-case.md` or `UPPERCASE.md` (e.g., `design-spec.md`, `README.md`)
- Subdirectories: `kebab-case` or lowercase (e.g., `course/`, `layout/`, `ui/`, `screens/`)

**Functions & Components:**
- Functional Components: `PascalCase` named exports (e.g., `export default function CourseCard(...)`)
- Helper functions: `camelCase` (e.g., `applyTheme`, `setTheme`, `toggleTheme`)
- Event Handlers: `handle[Event]` or `on[Event]` prop naming (e.g., `onClick`, `onMenuClick`, `onLikeToggle`)

**Variables & Constants:**
- Variables & state: `camelCase` (e.g., `activeTab`, `isLiked`, `searchQuery`)
- Constants & Enums: `UPPER_SNAKE_CASE` (e.g., `THEMES = { DARK: 'dark', LIGHT: 'light' }`)
- Mock Data Objects: `camelCaseData` (e.g., `studyPlanningData`, `courseDetailData`)

## Code Style

**JSX & React Architecture:**
- Modern Functional Components with React 19 hooks (`useState`, `useNavigate`).
- Destructured props with sensible defaults:
  ```jsx
  export default function CourseCard({
    color = 'blue',
    author = '',
    title = '',
    time = '',
    liked = false,
    fullWidth = false,
    onLikeToggle,
    onClick,
  }) { ... }
  ```
- Semantic HTML elements (`<header>`, `<main>`, `<nav>`, `<button>`, `<input>`, `<h1>`, `<h2>`).

**Styling Conventions (Tailwind CSS v4):**
- Utility-first class names directly on JSX elements.
- Semantic color variables mapped via `@theme`:
  - `bg-screen` for screen canvas background
  - `text-text-primary` for white headers
  - `text-text-secondary` for muted captions
  - `border-border-outline` for subtle 1px outlines
- Fixed mobile dimensions:
  - Phone shell: `w-[390px]`
  - Corner radius: `rounded-lg` (`8px`) or `rounded-full` (`9999px`)
- Typography utilities:
  - Display headers: `.text-display` (`font-light text-[46px] leading-[1.05] tracking-[-0.035em]`)
  - Menu typography: `.text-menu` (`font-light text-[38px] leading-[1.1] tracking-[-0.03em]`)

## Import Organization

**Order:**
1. React core (`import React, { useState } from 'react';`)
2. Routing & Libraries (`import { useNavigate } from 'react-router-dom';`, `import { motion } from 'framer-motion';`)
3. Icons (`import { Menu, Heart, Search } from 'lucide-react';`)
4. Internal Layout & UI Components (`import AppHeader from '../layout/AppHeader';`)
5. Domain Components (`import CourseCard from '../course/CourseCard';`)
6. Data & Theme utilities (`import { studyPlanningData } from '../data/content';`)

## Error Handling Patterns

- Defensive fallback values on prop destructuring.
- Fallback renderings for optional content blocks (e.g., `showDivider && <div className="..." />`).
