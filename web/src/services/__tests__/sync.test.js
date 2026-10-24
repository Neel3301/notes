// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

const cloud = { notes: [], keys: null };

vi.mock('../supabaseClient.js', () => ({
  isCloudConfigured: () => true,
  getCachedUser: () => ({ id: 'u1' }),
  getCurrentUser: async () => ({ id: 'u1' }),
  fetchUserKeys: async () => cloud.keys,
  createUserKeys: async (r) => { cloud.keys = r; },
  fetchEncryptedNotes: async (since) =>
    cloud.notes.filter((n) => !since || n.updated_at >= since),
  uploadEncryptedNotes: async (records) => {
    for (const r of records) {
      const i = cloud.notes.findIndex((n) => n.id === r.id);
      if (i >= 0) cloud.notes[i] = r; else cloud.notes.push(r);
    }
  },
}));

const { performSync, setSyncEnabled, unlockEncryption, lockEncryption } = await import('../syncService.js');

function makeStore(initial = []) {
  let notes = initial;
  let tombs = [];
  return {
    get notes() { return notes; },
    getNote: (id) => notes.find((n) => n.id === id),
    applyRemoteNote: (n) => { notes = [...notes.filter((x) => x.id !== n.id), n]; },
    removeLocalNote: (id) => { notes = notes.filter((n) => n.id !== id); },
    getTombstones: () => tombs,
    clearTombstones: (ids) => { tombs = tombs.filter((t) => !ids.includes(t.id)); },
    addTombstone: (t) => tombs.push(t),
    subscribe: () => () => {},
  };
}

beforeEach(async () => {
  cloud.notes = [];
  cloud.keys = null;
  localStorage.clear();
  await lockEncryption({ reset: true });
  setSyncEnabled(true);
});

describe('syncService', () => {
  it('pushes local notes encrypted and pulls them onto a second device', async () => {
    await unlockEncryption('pass');
    const a = makeStore([{ id: 'n1', title: 'Hello', updatedAt: 1000, createdAt: 1000 }]);
    expect((await performSync(a)).success).toBe(true);
    expect(cloud.notes).toHaveLength(1);
    expect(JSON.stringify(cloud.notes)).not.toContain('Hello');

    // second device: same passphrase, same server salt
    localStorage.clear();
    await lockEncryption({ reset: true });
    setSyncEnabled(true);
    await unlockEncryption('pass');
    const b = makeStore([]);
    await performSync(b);
    expect(b.getNote('n1').title).toBe('Hello');
  });

  it('rejects a wrong passphrase on a second device', async () => {
    await unlockEncryption('pass');
    await lockEncryption({ reset: true });
    await expect(unlockEncryption('nope')).rejects.toThrow(/Wrong encryption passphrase/);
  });

  it('keeps the newer local edit (last-write-wins)', async () => {
    await unlockEncryption('pass');
    const a = makeStore([{ id: 'n1', title: 'old', updatedAt: 1000, createdAt: 1000 }]);
    await performSync(a);
    const b = makeStore([{ id: 'n1', title: 'newer local', updatedAt: 9_000_000_000_000, createdAt: 1000 }]);
    await performSync(b);
    expect(b.getNote('n1').title).toBe('newer local');
  });

  it('propagates permanent deletion via tombstones', async () => {
    await unlockEncryption('pass');
    const a = makeStore([{ id: 'n1', title: 'x', updatedAt: 1000, createdAt: 1000 }]);
    await performSync(a);
    const b = makeStore([{ id: 'n1', title: 'x', updatedAt: 1000, createdAt: 1000 }]);
    a.removeLocalNote('n1');
    a.addTombstone({ id: 'n1', deletedAt: Date.now() + 1000 });
    await performSync(a);
    expect(a.getTombstones()).toHaveLength(0);
    localStorage.removeItem('edsy_sync_cursor');
    await performSync(b);
    expect(b.getNote('n1')).toBeUndefined();
  });

  it('reports locked when no key is available', async () => {
    const s = makeStore([]);
    const res = await performSync(s);
    expect(res.success).toBe(false);
  });
});
