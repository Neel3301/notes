import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isCloudConfigured = () => Boolean(URL && KEY);

export const supabase = isCloudConfigured()
  ? createClient(URL, KEY, {
      auth: {
        storage: AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

function client() {
  if (!supabase) throw new Error('Cloud features are not configured for this build.');
  return supabase;
}

let cachedUser = null;
if (supabase) {
  supabase.auth.onAuthStateChange((_e, session) => {
    cachedUser = session?.user || null;
  });
}

const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,31}$/;

export function normalizeUsername(input) {
  const u = String(input || '').trim().toLowerCase();
  if (!USERNAME_RE.test(u)) {
    throw new Error('Username must be 3-32 characters: letters, numbers, dot, dash or underscore.');
  }
  return u;
}

export const usernameToAuthEmail = (u) => `${normalizeUsername(u)}@edsy.app`;

export function formatDisplayUsername(user) {
  const email = user?.email || '';
  return email.endsWith('@edsy.app') ? email.slice(0, -'@edsy.app'.length) : email || 'Guest';
}

function friendly(error) {
  const msg = String(error?.message || '');
  if (/invalid login credentials/i.test(msg)) return new Error('Wrong username or password.');
  if (/already registered|already exists/i.test(msg)) return new Error('That username is taken.');
  if (/password should be at least|weak password/i.test(msg)) {
    return new Error('Password must be at least 8 characters.');
  }
  if (error?.status === 429 || /rate limit/i.test(msg)) {
    return new Error('Too many attempts. Please wait a minute and try again.');
  }
  return error instanceof Error ? error : new Error(msg || 'Authentication failed');
}

export async function signUp(username, password) {
  if (!password || password.length < 8) throw new Error('Password must be at least 8 characters.');
  const { data, error } = await client().auth.signUp({
    email: usernameToAuthEmail(username),
    password,
    options: { data: { username: normalizeUsername(username) } },
  });
  if (error) throw friendly(error);
  if (!data.session) {
    throw new Error('Email confirmation is on for this project; it must be turned off in Supabase.');
  }
  cachedUser = data.user;
  return data.user;
}

export async function signIn(username, password) {
  const { data, error } = await client().auth.signInWithPassword({
    email: usernameToAuthEmail(username),
    password,
  });
  if (error) throw friendly(error);
  cachedUser = data.user;
  return data.user;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  cachedUser = null;
}

export async function deleteAccount() {
  const { error } = await client().rpc('delete_my_account');
  if (error) throw error;
  await supabase.auth.signOut().catch(() => {});
  cachedUser = null;
}

export const getCachedUser = () => cachedUser;

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  cachedUser = data?.session?.user || null;
  return cachedUser;
}

export function onAuthStateChange(cb) {
  if (!supabase) {
    cb('SIGNED_OUT', null);
    return { unsubscribe() {} };
  }
  const { data } = supabase.auth.onAuthStateChange((event, session) => cb(event, session?.user || null));
  return data.subscription;
}

export async function fetchUserKeys() {
  const { data, error } = await client().from('user_keys').select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function createUserKeys(record) {
  const { error } = await client().from('user_keys').insert(record);
  if (error) throw error;
}

export async function uploadEncryptedNotes(records) {
  const { error } = await client().from('notes').upsert(records, { onConflict: 'user_id,id' });
  if (error) throw error;
}

export async function fetchEncryptedNotes(since = null) {
  const pageSize = 500;
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    let q = client()
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: true })
      .range(from, from + pageSize - 1);
    if (since) q = q.gte('updated_at', since);
    const { data, error } = await q;
    if (error) throw error;
    rows.push(...data);
    if (data.length < pageSize) break;
  }
  return rows;
}

export async function publishSharedNote(record) {
  const { error } = await client().from('shared_notes').upsert(record, { onConflict: 'slug' });
  if (error) {
    if (error.code === '42501' || error.code === '23505') {
      throw new Error('That link name is already taken. Please choose another.');
    }
    throw error;
  }
}

export async function fetchSharedNoteBySlug(slug) {
  const { data, error } = await client().rpc('get_shared_note', { p_slug: slug });
  if (error) throw error;
  return Array.isArray(data) ? data[0] || null : data;
}

export async function checkSlugAvailable(slug, noteId) {
  const { data, error } = await client().rpc('is_slug_available', { p_slug: slug, p_note_id: noteId });
  if (error) throw error;
  return Boolean(data);
}
