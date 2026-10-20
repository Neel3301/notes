# Phase 4: Note Editor Core & Markdown Engine - Validation Strategy

**Phase:** 04-note-editor-core-markdown-engine-reusing-course-detail-jpg
**Date:** 2026-10-20
**Status:** Defined

---

## Validation Overview

| Validation Dimension | Method | Criteria |
|----------------------|--------|----------|
| **1. Layout & Header** | Visual / Layout | Header renders back chevron, notebook badge, hero title, and cream button `#E5E7DA`. |
| **2. Tab Navigation** | Component interaction | Switching between "Write", "Preview", and "Canvas" renders corresponding views. |
| **3. Markdown Rendering** | Component test | Headings, lists, code, and quotes render formatted in dark mode typography. |
| **4. Live Editing & Auto-Save** | Store check | Changes made to title and markdown content persist to `notesStore`. |
| **5. Cream CTA Action** | Component check | Tapping cream button switches between "Edit note" and "Done". |

---

## Verification Command

```bash
node src/data/verify-editor.js
```
