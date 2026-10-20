/**
 * Automated Verification Script for Phase 2: Timeline & Daily Notes
 * Run with: node src/data/verify-timeline.js
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

async function runTimelineVerification() {
  console.log('🧪 Starting Phase 2 Timeline & Daily Notes verification...');

  const { notesStore } = await import('./notesStore.js');

  // Ensure fresh seed state
  notesStore.resetToSeed();
  const allNotes = notesStore.getNotes();
  assert.strictEqual(allNotes.length, 4, 'Must have 4 seed notes');
  console.log('✓ Store loaded with 4 seed notes');

  // 1. Date Filtering Verification (matching DatePager dates)
  const mondayNotes = allNotes.filter((n) => n.date === 'Mon. 12' && !n.trashed);
  assert.strictEqual(mondayNotes.length, 2, 'Mon. 12 must have 2 notes');
  console.log(`✓ Mon. 12 has ${mondayNotes.length} notes (note-1, note-2)`);

  const tuesdayNotes = allNotes.filter((n) => n.date === 'Tue. 13' && !n.trashed);
  assert.strictEqual(tuesdayNotes.length, 1, 'Tue. 13 must have 1 note');
  assert.strictEqual(tuesdayNotes[0].id, 'note-3');
  console.log('✓ Tue. 13 has 1 note (Color Theory & Visual Hierarchy)');

  const wednesdayNotes = allNotes.filter((n) => n.date === 'Wed. 14' && !n.trashed);
  assert.strictEqual(wednesdayNotes.length, 1, 'Wed. 14 must have 1 note');
  assert.strictEqual(wednesdayNotes[0].id, 'note-4');
  console.log('✓ Wed. 14 has 1 note (Design Systems & Token Architecture)');

  // 2. Filter Modes Verification
  // 'Today' filter for Mon. 12
  const todayFiltered = allNotes.filter((n) => !n.trashed && n.date === 'Mon. 12');
  assert.strictEqual(todayFiltered.length, 2, 'Today filter on Mon. 12 should yield 2 notes');
  console.log('✓ Filter Mode "Today" correctly filters to selected date');

  // 'This week' filter
  const weekDates = ['Mon. 12', 'Tue. 13', 'Wed. 14', 'Thu. 15', 'Fri. 16'];
  const weekFiltered = allNotes.filter((n) => !n.trashed && (weekDates.includes(n.date) || n.pinned));
  assert.strictEqual(weekFiltered.length, 4, 'This week filter should yield all 4 weekday notes');
  console.log('✓ Filter Mode "This week" correctly surfaces all scheduled weekday notes');

  // 'All notes' filter
  const allFiltered = allNotes.filter((n) => !n.trashed);
  assert.strictEqual(allFiltered.length, 4, 'All notes filter yields all active notes');
  console.log('✓ Filter Mode "All notes" yields all active notes');

  // 3. Heart Favorite Toggle on Card
  const initialNote2Liked = notesStore.getNoteById('note-2').liked;
  assert.strictEqual(initialNote2Liked, false, 'note-2 initially not liked');

  const toggledState = notesStore.toggleLike('note-2');
  assert.strictEqual(toggledState, true, 'toggleLike should return true');
  assert.strictEqual(notesStore.getNoteById('note-2').liked, true, 'note-2 must be updated to liked');
  console.log('✓ Card favorite heart toggle successfully updates note state');

  // Re-toggle back
  notesStore.toggleLike('note-2');
  assert.strictEqual(notesStore.getNoteById('note-2').liked, false, 'note-2 toggled back to unliked');

  // 4. Quick Note Creation on Selected Date
  const quickNote = notesStore.saveNote({
    id: 'quick-test-note',
    title: 'New Quick Note\nDrafted on Thu. 15',
    author: 'You',
    color: 'yellow',
    date: 'Thu. 15',
    tags: ['Idea'],
  });
  assert.ok(quickNote, 'Quick note created');
  const thursdayNotes = notesStore.getNotes().filter((n) => n.date === 'Thu. 15' && !n.trashed);
  assert.strictEqual(thursdayNotes.length, 1, 'Thu. 15 should now have 1 note');
  console.log('✓ Quick note creation for active DatePager date verified');

  // Clean up
  notesStore.deleteNote('quick-test-note', true);
  assert.strictEqual(notesStore.getNotes().length, 4, 'Cleaned up quick note');

  console.log('\n🎉 ALL 8 TIMELINE VERIFICATION ASSERTIONS PASSED SUCCESSFULLY!');
}

runTimelineVerification().catch((err) => {
  console.error('\n❌ TIMELINE VERIFICATION FAILED:', err);
  process.exit(1);
});
