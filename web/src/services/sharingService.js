/**
 * sharingService.js
 * Secure Public and Private Note Sharing Service for Edsy Notes.
 *
 * Requirements:
 * - SHR-01: Public note sharing (shareable web link, viewable in any browser without account).
 * - SHR-02: Private note sharing (password-protected client-side encryption; recipient must enter correct password).
 * - SHR-03: Custom slug support with real-time uniqueness validation.
 */

import {
  generateSalt,
  deriveKeyFromPassphrase,
  encryptPayload,
  decryptPayload,
} from './cryptoService.js';
import {
  publishSharedNote,
  fetchSharedNoteBySlug,
  checkSlugAvailable,
  getCachedUser,
} from './supabaseClient.js';

const SLUG_RE = /^[a-z0-9][a-z0-9_-]{2,63}$/;
const MIN_SHARE_PASSWORD = 6;

/** Normalise user input into a valid slug (throws if impossible). */
export function normalizeSlug(input) {
  const slug = String(input || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
  if (!SLUG_RE.test(slug)) {
    throw new Error('Link name must be 3-64 characters: letters, numbers, dash or underscore.');
  }
  return slug;
}

/** Generate a random URL-safe slug using the secure RNG. */
export function generateRandomSlug(prefix = 'note') {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let rand = '';
  for (const b of bytes) rand += chars[b % chars.length];
  return `${prefix}-${rand}`;
}

/**
 * Generate full share URL
 */
export function formatShareUrl(slug) {
  if (typeof window === 'undefined') return `/share/${slug}`;
  return `${window.location.origin}/share/${slug}`;
}

/**
 * Check if a custom slug is available (SHR-03)
 */
export async function isSlugAvailable(slug, currentNoteId = null) {
  let clean;
  try {
    clean = normalizeSlug(slug);
  } catch {
    return false;
  }
  return checkSlugAvailable(clean, currentNoteId);
}

function buildPayload(note, defaultNotebook) {
  return {
    id: note.id,
    title: note.title || 'Untitled Note',
    author: note.author || 'Edsy User',
    notebook: note.notebook || defaultNotebook,
    color: note.color || 'blue',
    content: note.content || '',
    blocks: note.blocks || [],
    sketchData: note.sketchData || null,
    audioData: note.audioData || null,
    tags: note.tags || [],
    shared_at: new Date().toISOString(),
  };
}

async function publish(note, { slug: requested, isPrivate, password }) {
  if (!getCachedUser()) throw new Error('Sign in to create share links.');
  const slug = requested?.trim() ? normalizeSlug(requested) : generateRandomSlug();
  if (!(await checkSlugAvailable(slug, note.id))) {
    throw new Error(`The link name "${slug}" is already taken. Please choose another.`);
  }

  const payload = buildPayload(note, isPrivate ? 'Private Shared Notes' : 'Shared Notes');
  let salt = '';
  let iv = '';
  let blob;

  if (isPrivate) {
    // Key derived from the share password in the browser; the server never sees it.
    salt = generateSalt();
    const key = await deriveKeyFromPassphrase(password, salt);
    const encrypted = await encryptPayload(payload, key);
    iv = encrypted.iv;
    blob = encrypted.ciphertext;
  } else {
    // Public shares are readable by anyone with the link, so they are stored as plain JSON.
    blob = JSON.stringify(payload);
  }

  const record = {
    id: crypto.randomUUID(),
    note_id: note.id,
    slug,
    is_private: isPrivate,
    title_hint: isPrivate ? null : note.title,
    salt,
    iv,
    encrypted_blob: blob,
  };
  await publishSharedNote(record);

  return { slug, shareUrl: formatShareUrl(slug), isPrivate, record };
}

/** Share a note publicly (SHR-01). Anyone with the link can read it. */
export function shareNotePublicly(note, requestedSlug = null) {
  return publish(note, { slug: requestedSlug, isPrivate: false });
}

/** Share a note behind a password (SHR-02). Encrypted end-to-end. */
export function shareNotePrivately(note, password, requestedSlug = null) {
  const pw = password?.trim() || '';
  if (pw.length < MIN_SHARE_PASSWORD) {
    throw new Error(`Password must be at least ${MIN_SHARE_PASSWORD} characters.`);
  }
  return publish(note, { slug: requestedSlug, isPrivate: true, password: pw });
}

/**
 * Fetch a shared note by slug. Private notes return a locked state until the
 * correct password is supplied.
 */
export async function fetchAndDecryptSharedNote(slug, recipientPassword = null) {
  const record = await fetchSharedNoteBySlug(normalizeSlug(slug));
  if (!record) throw new Error(`Shared note "${slug}" not found.`);

  if (!record.is_private) {
    return {
      isLocked: false,
      note: JSON.parse(record.encrypted_blob),
      slug: record.slug,
      isPrivate: false,
    };
  }

  if (!recipientPassword) {
    return { isLocked: true, slug: record.slug, createdAt: record.created_at };
  }

  try {
    const key = await deriveKeyFromPassphrase(recipientPassword.trim(), record.salt);
    const note = await decryptPayload(record.encrypted_blob, record.iv, key);
    return { isLocked: false, note, slug: record.slug, isPrivate: true };
  } catch {
    // AES-GCM tag mismatch means the password was wrong.
    return {
      isLocked: true,
      error: 'INCORRECT_PASSWORD',
      message: 'Incorrect password. Decryption failed.',
      slug: record.slug,
    };
  }
}

export default {
  normalizeSlug,
  generateRandomSlug,
  formatShareUrl,
  isSlugAvailable,
  shareNotePublicly,
  shareNotePrivately,
  fetchAndDecryptSharedNote,
};
