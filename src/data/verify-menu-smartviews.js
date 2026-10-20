/**
 * Automated Verification Script for Phase 7: Slide-up Navigation Menu & Smart Views
 * Run with: node src/data/verify-menu-smartviews.js
 */

import assert from 'node:assert';

// Mock localStorage for Node environment if running outside browser
const mockStorage = new Map();
if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    localStorage: {
      getItem(key) {
        return mockStorage.get(key) || null;
      },
      setItem(key, value) {
        mockStorage.set(key, String(value));
      },
      removeItem(key) {
        mockStorage.delete(key);
      },
      clear() {
        mockStorage.clear();
      },
    },
  };
}

async function runMenuSmartViewsVerification() {
  console.log('🧪 Starting Phase 7 Navigation Menu & Smart Views verification...\n');

  const { notesStore } = await import('./notesStore.js');

  // Reset store to fresh seed data
  notesStore.resetToSeed();

  // 1. Verify initial active notes and notebooks breakdown
  const initialActive = notesStore.notes.filter((n) => !n.trashed);
  assert.strictEqual(initialActive.length, 4, 'Starts with 4 active notes');

  const notebooksMap = initialActive.reduce((acc, note) => {
    const nb = note.notebook || 'Quick Notes';
    acc[nb] = (acc[nb] || 0) + 1;
    return acc;
  }, {});
  assert.ok(notebooksMap['Design Systems'] >= 1, 'Notebook "Design Systems" present');
  assert.ok(notebooksMap['Creative Direction'] >= 1, 'Notebook "Creative Direction" present');
  console.log('✓ Dynamic Notebooks breakdown calculated accurately');

  // 2. Verify Tags breakdown
  const tagsMap = initialActive.reduce((acc, note) => {
    (note.tags || []).forEach((t) => {
      acc[t] = (acc[t] || 0) + 1;
    });
    return acc;
  }, {});
  assert.ok(tagsMap['Frontend'] >= 1, 'Tag "Frontend" present in taxonomy');
  assert.ok(tagsMap['Design'] >= 1, 'Tag "Design" present in taxonomy');
  console.log('✓ Dynamic Tags breakdown calculated accurately');

  // 3. Test Soft-Delete to Trash
  notesStore.deleteNote('note-1', false);
  const afterSoftDelete = notesStore.notes.filter((n) => !n.trashed);
  const trashedNotes = notesStore.notes.filter((n) => n.trashed);

  assert.strictEqual(afterSoftDelete.length, 3, 'Active notes decreased to 3');
  assert.strictEqual(trashedNotes.length, 1, 'Trash count increased to 1');
  assert.strictEqual(trashedNotes[0].id, 'note-1', 'Trashed note is note-1');
  console.log('✓ Soft-delete to Trash verified');

  // 4. Test Restore Note from Trash
  notesStore.restoreNote('note-1');
  const afterRestore = notesStore.notes.filter((n) => !n.trashed);
  const trashAfterRestore = notesStore.notes.filter((n) => n.trashed);

  assert.strictEqual(afterRestore.length, 4, 'Active notes restored to 4');
  assert.strictEqual(trashAfterRestore.length, 0, 'Trash is now empty');
  console.log('✓ Note restoration from Trash verified');

  // 5. Test Permanent Purge
  notesStore.deleteNote('note-1', false); // soft-delete first
  notesStore.deleteNote('note-1', true);  // permanent purge
  const afterPurge = notesStore.notes.find((n) => n.id === 'note-1');
  assert.strictEqual(afterPurge, undefined, 'Note-1 permanently purged from store');
  assert.strictEqual(notesStore.notes.length, 3, 'Total notes reduced to 3');
  console.log('✓ Permanent purge verified');

  // 6. Test Notebook Creation & Filtering
  const brandNewNote = notesStore.saveNote({
    title: 'Brand Systems Overview',
    notebook: 'Brand Identity',
    tags: ['Brand', 'Design'],
    content: 'Guidelines on identity and voice.',
  });

  const brandNotes = notesStore.notes.filter(
    (n) => !n.trashed && n.notebook === 'Brand Identity'
  );
  assert.strictEqual(brandNotes.length, 1, 'New notebook contains 1 note');
  assert.strictEqual(brandNotes[0].id, brandNewNote.id, 'Found matching note in new notebook');
  console.log('✓ Notebook creation and filtering verified');

  console.log('\n🎉 ALL 6 PHASE 7 MENU & SMART VIEWS TESTS PASSED!\n');
}

runMenuSmartViewsVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
