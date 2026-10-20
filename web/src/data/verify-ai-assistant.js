/**
 * Automated Verification Script for Phase 9: AI Assistant Action Sheet
 * Run with: node src/data/verify-ai-assistant.js
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

async function runAiAssistantVerification() {
  console.log('🧪 Starting Phase 9 AI Assistant Action Sheet verification...\n');

  const { aiAssistantService } = await import('../services/aiAssistantService.js');
  const { notesStore } = await import('./notesStore.js');

  // Reset store to fresh seed data
  notesStore.resetToSeed();
  const testNote = notesStore.getNote('note-1');
  assert.ok(testNote, 'Test note-1 exists in seed store');

  // 1. Test Summarize Note
  const summaryResult = aiAssistantService.summarizeNote(testNote);
  assert.ok(summaryResult.summary, 'Summary generated');
  assert.ok(typeof summaryResult.summary === 'string', 'Summary is string');
  assert.ok(summaryResult.summary.length > 20, 'Summary has substantial length');
  assert.ok(Array.isArray(summaryResult.keyPoints), 'Key points is an array');
  assert.ok(summaryResult.keyPoints.length >= 2, 'At least 2 key points generated');
  console.log('✓ AI Assistant: summarizeNote output verified');

  // 2. Test Extract Action Items
  const actionItems = aiAssistantService.extractActionItems(testNote);
  assert.ok(Array.isArray(actionItems), 'Action items is an array');
  assert.ok(actionItems.length > 0, 'Extracted at least 1 action item');
  assert.ok(actionItems[0].id && actionItems[0].text, 'Item has id and text');
  assert.strictEqual(actionItems[0].completed, false, 'Action item initial state is false');
  console.log('✓ AI Assistant: extractActionItems structure verified');

  // 3. Test Generate Tags
  const suggestedTags = aiAssistantService.generateTags(testNote);
  assert.ok(Array.isArray(suggestedTags), 'Suggested tags is an array');
  assert.ok(suggestedTags.length > 0, 'At least 1 tag suggested');
  // Check that already present tags are not duplicated
  testNote.tags.forEach((existingTag) => {
    assert.ok(
      !suggestedTags.map((t) => t.toLowerCase()).includes(existingTag.toLowerCase()),
      `Suggested tags do not duplicate existing tag ${existingTag}`
    );
  });
  console.log('✓ AI Assistant: generateTags taxonomy & deduplication verified');

  // 4. Test Expand & Polish
  const rawNote = {
    title: 'Component Design',
    content: 'Need to structure cards and buttons with dark background.',
  };
  const polishedContent = aiAssistantService.expandOrPolish(rawNote);
  assert.ok(polishedContent.startsWith('# Component Design'), 'Polished note formats title header');
  assert.ok(polishedContent.includes('## Key Takeaways'), 'Polished note adds structured takeaways section');
  console.log('✓ AI Assistant: expandOrPolish markdown structure verified');

  // 5. Test Store Integration: Applying AI Checklist as Block
  const currentBlocks = testNote.blocks || [];
  const nextBlock = {
    id: `block-ai-${Date.now()}`,
    type: 'checklist',
    number: String(currentBlocks.length + 1).padStart(2, '0'),
    title: 'AI Action Items',
    items: actionItems,
  };
  notesStore.updateNote('note-1', {
    blocks: [...currentBlocks, nextBlock],
  });

  const updatedNote = notesStore.getNote('note-1');
  const addedBlock = updatedNote.blocks.find((b) => b.id === nextBlock.id);
  assert.ok(addedBlock, 'AI checklist block successfully saved into note store');
  assert.strictEqual(addedBlock.items.length, actionItems.length, 'Checklist items match extracted tasks');
  console.log('✓ AI Action: Insert as Checklist Block persists in notesStore');

  // 6. Test Store Integration: Applying AI Tags
  const initialTags = updatedNote.tags || [];
  const mergedTags = Array.from(new Set([...initialTags, ...suggestedTags]));
  notesStore.updateNote('note-1', { tags: mergedTags });

  const finalNote = notesStore.getNote('note-1');
  suggestedTags.forEach((t) => {
    assert.ok(finalNote.tags.includes(t), `Tag ${t} persisted in note tags`);
  });
  console.log('✓ AI Action: Applying Suggested Tags persists in notesStore');

  console.log('\n🎉 ALL 6/6 AI ASSISTANT VERIFICATION CHECKS PASSED!\n');
}

runAiAssistantVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
