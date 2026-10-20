# Technology Stack

**Analysis Date:** 2026-10-20

## Languages

**Primary:**
- JavaScript (ES2022+ / JSX) - All application components, screens, theme controllers, and route definitions (`src/**/*.jsx`, `src/**/*.js`)

**Secondary:**
- HTML5 - Application shell host (`index.html`)
- CSS3 (Tailwind v4 theme variables) - Global reset, CSS custom properties, and utility directives (`src/index.css`)
- Markdown - Design specification and GSD planning documentation (`docs/`, `.planning/`)

## Runtime

**Environment:**
- Node.js: `>=18.0.0`
- Browser targets: Modern evergreen browsers (Chrome, Safari, Firefox, Edge) with mobile viewport emulation

**Package Manager:**
- npm (v10.x+)
- Lockfile: `package-lock.json` present and versioned

## Frameworks

**Core:**
- React (v19.0.0) - Declarative component UI model
- React DOM (v19.0.0) - DOM renderer
- React Router DOM (v7.3.0) - Declarative client-side routing (`BrowserRouter`, `Routes`, `Route`, `useNavigate`, `useLocation`)

**Styling & Motion:**
- Tailwind CSS (v4.0.0) - Zero-config utility-first CSS framework via Vite plugin
- Framer Motion (v12.4.10) - Gesture animations, modal spring transitions (`AnimatePresence`, `motion.div`)

**Build/Dev:**
- Vite (v6.2.0) - Next-generation frontend build tooling and HMR dev server
- `@vitejs/plugin-react` (v4.3.4) - Babel/Fast Refresh integration for React JSX
- `@tailwindcss/vite` (v4.0.0) - Vite integration plugin for Tailwind v4

## Key Dependencies

**Critical:**
- `react-router-dom` (`^7.3.0`) - Manages multi-screen routing (`/`, `/study-planning`, `/course-overview`, `/course-detail`, `/menu`, `/tokens`, `/components`)
- `framer-motion` (`^12.4.10`) - Full-screen slide-up transitions for the navigation menu overlay and interactive accordions
- `lucide-react` (`^1.16.0`) - Icon suite for mobile UI elements (menu toggles, arrows, hearts, search, close buttons)

**Styling Architecture:**
- Tailwind CSS v4 `@theme` block in `src/index.css` defining semantic color tokens (`--color-screen`, `--color-text-primary`, `--color-card-blue`, etc.)
- Google Fonts: `Inter Tight` loaded via `index.html` with weights 300, 400, 500, 600

## Configuration

**Build & Dev Server:**
- `vite.config.js` - Configures `@vitejs/plugin-react` and `@tailwindcss/vite`

**Styling Directives:**
- `src/index.css` - Custom CSS rules for display typography (`.text-display`), mobile scrollbar suppression (`.scrollbar-none`), and theme switching

**Package Manifest:**
- `package.json` - Type module (`"type": "module"`), development and build script hooks
