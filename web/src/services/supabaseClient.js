/**
 * supabaseClient.js
 * Supabase integration for Edsy Notes: username/password auth, encrypted note
 * storage and share links. The app stays fully usable offline / signed out;
 * every cloud call throws a clear error when Supabase is not configured.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your-project-id')
);

export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

export const isCloudConfigured = () => isConfigured;

function requireClient() {
  if (!supabase) {
    throw new Error('Cloud features are not configured for this build.');
  }
  return supabase;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

// Last known user, kept in sync by the auth listener so React can read it synchronously.
let cachedUser = null;

if (supabase) {
  supabase.auth.onAuthStateChange((_event, session) => {
    cachedUser = session?.user || null;
  });
}

const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,31}$/;

/** Validate and normalise a username. Throws a user-facing error when invalid. */
export function normalizeUsername(input) {
  const username = String(input || '').trim().toLowerCase();
  if (!USERNAME_RE.test(username)) {
    throw new Error(
      'Username must be 3-32 characters: letters, numbers, dot, dash or underscore.'
    );
  }
  return username;
}

/** Usernames map to a synthetic email, so users never need a real address. */
export function usernameToAuthEmail(username) {
  return `${normalizeUsername(username)}@edsy.app`;
}

/** Display name for a user (the part before the synthetic domain). */
export function formatDisplayUsername(user) {
  if (!user) return 'Guest';
  const email = user.email || '';
  return email.endsWith('@edsy.app') ? email.slice(0, -'@edsy.app'.length) : email;
}

function friendlyAuthError(error) {
  const msg = String(error?.message || '');
  if (/invalid login credentials/i.test(msg)) return new Error('Wrong username or password.');
  if (/already registered|already exists/i.test(msg)) return new Error('That username is taken.');
  if (/password should be at least|weak password/i.test(msg)) {
    return new Error('Password must be at least 8 characters.');
  }
  if (error?.status === 429 || /rate limit/i.test(msg)) {
    return new Error('Too many attempts. Please wait a minute and try again.');
  }
  if (/email.*(confirm|not confirmed)/i.test(msg)) {
    return new Error(
      'Email confirmation is enabled on this Supabase project. Turn off "Confirm email" in Authentication -> Providers -> Email.'
    );
  }
  return error instanceof Error ? error : new Error(msg || 'Authentication failed');
}

export async function signUp(username, password) {
  const client = requireClient();
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters.');
  }
  const { data, error } = await client.auth.signUp({
    email: usernameToAuthEmail(username),
    password,
    options: { data: { username: normalizeUsername(username) } },
  });
  if (error) throw friendlyAuthError(error);
  if (!data.session) {
    throw new Error(
      'Email confirmation is enabled on this Supabase project. Turn off "Confirm email" in Authentication -> Providers -> Email.'
    );
  }
  cachedUser = data.user;
  return { user: data.user, session: data.session };
}

export async function signIn(username, password) {
  const client = requireClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: usernameToAuthEmail(username),
    password,
  });
  if (error) throw friendlyAuthError(error);
  cachedUser = data.user;
  return { user: data.user, session: data.session };
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  cachedUser = null;
}

/** Permanently delete the signed-in account and all of its cloud data. */
export async function deleteAccount() {
  const client = requireClient();
  const { error } = await client.rpc('delete_my_account');
  if (error) throw error;
  await client.auth.signOut().catch(() => {});
  cachedUser = null;
}

/** Synchronous last-known user (null until the session has loaded). */
export function getCachedUser() {
  return cachedUser;
}

/** Authoritative user lookup (reads the stored session, no network call). */
export async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  cachedUser = data?.session?.user || null;
  return cachedUser;
}

/**
 * Subscribe to auth changes. Fires immediately with the current session
 * (INITIAL_SESSION). Returns a subscription with `unsubscribe()`.
 */
export function onAuthStateChange(callback) {
  if (!supabase) {
    callback('SIGNED_OUT', null);
    return { unsubscribe() {} };
  }
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user || null);
  });
  return data.subscription;
}

// ---------------------------------------------------------------------------
// Encryption key material (salt + passphrase check)
// ---------------------------------------------------------------------------

export async function fetchUserKeys() {
  const client = requireClient();
  const { data, error } = await client.from('user_keys').select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function createUserKeys(record) {
  const client = requireClient();
  const { error } = await client.from('user_keys').insert(record);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Encrypted notes
// ---------------------------------------------------------------------------

export async function uploadEncryptedNotes(records) {
  const client = requireClient();
  const { error } = await client.from('notes').upsert(records, { onConflict: 'user_id,id' });
  if (error) throw error;
}

/** Fetch every note record changed after `since` (ISO string) - all of them when omitted. */
export async function fetchEncryptedNotes(since = null) {
  const client = requireClient();
  const pageSize = 500;
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    let query = client
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: true })
      .range(from, from + pageSize - 1);
    if (since) query = query.gte('updated_at', since);
    const { data, error } = await query;
    if (error) throw error;
    rows.push(...data);
    if (data.length < pageSize) break;
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Shared notes
// ---------------------------------------------------------------------------

export async function publishSharedNote(record) {
  const client = requireClient();
  const { error } = await client.from('shared_notes').upsert(record, { onConflict: 'slug' });
  if (error) {
    if (error.code === '42501' || error.code === '23505') {
      throw new Error('That link name is already taken. Please choose another.');
    }
    throw error;
  }
}

export async function fetchSharedNoteBySlug(slug) {
  const client = requireClient();
  const { data, error } = await client.rpc('get_shared_note', { p_slug: slug });
  if (error) throw error;
  return Array.isArray(data) ? data[0] || null : data;
}

export async function checkSlugAvailable(slug, noteId) {
  const client = requireClient();
  const { data, error } = await client.rpc('is_slug_available', {
    p_slug: slug,
    p_note_id: noteId,
  });
  if (error) throw error;
  return Boolean(data);
}

export default {
  signUp,
  signIn,
  signOut,
  deleteAccount,
  getCachedUser,
  getCurrentUser,
  onAuthStateChange,
  isCloudConfigured,
  formatDisplayUsername,
};
