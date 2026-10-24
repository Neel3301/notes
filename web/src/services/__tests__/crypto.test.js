import { describe, it, expect } from 'vitest';
import {
  generateSalt,
  deriveKeyFromPassphrase,
  encryptNoteForCloud,
  decryptNoteFromCloud,
  makeTombstone,
  createKeyCheck,
  verifyKeyCheck,
} from '../cryptoService.js';

const note = {
  id: 'n1',
  title: 'Secret plan',
  content: 'top secret',
  blocks: [{ id: 'b', content: 'x' }],
  trashed: true,
  createdAt: 1000,
  updatedAt: 2000,
};

describe('cryptoService', () => {
  it('round-trips a note and keeps trashed state inside the ciphertext', async () => {
    const salt = generateSalt();
    const key = await deriveKeyFromPassphrase('pw', salt);
    const record = await encryptNoteForCloud(note, key);
    expect(record.deleted).toBe(false);
    expect(record.encrypted_blob).not.toContain('Secret');
    const back = await decryptNoteFromCloud({ ...record, created_at: record.created_at }, key);
    expect(back.title).toBe('Secret plan');
    expect(back.trashed).toBe(true);
    expect(back.updatedAt).toBe(2000);
  });

  it('rejects a wrong passphrase via the key check', async () => {
    const salt = generateSalt();
    const good = await deriveKeyFromPassphrase('right', salt);
    const bad = await deriveKeyFromPassphrase('wrong', salt);
    const check = await createKeyCheck(good);
    expect(await verifyKeyCheck(good, check)).toBe(true);
    expect(await verifyKeyCheck(bad, check)).toBe(false);
  });

  it('tombstones decrypt to null', async () => {
    const key = await deriveKeyFromPassphrase('pw', generateSalt());
    const t = await makeTombstone('n1', 5000, key);
    expect(t.deleted).toBe(true);
    expect(await decryptNoteFromCloud(t, key)).toBeNull();
  });
});
