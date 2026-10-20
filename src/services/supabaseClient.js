/**
 * supabaseClient.js
 * Supabase client integration for Edsy Notes.
 *
 * Handles:
 * - Supabase Authentication (Sign up, Sign in, Sign out, Session).
 * - Cloud database storage for E2EE encrypted notes.
 * - Graceful fallback / emulation when environment variables are not yet configured,
 *   enabling immediate, full-fidelity end-to-end testing without external network setup.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

const isRealConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('your-project-id')
);

// Real Supabase client instance (if configured)
export const realSupabase = isRealConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

if (typeof window !== 'undefined') {
  if (isRealConfigured) {
    console.info(`[Supabase] Live Supabase cloud client active: ${SUPABASE_URL}`);
  } else {
    console.info('[Supabase] Offline emulation mode active. To connect your live project, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to web/.env (see web/.env.example).');
  }
}

// Local Mock Cloud Storage for offline testing & fallback
const MOCK_AUTH_STORAGE_KEY = 'edsy_mock_supabase_auth';
const MOCK_NOTES_STORAGE_KEY = 'edsy_mock_supabase_notes';
const MOCK_SHARED_STORAGE_KEY = 'edsy_mock_supabase_shared';

const memoryStore = new Map();
const safeStorage = {
  getItem: (key) => {
    if (typeof localStorage !== 'undefined') {
      try { return localStorage.getItem(key); } catch { return memoryStore.get(key) || null; }
    }
    return memoryStore.get(key) || null;
  },
  setItem: (key, val) => {
    if (typeof localStorage !== 'undefined') {
      try { localStorage.setItem(key, val); } catch { /* ignore */ }
    }
    memoryStore.set(key, String(val));
  },
  removeItem: (key) => {
    if (typeof localStorage !== 'undefined') {
      try { localStorage.removeItem(key); } catch { /* ignore */ }
    }
    memoryStore.delete(key);
  },
};

class MockSupabaseService {
  constructor() {
    this.authListeners = new Set();
  }

  getCurrentUser() {
    try {
      const data = safeStorage.getItem(MOCK_AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async signUp(email, password) {
    if (!email || !password) throw new Error('Email and password required');
    const user = {
      id: `usr_${Date.now()}`,
      email,
      created_at: new Date().toISOString(),
    };
    safeStorage.setItem(MOCK_AUTH_STORAGE_KEY, JSON.stringify(user));
    this.notifyAuthListeners('SIGNED_IN', user);
    return { user, error: null };
  }

  async signIn(email, password) {
    if (!email || !password) throw new Error('Email and password required');
    const existing = this.getCurrentUser();
    const user = existing && existing.email === email
      ? existing
      : { id: `usr_${Date.now()}`, email, created_at: new Date().toISOString() };
    safeStorage.setItem(MOCK_AUTH_STORAGE_KEY, JSON.stringify(user));
    this.notifyAuthListeners('SIGNED_IN', user);
    return { user, error: null };
  }

  async signOut() {
    safeStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
    this.notifyAuthListeners('SIGNED_OUT', null);
    return { error: null };
  }

  onAuthStateChange(callback) {
    this.authListeners.add(callback);
    const currentUser = this.getCurrentUser();
    callback(currentUser ? 'SIGNED_IN' : 'SIGNED_OUT', currentUser);
    return {
      data: {
        subscription: {
          unsubscribe: () => this.authListeners.delete(callback),
        },
      },
    };
  }

  notifyAuthListeners(event, session) {
    this.authListeners.forEach((fn) => {
      try {
        fn(event, session);
      } catch (e) {
        console.error('Auth listener error', e);
      }
    });
  }

  // Cloud Database Operations for Encrypted Notes
  async upsertEncryptedNotes(encryptedNotes) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required for cloud sync');

    let allNotes = [];
    try {
      const raw = safeStorage.getItem(MOCK_NOTES_STORAGE_KEY);
      allNotes = raw ? JSON.parse(raw) : [];
    } catch {
      allNotes = [];
    }

    const noteMap = new Map(allNotes.map((n) => [n.id, n]));
    encryptedNotes.forEach((incoming) => {
      noteMap.set(incoming.id, {
        ...incoming,
        user_id: user.id,
        synced_at: new Date().toISOString(),
      });
    });

    const updated = Array.from(noteMap.values());
    safeStorage.setItem(MOCK_NOTES_STORAGE_KEY, JSON.stringify(updated));
    return { data: updated, error: null };
  }

  async fetchEncryptedNotes(userId) {
    try {
      const raw = safeStorage.getItem(MOCK_NOTES_STORAGE_KEY);
      const allNotes = raw ? JSON.parse(raw) : [];
      const userNotes = userId ? allNotes.filter((n) => n.user_id === userId) : allNotes;
      return { data: userNotes, error: null };
    } catch (e) {
      return { data: [], error: e };
    }
  }

  // Shared Notes Table operations (for Phase 15)
  async upsertSharedNote(sharedRecord) {
    let allShared = [];
    try {
      const raw = safeStorage.getItem(MOCK_SHARED_STORAGE_KEY);
      allShared = raw ? JSON.parse(raw) : [];
    } catch {
      allShared = [];
    }

    // Check slug uniqueness
    const existingIdx = allShared.findIndex((s) => s.slug === sharedRecord.slug);
    if (existingIdx >= 0) {
      if (allShared[existingIdx].note_id !== sharedRecord.note_id) {
        throw new Error(`Slug "${sharedRecord.slug}" is already taken. Please choose another.`);
      }
      allShared[existingIdx] = { ...allShared[existingIdx], ...sharedRecord };
    } else {
      allShared.push(sharedRecord);
    }

    safeStorage.setItem(MOCK_SHARED_STORAGE_KEY, JSON.stringify(allShared));
    return { data: sharedRecord, error: null };
  }

  async getSharedNote(slug) {
    try {
      const raw = safeStorage.getItem(MOCK_SHARED_STORAGE_KEY);
      const allShared = raw ? JSON.parse(raw) : [];
      const match = allShared.find((s) => s.slug === slug);
      if (!match) return { data: null, error: new Error('Shared note not found') };
      return { data: match, error: null };
    } catch (e) {
      return { data: null, error: e };
    }
  }

  async isSlugAvailable(slug, currentNoteId) {
    try {
      const raw = safeStorage.getItem(MOCK_SHARED_STORAGE_KEY);
      const allShared = raw ? JSON.parse(raw) : [];
      const match = allShared.find((s) => s.slug.toLowerCase() === slug.toLowerCase());
      if (!match) return true;
      return match.note_id === currentNoteId;
    } catch {
      return true;
    }
  }
}

const mockService = new MockSupabaseService();

/**
 * Normalize username or email into valid auth email
 */
export function normalizeUsernameToAuthEmail(input) {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }
  const clean = trimmed.toLowerCase().replace(/[^a-z0-9._-]/g, '_');
  return `${clean}@edsy.app`;
}

/**
 * Format user display name (strip internal @edsy.app domain if present)
 */
export function formatDisplayUsername(user) {
  if (!user) return 'Guest';
  const email = user.email || user.username || '';
  if (email.endsWith('@edsy.app')) {
    return email.replace('@edsy.app', '');
  }
  return email;
}

/**
 * Unified Supabase Auth Service (Supports Username or Email)
 */
export async function signUp(identifier, password) {
  const email = normalizeUsernameToAuthEmail(identifier);
  if (isRealConfigured && realSupabase) {
    const { data, error } = await realSupabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: identifier.trim().replace(/@.*$/, ''),
        },
      },
    });
    if (error) throw error;
    return { user: data.user, session: data.session, error: null };
  }
  return mockService.signUp(email, password);
}

