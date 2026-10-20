/**
 * syncService.js
 * End-to-End Encrypted Cloud Synchronization Manager for Edsy Notes.
 *
 * Requirements:
 * - SYNC-01: Local-first operation preserved 100% when sync is disabled or user is logged out.
 * - SYNC-03: Zero-knowledge encryption: only AES-256-GCM ciphertexts are synced.
 * - SYNC-04: User-controlled toggle to opt in or opt out of cloud synchronization anytime.
 * - SYNC-05: Offline sync queue and timestamp-based conflict resolution.
 */

import {
  generateSalt,
  encryptNoteForCloud,
  decryptNoteFromCloud,
  getActiveMasterKey,
  deriveKeyFromPassphrase,
  setActiveMasterKey,
} from './cryptoService';
import {
  getCurrentUser,
  uploadEncryptedNotes,
  fetchEncryptedNotes,
} from './supabaseClient';

const SYNC_ENABLED_KEY = 'edsy_cloud_sync_enabled';
const SYNC_PASSPHRASE_SALT_KEY = 'edsy_sync_passphrase_salt';
const LAST_SYNCED_KEY = 'edsy_last_synced_timestamp';

let currentStatus = 'local'; // 'local' | 'syncing' | 'synced' | 'offline' | 'error'
let lastError = null;
const statusListeners = new Set();

/**
 * Check if the user has opted in to cloud synchronization
 */
export function isSyncEnabled() {
  try {
    return localStorage.getItem(SYNC_ENABLED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Enable or disable cloud synchronization (SYNC-04)
 */
export function setSyncEnabled(enabled) {
  try {
    localStorage.setItem(SYNC_ENABLED_KEY, enabled ? 'true' : 'false');
    updateStatus(enabled ? 'synced' : 'local');
  } catch (e) {
    console.error('Failed to update sync enabled flag', e);
  }
}

/**
 * Get current sync status
 */
export function getSyncStatus() {
  if (!isSyncEnabled()) return 'local';
  return currentStatus;
}

/**
 * Get timestamp of last successful sync
 */
export function getLastSyncedAt() {
  try {
    return localStorage.getItem(LAST_SYNCED_KEY) || null;
  } catch {
    return null;
  }
}

/**
 * Subscribe to status changes
 */
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
      fn(status, lastSync, error);
    } catch (e) {
      console.error('Status listener error', e);
    }
  });
}

/**
 * Initialize or unlock Master Encryption Key
 */
export async function initializeEncryptionKey(passphrase) {
  let salt = localStorage.getItem(SYNC_PASSPHRASE_SALT_KEY);
  if (!salt) {
    salt = generateSalt();
    localStorage.setItem(SYNC_PASSPHRASE_SALT_KEY, salt);
  }

  const masterKey = await deriveKeyFromPassphrase(passphrase, salt);
  setActiveMasterKey(masterKey);
  return masterKey;
}

/**
 * Full Sync Cycle (Push local changes + Pull remote changes with E2EE)
 */
export async function performSync(store, customPassphrase = null) {
  if (!isSyncEnabled()) {
    updateStatus('local');
    return { success: false, reason: 'Sync disabled by user' };
  }

  const user = getCurrentUser();
  if (!user) {
    updateStatus('local');
    return { success: false, reason: 'User not signed in' };
  }

  updateStatus('syncing');

  try {
    // 1. Resolve active encryption key
    let cryptoKey = getActiveMasterKey();
    if (!cryptoKey) {
      const savedPassphrase = customPassphrase || localStorage.getItem('edsy_session_passphrase');
      if (!savedPassphrase) {
        updateStatus('error', 'Encryption passphrase required');
        return { success: false, reason: 'Passphrase required to decrypt/encrypt notes' };
      }
      cryptoKey = await initializeEncryptionKey(savedPassphrase);
    }

    // 2. Encrypt all local notes for upload
    const localNotes = store.notes;
    const encryptedUploadPayloads = [];

    for (const note of localNotes) {
      const encryptedBlob = await encryptNoteForCloud(note, cryptoKey);
      encryptedUploadPayloads.push(encryptedBlob);
    }

    // 3. Upload encrypted notes to Supabase (Zero-Knowledge)
    if (encryptedUploadPayloads.length > 0) {
      await uploadEncryptedNotes(encryptedUploadPayloads);
    }

    // 4. Download remote notes
    const { data: remoteEncryptedNotes, error } = await fetchEncryptedNotes(user.id);
    if (error) throw error;

    // 5. Decrypt and merge remote notes into local store
    let mergedCount = 0;
    if (Array.isArray(remoteEncryptedNotes) && remoteEncryptedNotes.length > 0) {
      for (const remoteRecord of remoteEncryptedNotes) {
        try {
          const decryptedNote = await decryptNoteFromCloud(remoteRecord, cryptoKey);
          const localNote = store.getNote(decryptedNote.id);

          // Conflict resolution: Last-Write-Wins (LWW)
          if (!localNote) {
            // New remote note, save locally
            store.saveNote(decryptedNote);
            mergedCount++;
          } else {
            const localTime = new Date(localNote.updated_at || 0).getTime();
            const remoteTime = new Date(decryptedNote.updated_at || 0).getTime();
            if (remoteTime > localTime) {
              store.saveNote(decryptedNote);
              mergedCount++;
            }
          }
        } catch (decryptionErr) {
          console.warn('Could not decrypt remote note (different passphrase?)', decryptionErr);
        }
      }
    }

    const nowIso = new Date().toISOString();
    localStorage.setItem(LAST_SYNCED_KEY, nowIso);
    updateStatus('synced');

    return {
      success: true,
      uploaded: encryptedUploadPayloads.length,
      downloaded: remoteEncryptedNotes?.length || 0,
      merged: mergedCount,
      timestamp: nowIso,
    };
  } catch (err) {
    console.error('Cloud sync error', err);
    updateStatus('error', err.message || 'Sync failed');
    return { success: false, error: err.message };
  }
}

export default {
  isSyncEnabled,
  setSyncEnabled,
  getSyncStatus,
  getLastSyncedAt,
  onSyncStatusChange,
  initializeEncryptionKey,
  performSync,
};
