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

/**
 * Encrypt a note object before syncing to Supabase.
 * Retains only public non-sensitive sync metadata (id, updated_at, version, deleted).
 * Encrypts title, content, blocks, sketchData, audioData, notebook, tags.
 */
export async function encryptNoteForCloud(note, cryptoKey) {
  const sensitivePayload = {
    title: note.title || '',
    content: note.content || '',
    blocks: note.blocks || [],
    sketchData: note.sketchData || null,
    audioData: note.audioData || null,
    notebook: note.notebook || 'Quick Notes',
    tags: note.tags || [],
    color: note.color || 'blue',
    liked: !!note.liked,
    pinned: !!note.pinned,
  };

  const encrypted = await encryptPayload(sensitivePayload, cryptoKey);

  return {
    id: note.id,
    updated_at: note.updated_at || new Date().toISOString(),
    version: (note.version || 0) + 1,
    deleted: !!note.trashed,
    encrypted_blob: encrypted.ciphertext,
    iv: encrypted.iv,
  };
}

/**
 * Decrypt a note record downloaded from Supabase back into a local note model.
 */
export async function decryptNoteFromCloud(cloudRecord, cryptoKey) {
  if (!cloudRecord.encrypted_blob || !cloudRecord.iv) {
    throw new Error('Invalid cloud record: missing encrypted_blob or iv');
  }

  const decrypted = await decryptPayload(
    cloudRecord.encrypted_blob,
    cloudRecord.iv,
    cryptoKey
  );

  return {
    id: cloudRecord.id,
    title: decrypted.title,
    content: decrypted.content,
    blocks: decrypted.blocks,
    sketchData: decrypted.sketchData,
    audioData: decrypted.audioData,
    notebook: decrypted.notebook,
    tags: decrypted.tags,
    color: decrypted.color,
    liked: decrypted.liked,
    pinned: decrypted.pinned,
    trashed: !!cloudRecord.deleted,
    updated_at: cloudRecord.updated_at,
    version: cloudRecord.version,
    date: 'Today',
    time: new Date(cloudRecord.updated_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

/**
 * Master Encryption Key Management in active session
 */
export function setActiveMasterKey(key) {
  activeMasterKey = key;
}

export function getActiveMasterKey() {
  return activeMasterKey;
}

export function clearActiveMasterKey() {
  activeMasterKey = null;
}

export default {
  generateSalt,
  deriveKeyFromPassphrase,
  encryptPayload,
  decryptPayload,
  encryptNoteForCloud,
  decryptNoteFromCloud,
  setActiveMasterKey,
  getActiveMasterKey,
  clearActiveMasterKey,
};
