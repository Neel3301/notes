// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';

const db = {};
vi.mock('../supabaseClient.js', () => ({
  getCachedUser: () => ({ id: 'u1' }),
  checkSlugAvailable: async (slug) => !db[slug],
  publishSharedNote: async (r) => { db[r.slug] = r; },
  fetchSharedNoteBySlug: async (slug) => db[slug] || null,
}));

const s = await import('../sharingService.js');

describe('sharingService', () => {
  it('normalises and validates slugs', () => {
    expect(s.normalizeSlug(' My Note! ')).toBe('my-note-');
    expect(() => s.normalizeSlug('a')).toThrow();
  });

  it('shares publicly as readable JSON', async () => {
    const res = await s.shareNotePublicly({ id: 'n', title: 'Pub', content: 'hi' }, 'pub-note');
    expect(res.isPrivate).toBe(false);
    const read = await s.fetchAndDecryptSharedNote('pub-note');
    expect(read.note.title).toBe('Pub');
  });

  it('protects private shares with the password', async () => {
    await s.shareNotePrivately({ id: 'p', title: 'Priv', content: 'secret' }, 'hunter22', 'priv-note');
    expect(db['priv-note'].encrypted_blob).not.toContain('secret');
    expect((await s.fetchAndDecryptSharedNote('priv-note')).isLocked).toBe(true);
    const wrong = await s.fetchAndDecryptSharedNote('priv-note', 'nope-nope');
    expect(wrong.error).toBe('INCORRECT_PASSWORD');
    const ok = await s.fetchAndDecryptSharedNote('priv-note', 'hunter22');
    expect(ok.note.content).toBe('secret');
  });

  it('refuses taken slugs and weak passwords', async () => {
    await expect(s.shareNotePublicly({ id: 'x', title: 't' }, 'pub-note')).rejects.toThrow(/taken/);
    expect(() => s.shareNotePrivately({ id: 'x' }, '123', 'abc-def')).toThrow(/at least/);
  });
});
