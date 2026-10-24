/**
 * syncService.js
 * End-to-end encrypted cloud sync for Edsy Notes.
 *
 * - Local-first: the app works fully offline / signed out; sync is opt-in.
 * - Zero-knowledge: notes are AES-256-GCM encrypted in the browser. The
 *   server only sees ids, timestamps, a version counter and a tombstone flag.
 * - Incremental: pulls only records changed since the last cursor and pushes
 *   only notes edited since the last successful push.
 * - Conflicts: last-write-wins on `updatedAt`.
 */

import {
  generateSalt,
  deriveKeyFromPassphrase,
  encryptNoteForCloud,
  decryptNoteFromCloud,
  makeTombstone,
  createKeyCheck,
  verifyKeyCheck,
  getActiveMasterKey,
  setActiveMasterKey,
  persistMasterKey,
  restoreMasterKey,
  clearActiveMasterKey,
} from './cryptoService.js';
import {
  getCachedUser,
  getCurrentUser,
  isCloudConfigured,
  uploadEncryptedNotes,
  fetchEncryptedNotes,
  fetchUserKeys,
  createUserKeys,
} from './supabaseClient.js';

const SYNC_ENABLED_KEY = 'edsy_cloud_sync_enabled';
const CURSOR_KEY = 'edsy_sync_cursor';
const LAST_PUSH_KEY = 'edsy_sync_last_push_ms';
const LAST_SYNCED_KEY = 'edsy_last_synced_timestamp';
const SYNC_USER_KEY = 'edsy_sync_user_id';

const PUSH_BATCH = 100;
const AUTO_SYNC_DEBOUNCE_MS = 3000;
const AUTO_SYNC_POLL_MS = 60000;

let currentStatus = 'local'; // 'local' | 'locked' | 'syncing' | 'synced' | 'offline' | 'error'
let lastError = null;
let inFlight = null;
const statusListeners = new Set();

function ls() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
const read = (k) => ls()?.getItem(k) ?? null;
const write = (k, v) => ls()?.setItem(k, v);

export function isSyncEnabled() {
  return read(SYNC_ENABLED_KEY) === 'true';
}

export function setSyncEnabled(enabled) {
  write(SYNC_ENABLED_KEY, enabled ? 'true' : 'false');
  updateStatus(enabled ? (getActiveMasterKey() ? 'synced' : 'locked') : 'local');
}

export function getSyncStatus() {
  return isSyncEnabled() ? currentStatus : 'local';
}

export function getLastSyncedAt() {
  return read(LAST_SYNCED_KEY);
}

export function getLastSyncError() {
  return lastError;
}

export function onSyncStatusChange(callback) {
  statusListeners.add(callback);
  callback(getSyncStatus(), getLastSyncedAt(), lastError);
  return () => statusListeners.delete(callback);
}

function updateStatus(status, error = null) {
  currentStatus = status;
  lastError = error;
  const lastSync = getLastSyncedAt();
  statusListeners.forEach((fn) => {
    try {
      fn(getSyncStatus(), lastSync, error);
    } catch (e) {
      console.error('Status listener error', e);
    }
  });
}

/** Reset sync bookkeeping (new account / sign out) so nothing leaks between users. */
function resetSyncState() {
  [CURSOR_KEY, LAST_PUSH_KEY, LAST_SYNCED_KEY, SYNC_USER_KEY].forEach((k) => ls()?.removeItem(k));
}

/**
 * Derive (or create) the user's master key from their passphrase and keep it
 * for this session. The same passphrase yields the same key on every device
 * because the salt is stored server-side in `user_keys`.
 */
export async function unlockEncryption(passphrase) {
  const user = getCachedUser() || (await getCurrentUser());
  if (!user) throw new Error('Sign in first.');
  if (!passphrase) throw new Error('Enter your encryption passphrase.');

  let record = await fetchUserKeys();
  let key;

  if (!record) {
    const salt = generateSalt();
    key = await deriveKeyFromPassphrase(passphrase, salt);
    const check = await createKeyCheck(key);
    try {
      await createUserKeys({ salt, ...check });
    } catch (err) {
      // Another device created it first: fall through and verify against theirs.
      if (err?.code !== '23505') throw err;
      record = await fetchUserKeys();
      key = null;
    }
  }

  if (record) {
    key = await deriveKeyFromPassphrase(passphrase, record.salt);
    if (!(await verifyKeyCheck(key, record))) {
      throw new Error('Wrong encryption passphrase.');
    }
  }

  setActiveMasterKey(key);
  await persistMasterKey(user.id, key);
  return key;
}

/** Re-use a key persisted from an earlier session, if there is one. */
async function resolveKey(userId) {
  return getActiveMasterKey() || (await restoreMasterKey(userId));
}

