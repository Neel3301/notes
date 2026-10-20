/**
 * Automated Verification Script for Phase 3: All Notes Catalog & Live Search
 * Run with: node src/data/verify-catalog.js
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

async function runCatalogVerification() {
  console.log('🧪 Starting Phase 3 All Notes Catalog & Search verification...');

  const { notesStore } = await import('./notesStore.js');

  // Reset to initial seed state
  notesStore.resetToSeed();
  const allNotes = notesStore.getNotes();
  assert.strictEqual(allNotes.length, 4, 'Must have 4 seed notes');
  console.log('✓ Store initialized with 4 seed notes');

  // 1. Multi-field Search Verification
  // By Title
  const titleSearch = notesStore.filterNotes({ query: 'Frontend' });
  assert.ok(titleSearch.length >= 1, 'Search "Frontend" should find notes');
  assert.ok(titleSearch.some((n) => n.id === 'note-1'));
  console.log('✓ Multi-field search finds notes by Title');

  // By Author
  const authorSearch = notesStore.filterNotes({ query: 'Studio Koto' });
  assert.strictEqual(authorSearch.length, 1);
  assert.strictEqual(authorSearch[0].id, 'note-2');
  console.log('✓ Multi-field search finds notes by Author');

  // By Content
  const contentSearch = notesStore.filterNotes({ query: 'contrast' });
  assert.ok(contentSearch.length >= 2, 'Search "contrast" should match multiple notes');
  console.log(`✓ Multi-field search finds notes by Content body (${contentSearch.length} found)`);

  // Empty query
  const emptyQuerySearch = notesStore.filterNotes({ query: 'nonexistent_query_xyz' });
  assert.strictEqual(emptyQuerySearch.length, 0, 'Non-matching query returns 0 notes');
  console.log('✓ Empty results correctly handled for non-matching queries');

  // 2. Tag Pill Filter Verification
  const designTag = notesStore.filterNotes({ tag: 'Design' });
  assert.ok(designTag.length >= 2, 'Tag "Design" should match at least 2 notes');
  console.log(`✓ Tag filter "Design" returned ${designTag.length} notes`);

  const artTag = notesStore.filterNotes({ tag: 'Art' });
  assert.strictEqual(artTag.length, 1);
  assert.strictEqual(artTag[0].id, 'note-2');
  console.log('✓ Tag filter "Art" returned note-2');

  // 3. Favorites Filter Verification
  const favorites = notesStore.filterNotes({ liked: true });
  assert.strictEqual(favorites.length, 2, 'Seed data has 2 liked notes (note-1, note-3)');
  assert.ok(favorites.every((n) => n.liked === true));
  console.log('✓ Favorites filter returns only liked notes');

  // 4. Live Favorite Toggle from Catalog
  const note4Initial = notesStore.getNoteById('note-4').liked;
  assert.strictEqual(note4Initial, false);

  notesStore.toggleLike('note-4');
  assert.strictEqual(notesStore.getNoteById('note-4').liked, true);
  const updatedFavorites = notesStore.filterNotes({ liked: true });
  assert.strictEqual(updatedFavorites.length, 3, 'Favorites count increments to 3');
  console.log('✓ Catalog favorite heart toggle immediately updates live store and filter');

  // Restore note-4
  notesStore.toggleLike('note-4');

  // 5. Combined Search + Tag Filter
  const combined = notesStore.filterNotes({ query: 'Milk', tag: 'Design' });
  assert.strictEqual(combined.length, 1);
  assert.strictEqual(combined[0].id, 'note-3');
  console.log('✓ Combined Tag + Query filter accurately isolates single note');

  console.log('\n🎉 ALL 8 CATALOG VERIFICATION ASSERTIONS PASSED SUCCESSFULLY!');
}

runCatalogVerification().catch((err) => {
  console.error('\n❌ CATALOG VERIFICATION FAILED:', err);
  process.exit(1);
});
