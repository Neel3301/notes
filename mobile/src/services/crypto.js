/**
 * Client-side encryption, wire-compatible with web/src/services/cryptoService.js:
 * PBKDF2-SHA256 (100k iterations) -> AES-256-GCM, 12-byte IV, base64(ciphertext || tag).
 * Hermes has no WebCrypto, so this uses audited pure-JS @noble primitives.
 */
import { gcm } from '@noble/ciphers/aes.js';
import { pbkdf2 } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { getRandomBytes } from 'expo-crypto';

const PBKDF2_ITERATIONS = 100000;
const enc = new TextEncoder();
const dec = new TextDecoder();

export function bytesToBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function base64ToBytes(b64) {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export function generateSalt() {
  return bytesToBase64(getRandomBytes(16));
}

/** Derive a 32-byte AES key (async so the UI can show a spinner first). */
export async function deriveKey(passphrase, saltBase64) {
  await new Promise((r) => setTimeout(r, 0));
  return pbkdf2(sha256, enc.encode(passphrase), base64ToBytes(saltBase64), {
    c: PBKDF2_ITERATIONS,
    dkLen: 32,
  });
}

export async function encryptPayload(payload, key) {
  const iv = getRandomBytes(12);
  const ct = gcm(key, iv).encrypt(enc.encode(JSON.stringify(payload)));
  return { ciphertext: bytesToBase64(ct), iv: bytesToBase64(iv) };
}

export async function decryptPayload(ciphertextB64, ivB64, key) {
  const pt = gcm(key, base64ToBytes(ivB64)).decrypt(base64ToBytes(ciphertextB64));
  return JSON.parse(dec.decode(pt));
}

const KEY_CHECK = { v: 1, check: 'edsy-notes-key-check' };

export async function createKeyCheck(key) {
  const { ciphertext, iv } = await encryptPayload(KEY_CHECK, key);
  return { check_blob: ciphertext, check_iv: iv };
}

export async function verifyKeyCheck(key, { check_blob, check_iv }) {
  try {
    return (await decryptPayload(check_blob, check_iv, key))?.check === KEY_CHECK.check;
  } catch {
    return false;
  }
}

export async function encryptNoteForCloud(note, key) {
  const { id, createdAt, updatedAt, ...body } = note;
  const e = await encryptPayload(body, key);
  return {
    id,
    updated_at: new Date(updatedAt || Date.now()).toISOString(),
    created_at: new Date(createdAt || updatedAt || Date.now()).toISOString(),
    version: (note.cloudVersion || 0) + 1,
    deleted: false,
    encrypted_blob: e.ciphertext,
    iv: e.iv,
  };
}

export async function makeTombstone(id, deletedAt, key) {
  const e = await encryptPayload({ deleted: true }, key);
  return {
    id,
    updated_at: new Date(deletedAt || Date.now()).toISOString(),
    version: 1,
    deleted: true,
    encrypted_blob: e.ciphertext,
    iv: e.iv,
  };
}

export async function decryptNoteFromCloud(record, key) {
  if (record.deleted) return null;
  const body = await decryptPayload(record.encrypted_blob, record.iv, key);
  return {
    ...body,
    id: record.id,
    createdAt: new Date(record.created_at || record.updated_at).getTime(),
    updatedAt: new Date(record.updated_at).getTime(),
    cloudVersion: record.version,
  };
}
