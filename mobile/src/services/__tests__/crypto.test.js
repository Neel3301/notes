import { describe, it, expect } from 'vitest';
import { webcrypto } from 'node:crypto';
import {
  generateSalt,
  deriveKey,
  encryptPayload,
  decryptPayload,
  encryptNoteForCloud,
  decryptNoteFromCloud,
  createKeyCheck,
  verifyKeyCheck,
  base64ToBytes,
  bytesToBase64,
} from '../crypto.js';

const subtle = webcrypto.subtle;

/** Mirrors web/src/services/cryptoService.js */
async function webDerive(pass, saltB64) {
  const material = await subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  return subtle.deriveKey(
    { name: 'PBKDF2', salt: base64ToBytes(saltB64), iterations: 100000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

describe('mobile crypto', () => {
  it('decrypts what the web client encrypted', async () => {
    const salt = generateSalt();
    const webKey = await webDerive('pw ünï', salt);
    const iv = webcrypto.getRandomValues(new Uint8Array(12));
    const ct = await subtle.encrypt({ name: 'AES-GCM', iv }, webKey, new TextEncoder().encode(JSON.stringify({ title: 'from web' })));
    const key = await deriveKey('pw ünï', salt);
    const out = await decryptPayload(bytesToBase64(new Uint8Array(ct)), bytesToBase64(iv), key);
    expect(out.title).toBe('from web');
  });

  it('is decryptable by the web client', async () => {
    const salt = generateSalt();
    const key = await deriveKey('secret', salt);
    const { ciphertext, iv } = await encryptPayload({ title: 'from mobile' }, key);
    const webKey = await webDerive('secret', salt);
    const pt = await subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(iv) }, webKey, base64ToBytes(ciphertext));
    expect(JSON.parse(new TextDecoder().decode(pt)).title).toBe('from mobile');
  });

  it('round-trips notes, tombstones and key checks', async () => {
    const key = await deriveKey('pw', generateSalt());
    const rec = await encryptNoteForCloud({ id: 'n', title: 'T', trashed: true, updatedAt: 5, createdAt: 1 }, key);
    const back = await decryptNoteFromCloud(rec, key);
    expect(back.title).toBe('T');
    expect(back.trashed).toBe(true);
    const check = await createKeyCheck(key);
    expect(await verifyKeyCheck(key, check)).toBe(true);
    expect(await verifyKeyCheck(await deriveKey('other', generateSalt()), check)).toBe(false);
  });
});
