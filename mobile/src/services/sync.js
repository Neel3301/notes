/**
 * End-to-end encrypted sync for the native app. Same protocol as the web
 * client (see web/src/services/syncService.js): pull changes since a cursor,
 * merge last-write-wins, then push edited notes and deletion tombstones.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import Reachability from './online';
import {
  generateSalt,
  deriveKey,
  encryptNoteForCloud,
  decryptNoteFromCloud,
  makeTombstone,
  createKeyCheck,
  verifyKeyCheck,
} from './crypto';
import { saveMasterKey, loadMasterKey, deleteMasterKey } from '../lib/storage';
import {
  getCachedUser,
  getCurrentUser,
  isCloudConfigured,
  uploadEncryptedNotes,
  fetchEncryptedNotes,
  fetchUserKeys,
  createUserKeys,
} from './supabase';

const K = {
  enabled: 'edsy_sync_enabled',
  cursor: 'edsy_sync_cursor',
  lastPush: 'edsy_sync_last_push_ms',
  lastSynced: 'edsy_sync_last_synced',
  user: 'edsy_sync_user_id',
};
const PUSH_BATCH = 100;
const DEBOUNCE_MS = 3000;
const POLL_MS = 60000;

let activeKey = null;
let status = 'local'; // local | locked | syncing | synced | offline | error
let lastError = null;
let syncEnabled = false;
let lastSynced = null;
let inFlight = null;
const listeners = new Set();

function emit() {
  listeners.forEach((fn) => {
    try {
      fn(getSyncState());
    } catch (e) {
      console.warn('sync listener failed', e);
    }
  });
}

function setStatus(next, error = null) {
  status = next;
  lastError = error;
  emit();
}

export function getSyncState() {
  return { status: syncEnabled ? status : 'local', enabled: syncEnabled, lastSynced, error: lastError };
}

export function onSyncChange(fn) {
  listeners.add(fn);
  fn(getSyncState());
  return () => listeners.delete(fn);
}

/** Load persisted sync settings; call once at app start. */
export async function initSync() {
  const [enabled, last] = await Promise.all([AsyncStorage.getItem(K.enabled), AsyncStorage.getItem(K.lastSynced)]);
  syncEnabled = enabled === 'true';
  lastSynced = last;
  setStatus(syncEnabled ? 'locked' : 'local');
}

export async function setSyncEnabled(enabled) {
  syncEnabled = enabled;
  await AsyncStorage.setItem(K.enabled, enabled ? 'true' : 'false');
  setStatus(enabled ? (activeKey ? 'synced' : 'locked') : 'local');
}

async function resetState() {
  await AsyncStorage.multiRemove([K.cursor, K.lastPush, K.lastSynced, K.user]);
  lastSynced = null;
}

export async function unlockEncryption(passphrase) {
  const user = getCachedUser() || (await getCurrentUser());
  if (!user) throw new Error('Sign in first.');
  if (!passphrase) throw new Error('Enter your encryption passphrase.');

  let record = await fetchUserKeys();
  let key;
  if (!record) {
    const salt = generateSalt();
    key = await deriveKey(passphrase, salt);
    try {
      await createUserKeys({ salt, ...(await createKeyCheck(key)) });
    } catch (err) {
      if (err?.code !== '23505') throw err;
      record = await fetchUserKeys();
    }
  }
  if (record) {
    key = await deriveKey(passphrase, record.salt);
    if (!(await verifyKeyCheck(key, record))) throw new Error('Wrong encryption passphrase.');
  }
  activeKey = key;
  await saveMasterKey(user.id, key);
  return key;
}

export async function lockEncryption({ reset = false } = {}) {
  activeKey = null;
  await deleteMasterKey();
  if (reset) await resetState();
  setStatus(syncEnabled ? 'locked' : 'local');
}

async function runSync(store) {
  if (!isCloudConfigured()) return { success: false, reason: 'Cloud is not configured' };
  if (!syncEnabled) return { success: false, reason: 'Sync is turned off' };
  const user = getCachedUser() || (await getCurrentUser());
  if (!user) {
    setStatus('local');
    return { success: false, reason: 'Not signed in' };
  }
  if (!(await Reachability.isOnline())) {
    setStatus('offline');
    return { success: false, reason: 'Offline' };
  }

  if ((await AsyncStorage.getItem(K.user)) !== user.id) {
    await resetState();
    await AsyncStorage.setItem(K.user, user.id);
  }

  const key = activeKey || (activeKey = await loadMasterKey(user.id));
  if (!key) {
    setStatus('locked', 'Enter your encryption passphrase to sync.');
    return { success: false, reason: 'Encryption passphrase required' };
  }

  setStatus('syncing');
  const startedAt = Date.now();
  try {
    const cursor = await AsyncStorage.getItem(K.cursor);
    const remote = await fetchEncryptedNotes(cursor);
    let merged = 0;
    let newCursor = cursor;

    for (const record of remote) {
      if (!newCursor || record.updated_at > newCursor) newCursor = record.updated_at;
      const local = store.getNote(record.id);
      if (local && (local.updatedAt || 0) >= new Date(record.updated_at).getTime()) continue;
      try {
        const note = await decryptNoteFromCloud(record, key);
        if (note === null) await store.removeLocalNote(record.id);
        else await store.applyRemoteNote({ ...local, ...note });
        merged++;
      } catch (err) {
        console.warn('Could not decrypt a remote note', record.id, err);
      }
    }

    const lastPush = Number((await AsyncStorage.getItem(K.lastPush)) || 0);
    const dirty = store.notes.filter((n) => (n.updatedAt || 0) > lastPush);
    const tombstones = store.getTombstones();
    const payloads = [];
    for (const n of dirty) payloads.push(await encryptNoteForCloud(n, key));
    for (const t of tombstones) payloads.push(await makeTombstone(t.id, t.deletedAt, key));
    for (let i = 0; i < payloads.length; i += PUSH_BATCH) {
      await uploadEncryptedNotes(payloads.slice(i, i + PUSH_BATCH));
    }
    if (tombstones.length) await store.clearTombstones(tombstones.map((t) => t.id));

    lastSynced = new Date().toISOString();
    await AsyncStorage.multiSet([
      [K.lastPush, String(startedAt)],
      [K.lastSynced, lastSynced],
      ...(newCursor ? [[K.cursor, newCursor]] : []),
    ]);
    setStatus('synced');
    return { success: true, uploaded: payloads.length, downloaded: remote.length, merged };
  } catch (err) {
    console.warn('Cloud sync error', err);
    const message = err?.message || 'Sync failed';
    setStatus((await Reachability.isOnline()) ? 'error' : 'offline', message);
    return { success: false, error: message };
  }
}

export function performSync(store) {
  if (!inFlight) {
    inFlight = runSync(store).finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

/** Auto-sync after edits, on app foreground and on a slow poll. Returns a stop function. */
export function startAutoSync(store, AppState) {
  let timer = null;
  const syncNow = () => syncEnabled && performSync(store);
  const unsub = store.subscribe(() => {
    if (!syncEnabled) return;
    clearTimeout(timer);
    timer = setTimeout(syncNow, DEBOUNCE_MS);
  });
  const poll = setInterval(syncNow, POLL_MS);
  const appSub = AppState.addEventListener('change', (s) => s === 'active' && syncNow());
  syncNow();
  return () => {
    clearTimeout(timer);
    clearInterval(poll);
    unsub();
    appSub.remove();
  };
}
