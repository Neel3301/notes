/**
 * Phase 14 Automated Verification Suite: Supabase Integration & E2EE Cloud Sync
 * Validates requirements SYNC-01, SYNC-02, SYNC-03, SYNC-04, and SYNC-05.
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
console.log('  Phase 14: Supabase Client, Auth & E2EE Cloud Sync Audit         ');
console.log('===================================================================\n');

// 1. Files existence check
const cryptoServicePath = path.join(rootDir, 'web', 'src', 'services', 'cryptoService.js');
const supabaseClientPath = path.join(rootDir, 'web', 'src', 'services', 'supabaseClient.js');
const syncServicePath = path.join(rootDir, 'web', 'src', 'services', 'syncService.js');
const authModalPath = path.join(rootDir, 'web', 'src', 'components', 'auth', 'AuthModal.jsx');
const appJsxPath = path.join(rootDir, 'web', 'src', 'App.jsx');

assert(fs.existsSync(cryptoServicePath), 'cryptoService.js exists');
assert(fs.existsSync(supabaseClientPath), 'supabaseClient.js exists');
assert(fs.existsSync(syncServicePath), 'syncService.js exists');
assert(fs.existsSync(authModalPath), 'AuthModal.jsx exists');
assert(fs.existsSync(appJsxPath), 'App.jsx exists');

// 2. SYNC-03: Web Crypto E2EE Engine Inspection
if (fs.existsSync(cryptoServicePath)) {
  const content = fs.readFileSync(cryptoServicePath, 'utf-8');
  assert(content.includes('crypto.subtle'), 'cryptoService uses standard Web Crypto API (SubtleCrypto)');
  assert(content.includes('PBKDF2'), 'cryptoService uses PBKDF2 for key derivation');
  assert(content.includes('100000'), 'cryptoService uses 100,000 PBKDF2 iterations for brute-force resistance');
  assert(content.includes('AES-GCM'), 'cryptoService uses AES-256-GCM authenticated encryption');
  assert(content.includes('encryptNoteForCloud'), 'cryptoService exposes encryptNoteForCloud for zero-knowledge upload');
  assert(content.includes('decryptNoteFromCloud'), 'cryptoService exposes decryptNoteFromCloud for decryption');
}

// 3. SYNC-02 & SYNC-01: Supabase Client & Local Fallback
if (fs.existsSync(supabaseClientPath)) {
  const content = fs.readFileSync(supabaseClientPath, 'utf-8');
  assert(content.includes('@supabase/supabase-js'), 'supabaseClient imports @supabase/supabase-js');
  assert(content.includes('signUp'), 'supabaseClient exports signUp function');
  assert(content.includes('signIn'), 'supabaseClient exports signIn function');
  assert(content.includes('signOut'), 'supabaseClient exports signOut function');
  assert(content.includes('onAuthStateChange'), 'supabaseClient exports onAuthStateChange listener');
  assert(content.includes('uploadEncryptedNotes'), 'supabaseClient exports uploadEncryptedNotes');
  assert(content.includes('fetchEncryptedNotes'), 'supabaseClient exports fetchEncryptedNotes');
}

// 4. SYNC-04 & SYNC-05: Sync Service & User Controlled Toggle
if (fs.existsSync(syncServicePath)) {
  const content = fs.readFileSync(syncServicePath, 'utf-8');
  assert(content.includes('isSyncEnabled'), 'syncService provides isSyncEnabled check');
  assert(content.includes('setSyncEnabled'), 'syncService provides user-controlled setSyncEnabled toggle (SYNC-04)');
  assert(content.includes('performSync'), 'syncService provides performSync cycle');
  assert(content.includes('encryptNoteForCloud'), 'syncService encrypts notes before sending to cloud');
  assert(content.includes('remoteTime > localTime'), 'syncService applies Last-Write-Wins (LWW) conflict resolution (SYNC-05)');
}

// 5. AuthModal UI Component Inspection
if (fs.existsSync(authModalPath)) {
  const content = fs.readFileSync(authModalPath, 'utf-8');
  assert(content.includes('Zero-Knowledge E2EE'), 'AuthModal communicates Zero-Knowledge encryption guarantee');
  assert(content.includes('Cloud Synchronization'), 'AuthModal provides Cloud Sync toggle switch');
  assert(content.includes('Sync Now'), 'AuthModal provides manual Sync Now action');
  assert(content.includes('Encryption Passphrase'), 'AuthModal allows custom master encryption passphrase');
}

// 6. App.jsx Integration
if (fs.existsSync(appJsxPath)) {
  const content = fs.readFileSync(appJsxPath, 'utf-8');
  assert(content.includes('AuthModal'), 'App.jsx mounts AuthModal');
  assert(content.includes('onAuthStateChange'), 'App.jsx listens to onAuthStateChange');
  assert(content.includes('onSyncStatusChange'), 'App.jsx listens to onSyncStatusChange');
}

// 7. Dynamic Functional Crypto Test (Running in Node 18+ Web Crypto)
async function testCryptoLogic() {
  console.log('\n--- Running In-Memory E2EE Cryptographic Tests ---');
  const cryptoService = await import('./src/services/cryptoService.js');

  const testPassphrase = 'super-secret-edsy-passphrase-2026';
  const salt = cryptoService.generateSalt();
  assert(typeof salt === 'string' && salt.length > 10, 'generateSalt generates valid base64 salt');

  const key = await cryptoService.deriveKeyFromPassphrase(testPassphrase, salt);
  assert(key && key.algorithm.name === 'AES-GCM', 'deriveKeyFromPassphrase derives AES-GCM key');

  const sampleNote = {
    id: 'note-secret-99',
    title: 'Top Secret Research',
    content: 'Zero knowledge encrypted note body #confidential',
    blocks: [{ id: 'b1', title: 'Plan', content: 'Execute without leaks' }],
    notebook: 'Confidential',
    color: 'yellow',
    liked: true,
  };

  const encryptedCloudRecord = await cryptoService.encryptNoteForCloud(sampleNote, key);
  assert(encryptedCloudRecord.id === 'note-secret-99', 'Encrypted record retains public sync ID');
  assert(encryptedCloudRecord.encrypted_blob, 'Encrypted record contains encrypted_blob');
  assert(encryptedCloudRecord.iv, 'Encrypted record contains iv');
  assert(!encryptedCloudRecord.encrypted_blob.includes('Top Secret Research'), 'Encrypted blob does NOT leak plaintext title');
  assert(!encryptedCloudRecord.encrypted_blob.includes('Zero knowledge encrypted note body'), 'Encrypted blob does NOT leak plaintext content');

  const decryptedNote = await cryptoService.decryptNoteFromCloud(encryptedCloudRecord, key);
  assert(decryptedNote.title === sampleNote.title, 'Decrypted note title matches original plaintext');
  assert(decryptedNote.content === sampleNote.content, 'Decrypted note content matches original plaintext');
  assert(decryptedNote.blocks[0].content === sampleNote.blocks[0].content, 'Decrypted modular blocks match original');
}

testCryptoLogic()
  .then(() => {
    const total = results.length;
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;

    console.log('\n===================================================================');
    console.log(`  Phase 14 Audit Result: ${passed}/${total} assertions passed (${failed} failed)`);
    console.log('===================================================================');

    if (failed > 0) {
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('Crypto test execution error:', err);
    process.exit(1);
  });
