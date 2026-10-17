# Edsy UI Kit: project rules

## Stack
React + Vite, Tailwind v4, Framer Motion, Lucide icons. JavaScript only.

## Hard rules
- NEVER hard-code colors, radii, or font sizes. Use tokens from src/index.css.
- Every component gets props for its content. No hard-coded text inside components.
- All demo content lives in src/data/content.js.
- Mobile first. Design width is 390px.
- One component per file, default export, PascalCase filename.
- Reference images are in /design-reference. Always compare your result to them.

## Design language
- Pure black screens, white text, muted grey for secondary text.
- Headings: light weight (300), tight line-height (about 1.05), slight negative letter-spacing.
- Cards: small radius (8px), flat colors, no shadows, no gradients.
- Outlined pill buttons: 1px border, fully rounded, transparent background.
- One primary button style: cream background, dark text, small radius.
- No decorative effects. Style comes from type and spacing.

## Workflow
- Build one component at a time.
- After each component, open it in the browser, take a screenshot,
  and compare it with the reference image. List every visible difference before finishing.
