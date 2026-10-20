/**
 * Automated Verification Script for Phase 6: Canvas Freehand Sketch Pad & Audio Memo Player
 * Run with: node src/data/verify-canvas-audio.js
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

async function runCanvasAudioVerification() {
  console.log('🧪 Starting Phase 6 Canvas Sketch Pad & Audio Memo Player verification...\n');

  const { notesStore } = await import('./notesStore.js');

  // Reset store to fresh seed data
  notesStore.resetToSeed();

  // 1. Verify Note 1 initial audioData
  const note1 = notesStore.getNoteById('note-1');
  assert.ok(note1, 'Must find note-1');
  assert.ok(note1.audioData, 'Note 1 must have initial audioData');
  assert.strictEqual(note1.audioData.duration, 74, 'Note 1 duration is 74 seconds');
  assert.strictEqual(note1.audioData.label, 'Audio Memo (1:14)', 'Note 1 audio label is formatted correctly');
  console.log('✓ Initial audio memo data schema verified');

  // 2. Attach a Canvas Sketch Data URL to Note 1
  const sampleSketchData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  notesStore.updateNote(note1.id, { sketchData: sampleSketchData });

  const noteWithSketch = notesStore.getNoteById('note-1');
  assert.strictEqual(noteWithSketch.sketchData, sampleSketchData, 'Canvas sketch data URL persisted in store');
  console.log('✓ Canvas sketch data attachment and persistence verified');

  // 3. Record / Attach New Audio Memo to Note 2
  const note2 = notesStore.getNoteById('note-2');
  assert.strictEqual(note2.audioData, null, 'Note 2 starts without audioData');

  const newAudioMemo = {
    duration: 45,
    label: 'Voice Memo (0:45)',
    recordedAt: new Date().toISOString(),
  };
  notesStore.updateNote(note2.id, { audioData: newAudioMemo });

  const note2Updated = notesStore.getNoteById('note-2');
  assert.ok(note2Updated.audioData, 'Note 2 has attached audioData');
  assert.strictEqual(note2Updated.audioData.duration, 45, 'Note 2 audio duration matches 45s');
  assert.strictEqual(note2Updated.audioData.label, 'Voice Memo (0:45)', 'Note 2 audio label matches');
  console.log('✓ New voice memo recording & persistence verified');

  // 4. Delete Audio Memo
  notesStore.updateNote(note2.id, { audioData: null });
  const note2DeletedAudio = notesStore.getNoteById('note-2');
  assert.strictEqual(note2DeletedAudio.audioData, null, 'Audio memo deleted and set to null');
  console.log('✓ Audio memo deletion verified');

  // 5. Clear Canvas Sketch
  notesStore.updateNote(note1.id, { sketchData: null });
  const note1ClearedSketch = notesStore.getNoteById('note-1');
  assert.strictEqual(note1ClearedSketch.sketchData, null, 'Canvas sketch cleared and set to null');
  console.log('✓ Canvas sketch clearance verified');

  // 6. Backup / JSON Export Integrity with Multi-Modal Attachments
  notesStore.updateNote(note1.id, { sketchData: sampleSketchData });
  const exportedJson = notesStore.exportAllAsJson();
  const parsed = JSON.parse(exportedJson);
  const exportedNote1 = parsed.find((n) => n.id === 'note-1');

  assert.strictEqual(exportedNote1.sketchData, sampleSketchData, 'JSON backup preserves sketchData');
  assert.strictEqual(exportedNote1.audioData.duration, 74, 'JSON backup preserves audioData');
  console.log('✓ Multi-modal attachments export and JSON backup integrity verified');

  console.log('\n🎉 ALL 6 PHASE 6 CANVAS & AUDIO TESTS PASSED!\n');
}

runCanvasAudioVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
