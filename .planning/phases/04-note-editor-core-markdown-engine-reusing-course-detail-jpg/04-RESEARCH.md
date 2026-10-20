# Phase 4: Note Editor Core & Markdown Engine - Research

**Phase:** 04-note-editor-core-markdown-engine-reusing-course-detail-jpg
**Date:** 2026-10-20
**Status:** Completed

---

## 1. Visual & Layout Analysis

### Reference Screen: `design-reference/course-detail.jpg`
1. **Header**:
   - Left: Back Chevron icon (`AppHeader left="back"`).
   - Right: Notebook badge / category name.
2. **Hero Title**:
   - `Heading`: Multi-line wrap, font-light, `.text-title` (30px).
3. **Primary Action CTA**:
   - `Button variant="cream"`: `#E5E7DA` background, dark text `#111111`, rounded corners.
4. **Segmented Tabs**:
   - Text tabs with active indicator font-weight and bottom border divider:
     - `Write`: Plain markdown editor input.
     - `Preview`: Rendered markdown with clean typographic styling.
     - `Canvas`: Visual sketch canvas (placeholder for Phase 6).
5. **Content Area**:
   - Padded with `py-4` within the 390px viewport.

---

## 2. Markdown Engine Design

A dedicated component `src/components/note/MarkdownRenderer.jsx`:
- Splits content into blocks:
  - Headings (`# `, `## `, `### `)
  - Code blocks (`` `code` `` and ` ```code\n...\n``` `)
  - Blockquotes (`> `)
  - Bulleted lists (`* `, `- `) and numbered lists (`1. `)
  - Inline tokens: `**bold**`, `*italic*`, `[[Backlink]]`
- Formatted with dark mode typography classes from `src/index.css`.

---

## 3. Validation Architecture

1. **Automated Verification**:
   - `src/data/verify-editor.js` testing:
     - Markdown token parsing.
     - Note title updates in `notesStore`.
     - Note content updates in `notesStore`.
     - Tab switching and auto-save persistence.
2. **Build Verification**:
   - `npm run build` succeeds cleanly.
