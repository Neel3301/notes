/**
 * Automated Verification Script for Phase 10: Clean Architecture & Semantic Route Alignment
 * Run with: node src/data/verify-architecture.js
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '..');

async function runArchitectureVerification() {
  console.log('🧪 Starting Phase 10 Clean Architecture & Semantic Route Alignment verification...\n');

  // 1. Verify Clean Screens Exist
  const timelineScreenPath = path.join(srcDir, 'screens', 'TimelineScreen.jsx');
  const catalogScreenPath = path.join(srcDir, 'screens', 'NotesCatalogScreen.jsx');
  const editorScreenPath = path.join(srcDir, 'screens', 'NoteEditorScreen.jsx');

  assert.ok(fs.existsSync(timelineScreenPath), 'TimelineScreen.jsx exists in src/screens');
  assert.ok(fs.existsSync(catalogScreenPath), 'NotesCatalogScreen.jsx exists in src/screens');
  assert.ok(fs.existsSync(editorScreenPath), 'NoteEditorScreen.jsx exists in src/screens');
  console.log('✓ Clean screen files exist with semantic names');

  // 2. Verify Legacy Screens Removed
  const legacyStudyPlanning = path.join(srcDir, 'screens', 'StudyPlanningScreen.jsx');
  const legacyCourseOverview = path.join(srcDir, 'screens', 'CourseOverviewScreen.jsx');
  const legacyCourseDetail = path.join(srcDir, 'screens', 'CourseDetailScreen.jsx');

  assert.ok(!fs.existsSync(legacyStudyPlanning), 'Legacy StudyPlanningScreen.jsx is removed');
  assert.ok(!fs.existsSync(legacyCourseOverview), 'Legacy CourseOverviewScreen.jsx is removed');
  assert.ok(!fs.existsSync(legacyCourseDetail), 'Legacy CourseDetailScreen.jsx is removed');
  console.log('✓ Legacy dummy course screens successfully removed');

  // 3. Verify NoteCard Exists in src/components/note
  const noteCardPath = path.join(srcDir, 'components', 'note', 'NoteCard.jsx');
  assert.ok(fs.existsSync(noteCardPath), 'NoteCard.jsx exists in src/components/note');
  console.log('✓ NoteCard component located in src/components/note/');

  // 4. Verify Legacy Course Directory Removed
  const legacyCourseDir = path.join(srcDir, 'components', 'course');
  assert.ok(!fs.existsSync(legacyCourseDir), 'Legacy src/components/course directory is deleted');
  console.log('✓ Legacy course components directory purged');

  // 5. Verify Content Data Exports
  const content = await import('./content.js');
  assert.ok(content.timelineData, 'content.js exports timelineData');
  assert.ok(content.notesCatalogData, 'content.js exports notesCatalogData');
  assert.ok(content.noteEditorData, 'content.js exports noteEditorData');
  console.log('✓ content.js exports note-centric timelineData, notesCatalogData, noteEditorData');

  // 6. Verify App.jsx Clean Route Setup
  const appContent = fs.readFileSync(path.join(srcDir, 'App.jsx'), 'utf-8');
  assert.ok(appContent.includes("path=\"/timeline\""), 'App.jsx defines /timeline route');
  assert.ok(appContent.includes("path=\"/notes\""), 'App.jsx defines /notes route');
  assert.ok(appContent.includes("path=\"/editor\""), 'App.jsx defines /editor route');
  assert.ok(appContent.includes("path=\"/note/:id\""), 'App.jsx defines /note/:id route');
  assert.ok(appContent.includes("Navigate to=\"/timeline\""), 'App.jsx redirects / to /timeline');
  assert.ok(appContent.includes("TimelineScreen"), 'App.jsx imports and uses TimelineScreen');
  assert.ok(appContent.includes("NotesCatalogScreen"), 'App.jsx imports and uses NotesCatalogScreen');
  assert.ok(appContent.includes("NoteEditorScreen"), 'App.jsx imports and uses NoteEditorScreen');
  console.log('✓ App.jsx routes and redirects verified');

  console.log('\n🎉 ALL 6/6 PHASE 10 ARCHITECTURE VERIFICATION CHECKS PASSED!\n');
}

runArchitectureVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
