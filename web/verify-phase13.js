/**
 * Phase 13 Automated Verification Suite: Responsive Desktop Dashboard Layout & Web Revamp
 * Validates requirements DSH-01, DSH-02, DSH-03, and DSH-04.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const results = [];

function assert(condition, testName, details = '') {
  results.push({ testName, passed: !!condition, details });
  const status = condition ? 'PASS' : 'FAIL';
  console.log(`[${status}] ${testName}${details ? ` - ${details}` : ''}`);
}

console.log('===============================================================');
console.log('  Phase 13: Responsive Desktop Dashboard & Web Revamp Audit   ');
console.log('===============================================================\n');

// 1. DSH-01: AppLayout and Desktop Sidebar
const appLayoutPath = path.join(rootDir, 'web', 'src', 'components', 'layout', 'AppLayout.jsx');
const desktopSidebarPath = path.join(rootDir, 'web', 'src', 'components', 'layout', 'DesktopSidebar.jsx');

assert(fs.existsSync(appLayoutPath), 'AppLayout.jsx exists');
if (fs.existsSync(appLayoutPath)) {
  const content = fs.readFileSync(appLayoutPath, 'utf-8');
  assert(content.includes('DesktopSidebar'), 'AppLayout embeds DesktopSidebar');
  assert(content.includes('hidden md:flex'), 'AppLayout hides desktop sidebar on mobile (< 768px)');
  assert(content.includes('w-full min-h-screen bg-screen'), 'AppLayout provides full-width root container with bg-screen');
}

assert(fs.existsSync(desktopSidebarPath), 'DesktopSidebar.jsx exists');
if (fs.existsSync(desktopSidebarPath)) {
  const content = fs.readFileSync(desktopSidebarPath, 'utf-8');
  assert(content.includes('.edsy'), 'DesktopSidebar renders .edsy typographic brand logo');
  assert(content.includes('New Note'), 'DesktopSidebar includes signature "+ New Note" action button');
  assert(content.includes('Timeline'), 'DesktopSidebar contains Timeline navigation link');
  assert(content.includes('All Notes'), 'DesktopSidebar contains All Notes navigation link');
  assert(content.includes('Shared Notes'), 'DesktopSidebar contains Shared Notes navigation link');
  assert(content.includes('Notebooks'), 'DesktopSidebar contains dynamic Notebooks drawer');
  assert(content.includes('Tags'), 'DesktopSidebar contains dynamic Tags section');
  assert(content.includes('syncStatus'), 'DesktopSidebar displays Cloud Sync status indicator');
}

// 2. DSH-02: Multi-Pane Desktop Workspace
const desktopWorkspacePath = path.join(rootDir, 'web', 'src', 'screens', 'DesktopNotesWorkspace.jsx');
assert(fs.existsSync(desktopWorkspacePath), 'DesktopNotesWorkspace.jsx exists');
if (fs.existsSync(desktopWorkspacePath)) {
  const content = fs.readFileSync(desktopWorkspacePath, 'utf-8');
  assert(content.includes('SearchPill'), 'DesktopNotesWorkspace includes live SearchPill in catalog pane');
  assert(content.includes('NoteCard'), 'DesktopNotesWorkspace renders NoteCard items in left list');
  assert(content.includes('MarkdownRenderer'), 'DesktopNotesWorkspace embeds MarkdownRenderer in active editor pane');
  assert(content.includes('CanvasSketchpad'), 'DesktopNotesWorkspace embeds CanvasSketchpad in active editor pane');
  assert(content.includes('AudioMemoBlock'), 'DesktopNotesWorkspace embeds AudioMemoBlock in active editor pane');
  assert(content.includes('BlockList'), 'DesktopNotesWorkspace embeds modular BlockList');
  assert(content.includes('BacklinksDrawer'), 'DesktopNotesWorkspace embeds BacklinksDrawer for bi-directional links');
  assert(content.includes('AiAssistantSheet'), 'DesktopNotesWorkspace integrates AI Assistant drawer');
}

// 3. DSH-03: Mobile Layout Preservation
const appJsxPath = path.join(rootDir, 'web', 'src', 'App.jsx');
const useIsDesktopPath = path.join(rootDir, 'web', 'src', 'hooks', 'useIsDesktop.js');

assert(fs.existsSync(useIsDesktopPath), 'useIsDesktop.js hook exists');
assert(fs.existsSync(appJsxPath), 'App.jsx exists');
if (fs.existsSync(appJsxPath)) {
  const content = fs.readFileSync(appJsxPath, 'utf-8');
  assert(content.includes('ResponsiveNotesView'), 'App.jsx uses ResponsiveNotesView to dynamically switch views');
  assert(content.includes('NotesCatalogScreen'), 'App.jsx preserves NotesCatalogScreen for mobile viewports');
  assert(content.includes('TimelineScreen'), 'App.jsx preserves TimelineScreen for mobile and desktop');
  assert(content.includes('NoteEditorScreen'), 'App.jsx preserves NoteEditorScreen');
  assert(content.includes('MenuScreen'), 'App.jsx preserves slide-up MenuScreen');
}

// 4. DSH-04: Aesthetic Continuity & Tokens
const indexCssPath = path.join(rootDir, 'web', 'src', 'index.css');
assert(fs.existsSync(indexCssPath), 'index.css exists');
if (fs.existsSync(indexCssPath)) {
  const content = fs.readFileSync(indexCssPath, 'utf-8');
  assert(content.includes('--theme-screen: #000000;'), 'index.css maintains #000000 pure black screen token');
  assert(content.includes('--theme-cream-bg: #E5E7DA;'), 'index.css maintains #E5E7DA signature cream CTA token');
  assert(content.includes('--color-card-blue: #6F91B6;'), 'index.css maintains #6F91B6 blue card token');
  assert(content.includes('--color-card-light: #DCE3EB;'), 'index.css maintains #DCE3EB light card token');
  assert(content.includes('--color-card-yellow: #CABC3F;'), 'index.css maintains #CABC3F yellow card token');
}

// 5. Shared note screens
const sharedNotesListPath = path.join(rootDir, 'web', 'src', 'screens', 'SharedNotesListScreen.jsx');
const sharedNoteScreenPath = path.join(rootDir, 'web', 'src', 'screens', 'SharedNoteScreen.jsx');
assert(fs.existsSync(sharedNotesListPath), 'SharedNotesListScreen.jsx exists for /shared route');
assert(fs.existsSync(sharedNoteScreenPath), 'SharedNoteScreen.jsx exists for /share/:slug viewer');

// 6. Production Build Check
const distIndexPath = path.join(rootDir, 'web', 'dist', 'index.html');
assert(fs.existsSync(distIndexPath), 'Production web bundle dist/index.html exists');

const total = results.length;
const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;

console.log('\n===============================================================');
console.log(`  Phase 13 Audit Result: ${passed}/${total} assertions passed (${failed} failed)`);
console.log('===============================================================');

if (failed > 0) {
  process.exit(1);
}
