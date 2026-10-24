import { deriveKey, generateSalt, encryptPayload, decryptPayload } from './crypto';
import { getRandomBytes, randomUUID } from 'expo-crypto';
import { publishSharedNote, fetchSharedNoteBySlug, checkSlugAvailable, getCachedUser } from './supabase';

export const SHARE_BASE_URL = process.env.EXPO_PUBLIC_WEB_URL || 'https://edsy-notes.vercel.app';

const SLUG_RE = /^[a-z0-9][a-z0-9_-]{2,63}$/;
const MIN_PASSWORD = 6;

export function normalizeSlug(input) {
  const slug = String(input || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
  if (!SLUG_RE.test(slug)) {
    throw new Error('Link name must be 3-64 characters: letters, numbers, dash or underscore.');
  }
  return slug;
}

export function generateRandomSlug(prefix = 'note') {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let rand = '';
  for (const b of getRandomBytes(8)) rand += chars[b % chars.length];
  return `${prefix}-${rand}`;
}

export const formatShareUrl = (slug) => `${SHARE_BASE_URL}/share/${slug}`;

function buildPayload(note) {
  return {
    id: note.id,
    title: note.title || 'Untitled Note',
    author: note.author || 'Edsy User',
    notebook: note.notebook || 'Shared Notes',
    color: note.color || 'blue',
    content: note.content || '',
    blocks: note.blocks || [],
    sketchData: note.sketchData || null,
    audioData: note.audioData || null,
    tags: note.tags || [],
    shared_at: new Date().toISOString(),
  };
}

export async function shareNote(note, { slug: requested, password } = {}) {
  if (!getCachedUser()) throw new Error('Sign in to create share links.');
  const isPrivate = Boolean(password);
  if (isPrivate && password.trim().length < MIN_PASSWORD) {
    throw new Error(`Password must be at least ${MIN_PASSWORD} characters.`);
  }
  const slug = requested?.trim() ? normalizeSlug(requested) : generateRandomSlug();
  if (!(await checkSlugAvailable(slug, note.id))) {
    throw new Error(`The link name "${slug}" is already taken. Please choose another.`);
  }

  const payload = buildPayload(note);
  let salt = '';
  let iv = '';
  let blob;
  if (isPrivate) {
    salt = generateSalt();
    const key = await deriveKey(password.trim(), salt);
    const e = await encryptPayload(payload, key);
    iv = e.iv;
    blob = e.ciphertext;
  } else {
    blob = JSON.stringify(payload);
  }

  await publishSharedNote({
    id: randomUUID(),
    note_id: note.id,
    slug,
    is_private: isPrivate,
    title_hint: isPrivate ? null : note.title,
    salt,
    iv,
    encrypted_blob: blob,
  });
  return { slug, shareUrl: formatShareUrl(slug), isPrivate };
}

export async function fetchSharedNote(slug, password = null) {
  const record = await fetchSharedNoteBySlug(normalizeSlug(slug));
  if (!record) throw new Error(`Shared note "${slug}" not found.`);
  if (!record.is_private) return { isLocked: false, note: JSON.parse(record.encrypted_blob) };
  if (!password) return { isLocked: true };
  try {
    const key = await deriveKey(password.trim(), record.salt);
    return { isLocked: false, note: await decryptPayload(record.encrypted_blob, record.iv, key) };
  } catch {
    return { isLocked: true, error: 'INCORRECT_PASSWORD' };
  }
}