export async function signIn(identifier, password) {
  const email = normalizeUsernameToAuthEmail(identifier);
  if (isRealConfigured && realSupabase) {
    const { data, error } = await realSupabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return { user: data.user, session: data.session, error: null };
  }
  return mockService.signIn(email, password);
}

export async function signOut() {
  if (isRealConfigured && realSupabase) {
    const { error } = await realSupabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  }
  return mockService.signOut();
}

export function getCurrentUser() {
  if (isRealConfigured && realSupabase) {
    return realSupabase.auth.getUser().then(({ data }) => data?.user || null);
  }
  return mockService.getCurrentUser();
}

export function onAuthStateChange(callback) {
  if (isRealConfigured && realSupabase) {
    const { data } = realSupabase.auth.onAuthStateChange((event, session) => {
      callback(event, session?.user || null);
    });
    return data.subscription;
  }
  return mockService.onAuthStateChange(callback);
}

/**
 * Unified Cloud Database Operations (E2EE Note records)
 */
export async function uploadEncryptedNotes(encryptedNotes) {
  if (isRealConfigured && realSupabase) {
    const { data, error } = await realSupabase
      .from('notes')
      .upsert(encryptedNotes, { onConflict: 'id' });
    if (error) throw error;
    return { data, error: null };
  }
  return mockService.upsertEncryptedNotes(encryptedNotes);
}

export async function fetchEncryptedNotes(userId) {
  if (isRealConfigured && realSupabase) {
    const { data, error } = await realSupabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return { data, error: null };
  }
  return mockService.fetchEncryptedNotes(userId);
}

/**
 * Shared Notes operations
 */
export async function publishSharedNote(sharedRecord) {
  if (isRealConfigured && realSupabase) {
    const { data, error } = await realSupabase
      .from('shared_notes')
      .upsert(sharedRecord, { onConflict: 'slug' });
    if (error) throw error;
    return { data, error: null };
  }
  return mockService.upsertSharedNote(sharedRecord);
}

export async function fetchSharedNoteBySlug(slug) {
  if (isRealConfigured && realSupabase) {
    const { data, error } = await realSupabase
      .from('shared_notes')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return { data, error: null };
  }
  return mockService.getSharedNote(slug);
}

export async function checkSlugAvailable(slug, currentNoteId) {
  if (isRealConfigured && realSupabase) {
    const { data } = await realSupabase
      .from('shared_notes')
      .select('id, note_id')
      .eq('slug', slug);
    if (!data || data.length === 0) return true;
    return data[0].note_id === currentNoteId;
  }
  return mockService.isSlugAvailable(slug, currentNoteId);
}

export const isCloudConfigured = () => isRealConfigured;

export default {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  uploadEncryptedNotes,
  fetchEncryptedNotes,
  publishSharedNote,
  fetchSharedNoteBySlug,
  checkSlugAvailable,
  normalizeUsernameToAuthEmail,
  formatDisplayUsername,
  isCloudConfigured,
};