/** Forget the key and local sync state (on sign out). */
export async function lockEncryption({ reset = false } = {}) {
  await clearActiveMasterKey();
  if (reset) resetSyncState();
  updateStatus(isSyncEnabled() ? 'locked' : 'local');
}

async function runSync(store) {
  if (!isCloudConfigured()) return { success: false, reason: 'Cloud is not configured' };
  if (!isSyncEnabled()) {
    updateStatus('local');
    return { success: false, reason: 'Sync is turned off' };
  }
  const user = getCachedUser() || (await getCurrentUser());
  if (!user) {
    updateStatus('local');
    return { success: false, reason: 'Not signed in' };
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    updateStatus('offline');
    return { success: false, reason: 'Offline' };
  }

  // A different account on this device must not inherit another user's cursor.
  if (read(SYNC_USER_KEY) !== user.id) {
    resetSyncState();
    write(SYNC_USER_KEY, user.id);
  }

  const key = await resolveKey(user.id);
  if (!key) {
    updateStatus('locked', 'Enter your encryption passphrase to sync.');
    return { success: false, reason: 'Encryption passphrase required' };
  }

  updateStatus('syncing');
  const startedAt = Date.now();

  try {
    // 1. Pull everything that changed on the server since our cursor.
    const cursor = read(CURSOR_KEY);
    const remote = await fetchEncryptedNotes(cursor);
    let pulled = 0;
    let newCursor = cursor;

    for (const record of remote) {
      if (!newCursor || record.updated_at > newCursor) newCursor = record.updated_at;
      const remoteMs = new Date(record.updated_at).getTime();
      const local = store.getNote(record.id);

      if (local && (local.updatedAt || 0) >= remoteMs) continue; // local is newer or equal

      try {
        const note = await decryptNoteFromCloud(record, key);
        if (note === null) {
          store.removeLocalNote(record.id);
        } else {
          store.applyRemoteNote({ ...local, ...note });
        }
        pulled++;
      } catch (err) {
        console.warn('Could not decrypt a remote note', record.id, err);
      }
    }

    // 2. Push notes edited since the last successful push, plus deletions.
    const lastPush = Number(read(LAST_PUSH_KEY) || 0);
    const dirty = store.notes.filter((n) => (n.updatedAt || 0) > lastPush);
    const tombstones = store.getTombstones();

    const payloads = [];
    for (const note of dirty) payloads.push(await encryptNoteForCloud(note, key));
    for (const t of tombstones) payloads.push(await makeTombstone(t.id, t.deletedAt, key));

    for (let i = 0; i < payloads.length; i += PUSH_BATCH) {
      await uploadEncryptedNotes(payloads.slice(i, i + PUSH_BATCH));
    }
    if (tombstones.length) store.clearTombstones(tombstones.map((t) => t.id));

    // 3. Commit bookkeeping only after everything succeeded.
    write(LAST_PUSH_KEY, String(startedAt));
    if (newCursor) write(CURSOR_KEY, newCursor);
    const nowIso = new Date().toISOString();
    write(LAST_SYNCED_KEY, nowIso);
    updateStatus('synced');

    return { success: true, uploaded: payloads.length, downloaded: remote.length, merged: pulled, timestamp: nowIso };
  } catch (err) {
    console.error('Cloud sync error', err);
    const message = err?.message || 'Sync failed';
    updateStatus(navigator.onLine === false ? 'offline' : 'error', message);
    return { success: false, error: message };
  }
}

/** Run a sync cycle. Concurrent calls share the in-flight cycle. */
export function performSync(store) {
  if (!inFlight) {
    inFlight = runSync(store).finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

/**
 * Keep notes in sync automatically: shortly after local edits, when the
 * connection returns, when the tab regains focus, and on a slow poll.
 * Returns a function that stops everything.
 */
export function startAutoSync(store) {
  let timer = null;
  const schedule = () => {
    if (!isSyncEnabled()) return;
    clearTimeout(timer);
    timer = setTimeout(() => performSync(store), AUTO_SYNC_DEBOUNCE_MS);
  };
  const syncNow = () => {
    if (isSyncEnabled()) performSync(store);
  };

  const unsubscribeStore = store.subscribe(schedule);
  const poll = setInterval(syncNow, AUTO_SYNC_POLL_MS);
  const onVisible = () => document.visibilityState === 'visible' && syncNow();
  window.addEventListener('online', syncNow);
  document.addEventListener('visibilitychange', onVisible);
  syncNow();

  return () => {
    clearTimeout(timer);
    clearInterval(poll);
    unsubscribeStore();
    window.removeEventListener('online', syncNow);
    document.removeEventListener('visibilitychange', onVisible);
  };
}

export default {
  isSyncEnabled,
  setSyncEnabled,
  getSyncStatus,
  getLastSyncedAt,
  getLastSyncError,
  onSyncStatusChange,
  unlockEncryption,
  lockEncryption,
  performSync,
  startAutoSync,
};
