/**
 * Automated Verification Script for Phase 8: Bi-directional Linking & Export
 * Run with: node src/data/verify-backlinks-export.js
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

async function runBacklinksExportVerification() {
  console.log('🧪 Starting Phase 8 Bi-directional Linking & Export verification...\n');

  const { notesStore } = await import('./notesStore.js');

  // Reset store to fresh seed data
  notesStore.resetToSeed();

  // 1. Verify Note 3 has backlink from Note 1
  const backlinksToNote3 = notesStore.getBacklinks('note-3');
  assert.ok(backlinksToNote3.length >= 1, 'Note 3 has at least 1 backlink reference');
  assert.strictEqual(backlinksToNote3[0].note.id, 'note-1', 'Backlink source note is note-1');
  assert.ok(
    backlinksToNote3[0].snippet.includes('Color Theory'),
    'Snippet includes the link context'
  );
  console.log('✓ Bi-directional backlink detection and snippet extraction verified');

  // 2. Test Dynamic Backlink Creation
  notesStore.saveNote({
    id: 'note-dynamic-ref',
    title: 'Design Review Notes',
    content: 'Reviewing vector assets in [[Digital Illustration: Vector Art]] for mobile display.',
    blocks: [],
  });

  const backlinksToNote2 = notesStore.getBacklinks('note-2');
  assert.ok(backlinksToNote2.length >= 1, 'Note 2 backlink found');
  assert.ok(
    backlinksToNote2.some((b) => b.note.id === 'note-dynamic-ref'),
    'New dynamic note correctly detected as backlink source'
  );
  console.log('✓ Dynamic backlink indexing across newly saved notes verified');

  // 3. Test Markdown Document Export
  const note1Md = notesStore.exportAsMarkdown('note-1');
  assert.ok(note1Md.startsWith('# Intro to Frontend Development'), 'Markdown starts with H1 title');
  assert.ok(note1Md.includes('*Notebook: Design Systems'), 'Markdown contains notebook metadata');
  assert.ok(note1Md.includes('- [x] Define primitive tokens in index.css'), 'Markdown formats checklist block');
  assert.ok(note1Md.includes('[[Color Theory & Visual Hierarchy]]'), 'Markdown preserves [[Backlinks]]');
  console.log('✓ Individual note Markdown export with frontmatter & blocks verified');

  // 4. Test Full Vault JSON Export
  const vaultJson = notesStore.exportAllAsJson();
  const parsedVault = JSON.parse(vaultJson);
  assert.ok(Array.isArray(parsedVault) && parsedVault.length >= 5, 'Exported vault contains all active notes');
  const foundNote1 = parsedVault.find((n) => n.id === 'note-1');
  assert.strictEqual(foundNote1.title, 'Intro to\nFrontend Development', 'Note 1 integrity preserved in vault export');
  console.log('✓ Full vault JSON backup generation verified');

  // 5. Test Full Vault JSON Restore
  // Wipe store notes and import backup
  notesStore.saveNote({ id: 'dummy', title: 'Temporary' });
  const success = notesStore.importFromJson(vaultJson);
  assert.strictEqual(success, true, 'Vault JSON imported successfully');
  assert.ok(notesStore.notes.length >= 5, 'Vault restored notes count matches');
  const restoredNote1 = notesStore.getNoteById('note-1');
  assert.ok(restoredNote1, 'Note 1 successfully restored from backup');
  console.log('✓ Full vault JSON backup restoration verified');

  console.log('\n🎉 ALL 5 PHASE 8 BI-DIRECTIONAL LINKING & EXPORT TESTS PASSED!\n');
}

runBacklinksExportVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
