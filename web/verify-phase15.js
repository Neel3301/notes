/**
 * Phase 15 Automated Verification Suite: Secure Note Sharing Functionality
 * Validates requirements SHR-01, SHR-02, and SHR-03.
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

console.log('===================================================================');
console.log('  Phase 15: Public & Private Secure Note-Sharing Audit            ');
console.log('===================================================================\n');

// 1. Files existence check
const sharingServicePath = path.join(rootDir, 'web', 'src', 'services', 'sharingService.js');
const shareModalPath = path.join(rootDir, 'web', 'src', 'components', 'note', 'ShareNoteModal.jsx');
const sharedNoteScreenPath = path.join(rootDir, 'web', 'src', 'screens', 'SharedNoteScreen.jsx');
const sharedNotesListPath = path.join(rootDir, 'web', 'src', 'screens', 'SharedNotesListScreen.jsx');
const appJsxPath = path.join(rootDir, 'web', 'src', 'App.jsx');

assert(fs.existsSync(sharingServicePath), 'sharingService.js exists');
assert(fs.existsSync(shareModalPath), 'ShareNoteModal.jsx exists');
assert(fs.existsSync(sharedNoteScreenPath), 'SharedNoteScreen.jsx exists');
assert(fs.existsSync(sharedNotesListPath), 'SharedNotesListScreen.jsx exists');
assert(fs.existsSync(appJsxPath), 'App.jsx exists');

// 2. SHR-01 & SHR-02: Service Code Inspection
if (fs.existsSync(sharingServicePath)) {
  const content = fs.readFileSync(sharingServicePath, 'utf-8');
  assert(content.includes('shareNotePublicly'), 'sharingService exports shareNotePublicly (SHR-01)');
  assert(content.includes('shareNotePrivately'), 'sharingService exports shareNotePrivately (SHR-02)');
  assert(content.includes('fetchAndDecryptSharedNote'), 'sharingService exports fetchAndDecryptSharedNote');
  assert(content.includes('isSlugAvailable'), 'sharingService exports isSlugAvailable (SHR-03)');
  assert(content.includes('generateRandomSlug'), 'sharingService exports generateRandomSlug');
}

// 3. ShareNoteModal Component Inspection
if (fs.existsSync(shareModalPath)) {
  const content = fs.readFileSync(shareModalPath, 'utf-8');
  assert(content.includes('Public Sharing'), 'ShareNoteModal supports Public Sharing mode');
  assert(content.includes('Private (Password)'), 'ShareNoteModal supports Private Password Protected mode');
  assert(content.includes('Custom Link Name'), 'ShareNoteModal provides custom slug input (SHR-03)');
  assert(content.includes('Randomize'), 'ShareNoteModal provides random slug generator');
  assert(content.includes('Copy'), 'ShareNoteModal provides Copy Link action');
}

// 4. SharedNoteScreen Recipient Viewer Inspection
if (fs.existsSync(sharedNoteScreenPath)) {
  const content = fs.readFileSync(sharedNoteScreenPath, 'utf-8');
  assert(content.includes('This note is password protected'), 'SharedNoteScreen gates private notes with password prompt');
  assert(content.includes('Decrypt Note'), 'SharedNoteScreen provides Decrypt Note action');
  assert(content.includes('Import into My Notes'), 'SharedNoteScreen provides 1-tap import into local library');
  assert(content.includes('MarkdownRenderer'), 'SharedNoteScreen renders markdown body');
  assert(content.includes('BlockList'), 'SharedNoteScreen renders modular blocks');
}

// 5. Functional Cryptographic Sharing Verification (Node 18+ Web Crypto)
async function testSharingFlows() {
  console.log('\n--- Running Functional Sharing Verification ---');
  const sharingService = await import('./src/services/sharingService.js');

  const testNote = {
    id: 'note-share-42',
    title: 'Public Architecture RFC',
    author: 'Lead Architect',
    notebook: 'RFCs',
    color: 'blue',
    content: '## Public RFC Details\n\n- E2EE architecture\n- Decentralized sharing',
    blocks: [{ id: 'b1', title: 'Scope', content: 'Web and Mobile parity' }],
  };

  // Test A: SHR-01 Public Sharing Flow
  const publicShare = await sharingService.shareNotePublicly(testNote, 'test-public-rfc');
  assert(publicShare.slug === 'test-public-rfc', 'Public share uses specified custom slug');
  assert(publicShare.shareUrl.includes('test-public-rfc'), 'Public share URL contains slug');
  assert(publicShare.isPrivate === false, 'Public share flag is false');

  // Recipient fetches public note without password
  const publicFetched = await sharingService.fetchAndDecryptSharedNote('test-public-rfc', null);
  assert(publicFetched.isLocked === false, 'Public note is NOT locked');
  assert(publicFetched.note.title === testNote.title, 'Recipient reads decrypted public title');
  assert(publicFetched.note.content === testNote.content, 'Recipient reads decrypted public content');

  // Test B: SHR-02 Private Sharing Flow
  const privateSecret = 'EdsY-P@ssw0rd-2026!';
  const privateShare = await sharingService.shareNotePrivately(
    { ...testNote, title: 'Confidential Strategy' },
    privateSecret,
    'test-private-rfc'
  );
  assert(privateShare.slug === 'test-private-rfc', 'Private share uses custom slug');
  assert(privateShare.isPrivate === true, 'Private share flag is true');

  // Recipient without password gets locked prompt
  const lockedCheck = await sharingService.fetchAndDecryptSharedNote('test-private-rfc', null);
  assert(lockedCheck.isLocked === true, 'Private note without password is locked');

  // Recipient with INCORRECT password gets rejection
  const wrongPasswordCheck = await sharingService.fetchAndDecryptSharedNote('test-private-rfc', 'wrong-pass');
  assert(wrongPasswordCheck.isLocked === true, 'Wrong password fails to unlock private note');
  assert(wrongPasswordCheck.error === 'INCORRECT_PASSWORD', 'Returns INCORRECT_PASSWORD error code');

  // Recipient with CORRECT password decrypts successfully
  const correctPasswordCheck = await sharingService.fetchAndDecryptSharedNote('test-private-rfc', privateSecret);
  assert(correctPasswordCheck.isLocked === false, 'Correct password unlocks private note');
  assert(correctPasswordCheck.note.title === 'Confidential Strategy', 'Decrypted private title matches original');
  assert(correctPasswordCheck.note.content === testNote.content, 'Decrypted private content matches original');

  // Test C: SHR-03 Custom Slug Availability
  const isAvailableForNew = await sharingService.isSlugAvailable('brand-new-slug-unique-99');
  assert(isAvailableForNew === true, 'Unused custom slug is marked available');

  const isTaken = await sharingService.isSlugAvailable('test-public-rfc', 'different-note-id');
  assert(isTaken === false, 'Existing slug is marked taken for different note');
}

testSharingFlows()
  .then(() => {
    const total = results.length;
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;

    console.log('\n===================================================================');
    console.log(`  Phase 15 Audit Result: ${passed}/${total} assertions passed (${failed} failed)`);
    console.log('===================================================================');

    if (failed > 0) {
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('Sharing test execution error:', err);
    process.exit(1);
  });
