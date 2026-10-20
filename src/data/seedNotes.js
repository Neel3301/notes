/**
 * Seed Notes Dataset
 *
 * Pre-configured sample notes designed to showcase:
 * - Color palette tokens: 'blue' (#6F91B6), 'light' (#DCE3EB), 'yellow' (#CABC3F)
 * - Multi-line titles matching reference cards in study-planning.jpg and course-overview.jpg
 * - Notion-style blocks (text, checklist, callout) matching course-detail.jpg
 * - Bi-directional backlinks [[Note Title]]
 */

export const initialSeedNotes = [
  {
    id: 'note-1',
    title: 'Intro to\nFrontend Development',
    author: 'Alexander Spatari',
    notebook: 'Design Systems',
    color: 'blue',
    liked: true,
    pinned: true,
    archived: false,
    trashed: false,
    date: 'Mon. 12',
    time: '10:00 am – 11:30 am',
    tags: ['Frontend', 'Design', 'Architecture'],
    content: `# Intro to Frontend Development

A foundational study on building scalable, atomic user interfaces for mobile web viewports.

## Core Principles
1. **Atomic Design**: Build primitives first (buttons, pills, headings) then assemble into screens.
2. **Design Tokens**: Standardize colors, font weights, and spacing variables.
3. **Responsive Constraint**: Enforce strict 390px mobile container boundaries.

See also [[Color Theory & Visual Hierarchy]] for palette harmony rules.`,
    blocks: [
      {
        id: 'block-1-1',
        number: '01',
        type: 'text',
        title: 'Component Architecture',
        content: 'Design tokens provide the glue between Figma prototypes and React code. By mapping CSS variables directly to theme tokens, switching between light and dark modes requires zero component changes.',
      },
      {
        id: 'block-1-2',
        number: '02',
        type: 'checklist',
        title: 'Action Checklist',
        items: [
          { id: 'chk-1', text: 'Define primitive tokens in index.css', completed: true },
          { id: 'chk-2', text: 'Implement PhoneShell 390px boundary', completed: true },
          { id: 'chk-3', text: 'Create reusable Card with colorMap support', completed: true },
          { id: 'chk-4', text: 'Audit touch target sizes (min 44px)', completed: false },
        ],
      },
      {
        id: 'block-1-3',
        number: '03',
        type: 'callout',
        title: 'Design Guideline',
        calloutType: 'info',
        content: 'Key takeaway: Always design mobile-first inside the 390px shell. Cards should feature comfortable 20px padding with high-contrast typography.',
      },
    ],
    sketchData: null,
    audioData: {
      duration: 74,
      label: 'Audio Memo (1:14)',
      recordedAt: '2026-10-12T10:15:00Z',
    },
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'note-2',
    title: 'Digital\nIllustration: Vector Art',
    author: 'Studio Koto',
    notebook: 'Creative Direction',
    color: 'light',
    liked: false,
    pinned: false,
    archived: false,
    trashed: false,
    date: 'Mon. 12',
    time: '01:00 pm – 02:30 pm',
    tags: ['Art', 'Vector', 'Illustration'],
    content: `# Digital Illustration: Vector Art

Exploring minimalist vector shapes, geometry, and SVG curve optimization for crisp high-density mobile screens.

Key points covered:
- Using limited 3-color palettes to create maximum visual impact
- Curving control points for smooth silhouette outlines
- Exporting lightweight vector assets under 5KB`,
    blocks: [
      {
        id: 'block-2-1',
        number: '01',
        type: 'text',
        title: 'Geometry & Negative Space',
        content: 'Modern flat illustration relies on intentional balance of negative space. Avoid gradients when solid color fills can establish sufficient depth.',
      },
      {
        id: 'block-2-2',
        number: '02',
        type: 'checklist',
        title: 'Project Milestones',
        items: [
          { id: 'chk-2-1', text: 'Draft wireframe silhouettes', completed: true },
          { id: 'chk-2-2', text: 'Test contrast in dark mode background', completed: false },
          { id: 'chk-2-3', text: 'Export SVG icon paths', completed: false },
        ],
      },
    ],
    sketchData: null,
    audioData: null,
    createdAt: Date.now() - 86400000 * 1.5,
    updatedAt: Date.now() - 86400000 * 1.5,
  },
  {
    id: 'note-3',
    title: 'Color Theory &\nVisual Hierarchy',
    author: 'Design Milk',
    notebook: 'Design Systems',
    color: 'yellow',
    liked: true,
    pinned: false,
    archived: false,
    trashed: false,
    date: 'Tue. 13',
    time: '03:45 pm – 05:00 pm',
    tags: ['Design', 'Color', 'Typography'],
    content: `# Color Theory & Visual Hierarchy

How to build high-contrast dark interfaces that remain readable, elegant, and striking.

Curated color harmonies:
- **Canvas Base**: Pure Black (#000000)
- **Primary CTA**: Cream (#E5E7DA)
- **Slate Accent**: Blue (#6F91B6)
- **Pale Cloud**: Light Gray-Blue (#DCE3EB)
- **Mustard Warmth**: Olive Yellow (#CABC3F)

Referenced in [[Intro to Frontend Development]].`,
    blocks: [
      {
        id: 'block-3-1',
        number: '01',
        type: 'text',
        title: 'High-Contrast Dominance',
        content: 'Dark mode does not mean monotonous charcoal. Pairing a pitch black canvas with warm cream CTAs and subtle muted card pastels creates an unforgettable premium aesthetic.',
      },
      {
        id: 'block-3-2',
        number: '02',
        type: 'callout',
        title: 'Contrast Rule',
        calloutType: 'warning',
        content: 'Always maintain a minimum 4.5:1 text-to-card contrast ratio. Text on card tiles (#111111) is tuned for crisp sunlight visibility.',
      },
    ],
    sketchData: null,
    audioData: null,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'note-4',
    title: 'Design Systems &\nToken Architecture',
    author: 'Figma Community',
    notebook: 'Engineering',
    color: 'blue',
    liked: false,
    pinned: false,
    archived: false,
    trashed: false,
    date: 'Wed. 14',
    time: '09:00 am – 10:15 am',
    tags: ['Tokens', 'Architecture', 'Engineering'],
    content: `# Design Systems & Token Architecture

Structuring design tokens in three resilient tiers:
1. **Primitive Tokens**: Pure hex values (e.g. #6F91B6, #000000).
2. **Semantic Tokens**: Role-based variables (--color-screen, --color-page, --color-card-blue).
3. **Component Tokens**: Button heights, card corner radii (8px), pill padding.`,
    blocks: [
      {
        id: 'block-4-1',
        number: '01',
        type: 'text',
        title: 'Token Naming Taxonomy',
        content: 'Semantic naming guarantees that components remain decoupled from specific palettes, enabling frictionless theme switching and branding customization.',
      },
      {
        id: 'block-4-2',
        number: '02',
        type: 'checklist',
        title: 'Integration Checklist',
        items: [
          { id: 'chk-4-1', text: 'Map Tailwind v4 @theme variables', completed: true },
          { id: 'chk-4-2', text: 'Document typography font-light metrics', completed: true },
          { id: 'chk-4-3', text: 'Publish token showcase screen', completed: true },
        ],
      },
    ],
    sketchData: null,
    audioData: null,
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now() - 43200000,
  },
];
