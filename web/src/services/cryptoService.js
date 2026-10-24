/**
 * cryptoService.js
 * Client-Side Zero-Knowledge End-to-End Encryption (E2EE) Engine for Edsy Notes.
 *
 * Requirements:
 * - SYNC-03: Zero-knowledge client-side encryption using Web Crypto API.
 * - AES-256-GCM authenticated encryption for all note contents, blocks, sketches, and audio.
 * - PBKDF2 key derivation with SHA-256 (100,000 iterations) from user passphrase.
 * - No plaintext note data ever reaches the cloud or network.
 */

// Global in-memory storage for active derived master encryption key
let activeMasterKey = null;

/**
 * Convert string to Uint8Array
 */
function strToBuf(str) {
  return new TextEncoder().encode(str);
}

/**
 * Convert Uint8Array to string
 */
function bufToStr(buf) {
  return new TextDecoder().decode(buf);
}

/**
 * Convert buffer to base64 string
 */
function bufToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to Uint8Array
 */
function base64ToBuf(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generate cryptographically secure random bytes
 */
export function generateRandomBytes(length = 16) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Generate a salt in base64 format
 */
export function generateSalt() {
  return bufToBase64(generateRandomBytes(16));
}

/**
 * Derive AES-256-GCM key from passphrase and salt via PBKDF2 (SHA-256, 100k rounds)
 */
export async function deriveKeyFromPassphrase(passphrase, saltBase64) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    strToBuf(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const saltBuf = base64ToBuf(saltBase64);

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuf,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return derivedKey;
}

/**
 * Encrypt arbitrary JavaScript payload into AES-256-GCM ciphertext package
 */
export async function encryptPayload(payload, cryptoKey) {
  const iv = generateRandomBytes(12); // Standard 12-byte IV for AES-GCM
  const jsonString = JSON.stringify(payload);
  const encodedData = strToBuf(jsonString);

  const ciphertextBuf = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    cryptoKey,
    encodedData
  );

  return {
    ciphertext: bufToBase64(ciphertextBuf),
    iv: bufToBase64(iv),
  };
}

/**
 * Decrypt AES-256-GCM ciphertext package back into original JavaScript payload
 */
export async function decryptPayload(ciphertextBase64, ivBase64, cryptoKey) {
  const ciphertextBuf = base64ToBuf(ciphertextBase64);
  const ivBuf = base64ToBuf(ivBase64);

  const decryptedBuf = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuf,
    },
    cryptoKey,
    ciphertextBuf
  );

  const jsonString = bufToStr(decryptedBuf);
  return JSON.parse(jsonString);
}

const KEY_CHECK_PLAINTEXT = { v: 1, check: 'edsy-notes-key-check' };

/**
 * Build the passphrase check record stored next to the salt, so a wrong
 * passphrase is detected up front instead of silently failing to decrypt.
 */
export async function createKeyCheck(cryptoKey) {
  const { ciphertext, iv } = await encryptPayload(KEY_CHECK_PLAINTEXT, cryptoKey);
  return { check_blob: ciphertext, check_iv: iv };
}

/** True when `cryptoKey` decrypts the stored check record. */
export async function verifyKeyCheck(cryptoKey, { check_blob, check_iv }) {
  try {
    const out = await decryptPayload(check_blob, check_iv, cryptoKey);
    return out?.check === KEY_CHECK_PLAINTEXT.check;
  } catch {
    return false;
  }
}

/**
 * Encrypt a note for cloud storage. The whole note body (including trashed
 * state) lives inside the ciphertext; only id / timestamps / version / the
 * tombstone flag are visible to the server.
 */
export async function encryptNoteForCloud(note, cryptoKey) {
  const { id, createdAt, updatedAt, ...body } = note;
  const encrypted = await encryptPayload(body, cryptoKey);
  return {
    id,
    updated_at: new Date(updatedAt || Date.now()).toISOString(),
    created_at: new Date(createdAt || updatedAt || Date.now()).toISOString(),
    version: (note.cloudVersion || 0) + 1,
    deleted: false,
    encrypted_blob: encrypted.ciphertext,
    iv: encrypted.iv,
  };
}

/** Tombstone record for a permanently deleted note (carries no content). */
export async function makeTombstone(id, deletedAt, cryptoKey) {
  const encrypted = await encryptPayload({ deleted: true }, cryptoKey);
  return {
    id,
    updated_at: new Date(deletedAt || Date.now()).toISOString(),
    version: 1,
    deleted: true,
    encrypted_blob: encrypted.ciphertext,
    iv: encrypted.iv,
  };
}

/** Decrypt a cloud record back into a local note. Returns null for tombstones. */
export async function decryptNoteFromCloud(cloudRecord, cryptoKey) {
  if (cloudRecord.deleted) return null;
  if (!cloudRecord.encrypted_blob || !cloudRecord.iv) {
    throw new Error('Invalid cloud record: missing encrypted_blob or iv');
  }
  const body = await decryptPayload(cloudRecord.encrypted_blob, cloudRecord.iv, cryptoKey);
  return {
    ...body,
    id: cloudRecord.id,
    createdAt: new Date(cloudRecord.created_at || cloudRecord.updated_at).getTime(),
    updatedAt: new Date(cloudRecord.updated_at).getTime(),
    cloudVersion: cloudRecord.version,
  };
}

// ---------------------------------------------------------------------------
// Key persistence. The derived key is non-extractable, so it can live in
// IndexedDB across reloads without the passphrase ever being written to disk.
// ---------------------------------------------------------------------------

const KEY_DB = 'edsy-keystore';
const KEY_STORE = 'keys';
const KEY_ID = 'master';

function openKeyDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB unavailable'));
    const req = indexedDB.open(KEY_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(KEY_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function keyDbRun(mode, fn) {
  const db = await openKeyDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(KEY_STORE, mode);
      const req = fn(tx.objectStore(KEY_STORE));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

/** Persist the active master key for `userId` (best effort). */
export async function persistMasterKey(userId, key) {
  try {
    await keyDbRun('readwrite', (store) => store.put({ userId, key }, KEY_ID));
  } catch {
    /* key simply stays in memory for this session */
  }
}

/** Restore a previously persisted master key for `userId`, if any. */
export async function restoreMasterKey(userId) {
  try {
    const row = await keyDbRun('readonly', (store) => store.get(KEY_ID));
    if (row && row.userId === userId && row.key) {
      activeMasterKey = row.key;
      return row.key;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Forget the master key everywhere (sign out / lock). */
export async function clearActiveMasterKey() {
  activeMasterKey = null;
  try {
    await keyDbRun('readwrite', (store) => store.delete(KEY_ID));
  } catch {
    /* ignore */
  }
}

export function setActiveMasterKey(key) {
  activeMasterKey = key;
}

export function getActiveMasterKey() {
  return activeMasterKey;
}

export default {
  generateSalt,
  deriveKeyFromPassphrase,
  encryptPayload,
  decryptPayload,
  encryptNoteForCloud,
  decryptNoteFromCloud,
  makeTombstone,
  createKeyCheck,
  verifyKeyCheck,
  persistMasterKey,
  restoreMasterKey,
  setActiveMasterKey,
  getActiveMasterKey,
  clearActiveMasterKey,
};
