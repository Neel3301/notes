# External Integrations

**Analysis Date:** 2026-10-20

## APIs & External Services

**Hosted CDN Fonts:**
- Google Fonts (`fonts.googleapis.com` & `fonts.gstatic.com`)
  - Integration: Preconnected `<link>` in `index.html` loading `Inter Tight` (weights 300, 400, 500, 600)
  - Auth: None (public webfont CDN)
  - Fallback: Local system sans-serif stack defined in CSS

**Icon Assets:**
- `lucide-react` (SVG icons bundle)
  - Integration: NPM package bundled at build time
  - Runtime Network Calls: None (inline SVG elements)

**External Backend APIs:**
- Currently: None. The mobile prototype operates as an entirely self-contained, offline-first client application.
- Mock Data Layer: All mock entities, schedules, lessons, instructors, and menus reside in `src/data/content.js`.

## Data Storage

**Client-Side In-Memory State:**
- Single Source of Truth: `src/data/content.js` exports immutable mock data sets:
  - `studyPlanningData` (calendar schedules, featured courses)
  - `courseOverviewData` (search queries, course catalogs)
  - `courseDetailData` (curriculum, syllabus stats, lesson video references)
  - `menuData` (route links and status)
- Runtime Component State: React `useState` hooks manage interactive UI states (search inputs, active tabs, accordion expansion, like/favorite toggles).

**Local / Session Storage:**
- Theme State: `src/theme.js` holds `activeTheme` in memory; can optionally persist to browser `localStorage` or `data-theme` attribute on `document.documentElement`.

## Authentication & Identity

**Auth Provider:**
- None configured in this template. The design showcases client UX screens without gating behind session tokens or OAuth providers.

## Build & Deployment Services

**Local Dev Server:**
- Vite dev server (`http://localhost:5173/`)

**Production Bundling:**
- Output target: `dist/` (static SPA assets deployable to Vercel, Netlify, Cloudflare Pages, or Firebase Hosting)
