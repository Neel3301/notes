import * as SecureStore from 'expo-secure-store';
import { bytesToBase64, base64ToBytes } from '../services/crypto';

const KEY_NAME = 'edsy_master_key';

/** Persist the derived master key in the OS keystore (never the passphrase). */
export async function saveMasterKey(userId, key) {
  try {
    await SecureStore.setItemAsync(KEY_NAME, JSON.stringify({ userId, key: bytesToBase64(key) }));
  } catch {
    /* stays in memory for this session */
  }
}

export async function loadMasterKey(userId) {
  try {
    const raw = await SecureStore.getItemAsync(KEY_NAME);
    if (!raw) return null;
    const row = JSON.parse(raw);
    return row.userId === userId ? base64ToBytes(row.key) : null;
  } catch {
    return null;
  }
}

export async function deleteMasterKey() {
  try {
    await SecureStore.deleteItemAsync(KEY_NAME);
  } catch {
    /* ignore */
  }
}
