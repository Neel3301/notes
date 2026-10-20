/**
 * Automated Verification Script for notesStore and seedNotes
 * Run with: node src/data/verify-store.js
 */

import assert from 'node:assert';

// Minimal mock localStorage for Node CLI environment
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

async function runVerification() {
  console.log('🧪 Starting notesStore verification...');

  // 1. Verify seedNotes dataset
  const { initialSeedNotes } = await import('./seedNotes.js');
  assert.strictEqual(Array.isArray(initialSeedNotes), true, 'Seed notes must be an array');
  assert.strictEqual(initialSeedNotes.length, 4, 'Seed notes must contain exactly 4 items');
  console.log('✓ Seed notes dataset contains 4 initial notes');

  // Verify design reference colors
  const validColors = ['blue', 'light', 'yellow'];
  initialSeedNotes.forEach((note) => {
    assert.strictEqual(
      validColors.includes(note.color),
      true,
      `Note ${note.id} has invalid color token ${note.color}`
    );
  });
  console.log('✓ All seed notes map strictly to design system card colors (blue, light, yellow)');

  // 2. Verify notesStore operations
  const { notesStore } = await import('./notesStore.js');

  // Initial load
  const notes = notesStore.getNotes();
  assert.strictEqual(notes.length, 4, 'Store must initialize with 4 seed notes');
  console.log('✓ notesStore initialized with 4 seed notes');

  // getNoteById
  const note1 = notesStore.getNoteById('note-1');
  assert.ok(note1, 'Must find note-1');
  assert.strictEqual(note1.author, 'Alexander Spatari');
  assert.strictEqual(note1.color, 'blue');
  console.log('✓ getNoteById("note-1") returns correct note');

  // toggleLike
  const initialLiked = note1.liked;
  const newLiked = notesStore.toggleLike('note-1');
  assert.strictEqual(newLiked, !initialLiked, 'toggleLike must flip boolean');
  assert.strictEqual(notesStore.getNoteById('note-1').liked, newLiked, 'Updated liked must persist in store');
  console.log(`✓ toggleLike() flipped liked state to ${newLiked}`);

  // togglePin
  const initialPinned = note1.pinned;
  const newPinned = notesStore.togglePin('note-1');
  assert.strictEqual(newPinned, !initialPinned, 'togglePin must flip boolean');
  console.log(`✓ togglePin() flipped pinned state to ${newPinned}`);

  // saveNote (create new)
  const newNote = notesStore.saveNote({
    id: 'test-note-99',
    title: 'Mobile Architecture\nDeep Dive',
    author: 'Test Engineer',
    color: 'yellow',
    tags: ['Architecture', 'Mobile'],
    content: 'Testing reactive notes store creation.',
    blocks: [
      { id: 'b1', type: 'text', content: 'Block 1 content' },
    ],
  });
  assert.strictEqual(notesStore.getNotes().length, 5, 'Store count must increment to 5');
  assert.strictEqual(notesStore.getNoteById('test-note-99').title, 'Mobile Architecture\nDeep Dive');
  console.log('✓ saveNote() created new note successfully');

  // saveNote (update existing)
  notesStore.saveNote({
    id: 'test-note-99',
    title: 'Mobile Architecture\nUpdated Title',
  });
  assert.strictEqual(notesStore.getNoteById('test-note-99').title, 'Mobile Architecture\nUpdated Title');
  console.log('✓ saveNote() updated existing note');

  // filterNotes by search query
  const searchResults = notesStore.filterNotes({ query: 'Frontend' });
  assert.ok(searchResults.length >= 1, 'Search query "Frontend" should find at least 1 note');
  console.log(`✓ filterNotes(query: "Frontend") returned ${searchResults.length} note(s)`);

  // filterNotes by tag
  const tagResults = notesStore.filterNotes({ tag: 'Color' });
  assert.strictEqual(tagResults.length, 1, 'Tag "Color" should match note-3');
  console.log(`✓ filterNotes(tag: "Color") returned note: ${tagResults[0].title.replace('\n', ' ')}`);

  // deleteNote (soft delete to trash)
  notesStore.deleteNote('test-note-99', false);
  const trashedNote = notesStore.getNoteById('test-note-99');
  assert.strictEqual(trashedNote.trashed, true, 'Note must have trashed: true');
  assert.strictEqual(notesStore.filterNotes({ trashed: false }).length, 4, 'Active notes must be 4');
  assert.strictEqual(notesStore.filterNotes({ trashed: true }).length, 1, 'Trash count must be 1');
  console.log('✓ deleteNote() soft-deleted note to trash');

  // restoreNote
  notesStore.restoreNote('test-note-99');
  assert.strictEqual(notesStore.getNoteById('test-note-99').trashed, false, 'Restored note must have trashed: false');
  console.log('✓ restoreNote() successfully restored note from trash');

  // Export Markdown
  const markdown = notesStore.exportAsMarkdown('note-1');
  assert.ok(markdown.includes('# Intro to Frontend Development'), 'Markdown export must contain note title');
  assert.ok(markdown.includes('Alexander Spatari'), 'Markdown export must contain author');
  console.log('✓ exportAsMarkdown() generated formatted markdown document');

  // Export JSON & Import
  const jsonBackup = notesStore.exportAllAsJson();
  assert.ok(jsonBackup.startsWith('['), 'JSON backup must be a serialized array');
  const importSuccess = notesStore.importFromJson(jsonBackup);
  assert.strictEqual(importSuccess, true, 'importFromJson must succeed');
  console.log('✓ exportAllAsJson() and importFromJson() verified');

  // resetToSeed
  notesStore.resetToSeed();
  assert.strictEqual(notesStore.getNotes().length, 4, 'resetToSeed must restore count to 4');
  console.log('✓ resetToSeed() successfully reset store to initial seed');

  console.log('\n🎉 ALL 12 VERIFICATION ASSERTIONS PASSED SUCCESSFULLY!');
}

runVerification().catch((err) => {
  console.error('\n❌ VERIFICATION FAILED:', err);
  process.exit(1);
});
