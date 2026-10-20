/**
 * Automated Verification Script for Phase 5: Modular Block Engine
 * Run with: node src/data/verify-blocks.js
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

async function runBlockVerification() {
  console.log('🧪 Starting Phase 5 Modular Block Engine verification...\n');

  const { notesStore } = await import('./notesStore.js');

  // Reset store to fresh seed data
  notesStore.resetToSeed();

  // 1. Verify Note 1 blocks structure
  const note1 = notesStore.getNoteById('note-1');
  assert.ok(Array.isArray(note1.blocks) && note1.blocks.length >= 3, 'Note 1 has at least 3 initial blocks');
  assert.strictEqual(note1.blocks[0].type, 'text', 'Block 1 is text block');
  assert.strictEqual(note1.blocks[1].type, 'checklist', 'Block 2 is checklist block');
  assert.strictEqual(note1.blocks[2].type, 'callout', 'Block 3 is callout block');
  console.log('✓ Initial blocks schema and types verified');

  // 2. Test interactive checklist toggle
  const checklistBlock = note1.blocks.find((b) => b.type === 'checklist');
  assert.ok(checklistBlock && checklistBlock.items.length > 0, 'Checklist block has interactive items');
  const firstItem = checklistBlock.items[0];
  const initialStatus = firstItem.completed;

  // Toggle first item
  const updatedBlocks = note1.blocks.map((b) => {
    if (b.id !== checklistBlock.id) return b;
    return {
      ...b,
      items: b.items.map((item) =>
        item.id === firstItem.id ? { ...item, completed: !item.completed } : item
      ),
    };
  });
  notesStore.updateNote(note1.id, { blocks: updatedBlocks });

  const note1Refreshed = notesStore.getNoteById('note-1');
  const refreshedFirstItem = note1Refreshed.blocks
    .find((b) => b.id === checklistBlock.id)
    .items.find((i) => i.id === firstItem.id);

  assert.strictEqual(refreshedFirstItem.completed, !initialStatus, 'Checklist item completion toggled and persisted in store');
  console.log('✓ Checklist item toggle and state persistence verified');

  // 3. Test adding a new Code block
  const newCodeBlock = {
    id: 'block-test-code',
    number: String(note1Refreshed.blocks.length + 1).padStart(2, '0'),
    type: 'code',
    title: 'CSS Custom Properties',
    language: 'css',
    content: ':root { --color-bg: #000000; }',
  };

  const blocksWithCode = [...note1Refreshed.blocks, newCodeBlock];
  notesStore.updateNote(note1.id, { blocks: blocksWithCode });

  const noteWithCode = notesStore.getNoteById('note-1');
  assert.strictEqual(noteWithCode.blocks.length, note1Refreshed.blocks.length + 1, 'New block added successfully');
  assert.strictEqual(noteWithCode.blocks[noteWithCode.blocks.length - 1].type, 'code', 'New block is code block');
  console.log('✓ Modular block addition (Code type) verified');

  // 4. Test block reordering and renumbering
  const reordered = [
    noteWithCode.blocks[1], // checklist first
    noteWithCode.blocks[0], // text second
    ...noteWithCode.blocks.slice(2),
  ].map((b, idx) => ({ ...b, number: String(idx + 1).padStart(2, '0') }));

  notesStore.updateNote(note1.id, { blocks: reordered });
  const noteReordered = notesStore.getNoteById('note-1');
  assert.strictEqual(noteReordered.blocks[0].type, 'checklist', 'Checklist moved to first position');
  assert.strictEqual(noteReordered.blocks[0].number, '01', 'First position renumbered to 01');
  assert.strictEqual(noteReordered.blocks[1].type, 'text', 'Text moved to second position');
  assert.strictEqual(noteReordered.blocks[1].number, '02', 'Second position renumbered to 02');
  console.log('✓ Block reordering and two-digit renumbering verified');

  // 5. Test block deletion
  const blocksAfterDelete = noteReordered.blocks.filter((b) => b.id !== 'block-test-code')
    .map((b, idx) => ({ ...b, number: String(idx + 1).padStart(2, '0') }));

  notesStore.updateNote(note1.id, { blocks: blocksAfterDelete });
  const noteAfterDelete = notesStore.getNoteById('note-1');
  assert.ok(
    !noteAfterDelete.blocks.some((b) => b.id === 'block-test-code'),
    'Block deleted and removed from store'
  );
  console.log('✓ Block deletion verified');

  // 6. Test search indexing across new modular blocks
  const searchResults = notesStore.filterNotes('Design tokens provide the glue');
  assert.ok(searchResults.length > 0 && searchResults[0].id === 'note-1', 'Search finds text nested inside modular blocks');
  console.log('✓ Search query indexing across modular blocks verified');

  console.log('\n🎉 ALL 6 PHASE 5 MODULAR BLOCK ENGINE TESTS PASSED!\n');
}

runBlockVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
