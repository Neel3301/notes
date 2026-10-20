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
} from './supabaseClient.js';

const PUBLIC_DERIVATION_SECRET = 'edsy_public_note_secret_2026';

/**
 * Generate a random URL-safe slug
 */
export function generateRandomSlug(prefix = 'note') {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${rand}`;
}

/**
 * Generate full share URL
 */
export function formatShareUrl(slug) {
  if (typeof window === 'undefined') return `#/share/${slug}`;
  const origin = window.location.origin;
  const path = window.location.pathname.replace(/\/+$/, '');
  return `${origin}${path}/#/share/${slug}`;
}

/**
 * Check if a custom slug is available (SHR-03)
 */
export async function isSlugAvailable(slug, currentNoteId = null) {
  if (!slug || slug.trim().length < 3) return false;
  const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  return checkSlugAvailable(cleanSlug, currentNoteId);
}

/**
 * Share a note publicly (SHR-01)
 */
export async function shareNotePublicly(note, requestedSlug = null) {
  const slug = requestedSlug?.trim() ? requestedSlug.trim().toLowerCase() : generateRandomSlug();
  const available = await isSlugAvailable(slug, note.id);
  if (!available) {
    throw new Error(`The link name "${slug}" is already taken. Please choose another.`);
  }

  const salt = generateSalt();
  const publicCryptoKey = await deriveKeyFromPassphrase(PUBLIC_DERIVATION_SECRET, salt);

  const payload = {
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

  const encrypted = await encryptPayload(payload, publicCryptoKey);

  const sharedRecord = {
    id: `share_${Date.now()}`,
    note_id: note.id,
    slug,
    is_private: false,
    title_hint: note.title,
    salt,
    iv: encrypted.iv,
    encrypted_blob: encrypted.ciphertext,
    created_at: new Date().toISOString(),
  };

  await publishSharedNote(sharedRecord);

  return {
    slug,
    shareUrl: formatShareUrl(slug),
    isPrivate: false,
    record: sharedRecord,
  };
}

/**
 * Share a note privately with password protection (SHR-02)
 */
export async function shareNotePrivately(note, password, requestedSlug = null) {
  if (!password || password.trim().length === 0) {
    throw new Error('A password is required for private sharing.');
  }

  const slug = requestedSlug?.trim() ? requestedSlug.trim().toLowerCase() : generateRandomSlug();
  const available = await isSlugAvailable(slug, note.id);
  if (!available) {
    throw new Error(`The link name "${slug}" is already taken. Please choose another.`);
  }

  const salt = generateSalt();
  // Derive private key from recipient password + salt (100k PBKDF2 rounds)
  const privateCryptoKey = await deriveKeyFromPassphrase(password.trim(), salt);

  const payload = {
    id: note.id,
    title: note.title || 'Untitled Note',
    author: note.author || 'Edsy User',
    notebook: note.notebook || 'Private Shared Notes',
    color: note.color || 'blue',
    content: note.content || '',
    blocks: note.blocks || [],
    sketchData: note.sketchData || null,
    audioData: note.audioData || null,
    tags: note.tags || [],
    shared_at: new Date().toISOString(),
  };

  const encrypted = await encryptPayload(payload, privateCryptoKey);

  const sharedRecord = {
    id: `share_${Date.now()}`,
    note_id: note.id,
    slug,
    is_private: true,
    title_hint: note.title,
    salt,
    iv: encrypted.iv,
    encrypted_blob: encrypted.ciphertext,
    created_at: new Date().toISOString(),
  };

  await publishSharedNote(sharedRecord);

  return {
    slug,
    shareUrl: formatShareUrl(slug),
    isPrivate: true,
    record: sharedRecord,
  };
}

/**
 * Fetch and decrypt a shared note by slug.
 * For private notes: requires recipient password to derive key and decrypt.
 */
export async function fetchAndDecryptSharedNote(slug, recipientPassword = null) {
  const { data: record, error } = await fetchSharedNoteBySlug(slug);
  if (error || !record) {
    throw new Error(`Shared note "${slug}" not found.`);
  }

  if (record.is_private) {
    // If no password entered yet, return locked state
    if (!recipientPassword) {
      return {
        isLocked: true,
        slug: record.slug,
        titleHint: record.title_hint || 'Protected Note',
        createdAt: record.created_at,
      };
    }

    try {
      const privateKey = await deriveKeyFromPassphrase(recipientPassword.trim(), record.salt);
      const decryptedNote = await decryptPayload(record.encrypted_blob, record.iv, privateKey);
      return {
        isLocked: false,
        note: decryptedNote,
        slug: record.slug,
        isPrivate: true,
      };
    } catch (decryptionErr) {
      // AES-GCM tag mismatch on wrong password
      return {
        isLocked: true,
        error: 'INCORRECT_PASSWORD',
        message: 'Incorrect password. Decryption failed.',
        slug: record.slug,
        titleHint: record.title_hint,
      };
    }
  }

  // Public note: decrypt with public key
  try {
    const publicKey = await deriveKeyFromPassphrase(PUBLIC_DERIVATION_SECRET, record.salt);
    const decryptedNote = await decryptPayload(record.encrypted_blob, record.iv, publicKey);
    return {
      isLocked: false,
      note: decryptedNote,
      slug: record.slug,
      isPrivate: false,
    };
  } catch (err) {
    throw new Error('Failed to decrypt public note: ' + err.message);
  }
}

export default {
  generateRandomSlug,
  formatShareUrl,
  isSlugAvailable,
  shareNotePublicly,
  shareNotePrivately,
  fetchAndDecryptSharedNote,
};
