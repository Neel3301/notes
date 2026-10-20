import { useSyncExternalStore } from 'react';
import { initialSeedNotes } from './seedNotes.js';

const STORAGE_KEY = 'edsy_notes_store_v1';

// In-memory fallback if localStorage is unavailable
let memoryStore = null;

// Set of reactive subscribers
const listeners = new Set();

/**
 * Check if browser localStorage is available
 */
function isLocalStorageAvailable() {
  try {
    return (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined' &&
      window.localStorage !== null
    );
  } catch {
    return false;
  }
}

/**
 * Read notes from storage with fallback to initial seed notes
 */
function loadFromStorage() {
  if (isLocalStorageAvailable()) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse notes from localStorage, resetting to seed', e);
    }
  }

  if (memoryStore && Array.isArray(memoryStore) && memoryStore.length > 0) {
    return memoryStore;
  }

  // Deep clone seed notes so mutations don't alter the original template
  return JSON.parse(JSON.stringify(initialSeedNotes));
}

// Active in-memory state snapshot
let currentNotes = loadFromStorage();

/**
 * Persist current notes to storage and notify all subscribers
 */
function commit(updatedNotes) {
  currentNotes = updatedNotes;

  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentNotes));
    } catch (e) {
      console.error('Failed to write to localStorage', e);
    }
  } else {
    memoryStore = currentNotes;
  }

  // Notify all subscribed React components and external listeners
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error('Error in notesStore subscriber', err);
    }
  });
}

/**
 * Core Notes Store API
 */
export const notesStore = {
  /**
   * Subscribe a listener callback to store changes
   * @param {() => void} listener
   * @returns {() => void} unsubscribe function
   */
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * Get current immutable snapshot for useSyncExternalStore
   */
  getSnapshot() {
    return currentNotes;
  },

  /**
   * Get all notes
   * @returns {Array<object>}
   */
  getNotes() {
    return currentNotes;
  },

  /**
   * Get a single note by ID
   * @param {string} id
   * @returns {object | undefined}
   */
  getNoteById(id) {
    return currentNotes.find((n) => n.id === id);
  },

  /**
   * Create or update a note
   * @param {object} noteData
   * @returns {object} saved note
   */
  saveNote(noteData) {
    const now = Date.now();
    const existingIndex = currentNotes.findIndex((n) => n.id === noteData.id);

    let savedNote;

    if (existingIndex >= 0) {
      // Update existing
      savedNote = {
        ...currentNotes[existingIndex],
        ...noteData,
        updatedAt: now,
      };
      const nextNotes = [...currentNotes];
      nextNotes[existingIndex] = savedNote;
      commit(nextNotes);
    } else {
      // Create new
      const id = noteData.id || `note-${now}`;
      savedNote = {
        id,
        title: noteData.title || 'Untitled Note',
        author: noteData.author || 'You',
        notebook: noteData.notebook || 'Quick Notes',
        color: noteData.color || 'blue',
        liked: Boolean(noteData.liked),
        pinned: Boolean(noteData.pinned),
        archived: Boolean(noteData.archived),
        trashed: false,
        date: noteData.date || 'Today',
        time: noteData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tags: Array.isArray(noteData.tags) ? noteData.tags : [],
        content: noteData.content || '',
        blocks: Array.isArray(noteData.blocks) ? noteData.blocks : [],
        sketchData: noteData.sketchData || null,
        audioData: noteData.audioData || null,
        createdAt: now,
        updatedAt: now,
      };
      commit([savedNote, ...currentNotes]);
    }

    return savedNote;
  },

  /**
   * Delete a note (soft-delete to trash by default, or permanent delete)
   * @param {string} id
   * @param {boolean} [permanent=false]
   */
  deleteNote(id, permanent = false) {
    if (permanent) {
      commit(currentNotes.filter((n) => n.id !== id));
    } else {
      const nextNotes = currentNotes.map((n) =>
        n.id === id ? { ...n, trashed: true, updatedAt: Date.now() } : n
      );
      commit(nextNotes);
    }
  },

  /**
   * Restore a note from trash
   * @param {string} id
   */
  restoreNote(id) {
    const nextNotes = currentNotes.map((n) =>
      n.id === id ? { ...n, trashed: false, updatedAt: Date.now() } : n
    );
    commit(nextNotes);
  },

  /**
   * Toggle favorite/liked status
   * @param {string} id
   * @returns {boolean} new liked status
   */
  toggleLike(id) {
    let nextLiked = false;
    const nextNotes = currentNotes.map((n) => {
      if (n.id === id) {
        nextLiked = !n.liked;
        return { ...n, liked: nextLiked, updatedAt: Date.now() };
      }
      return n;
    });
    commit(nextNotes);
    return nextLiked;
  },

  /**
   * Toggle pinned status
   * @param {string} id
   * @returns {boolean} new pinned status
   */
  togglePin(id) {
    let nextPinned = false;
    const nextNotes = currentNotes.map((n) => {
      if (n.id === id) {
        nextPinned = !n.pinned;
        return { ...n, pinned: nextPinned, updatedAt: Date.now() };
      }
      return n;
    });
    commit(nextNotes);
    return nextPinned;
  },

  /**
   * Filter notes by query, category, tag, date, liked, or trashed state
   * @param {object} options
   * @returns {Array<object>}
   */
  filterNotes(options = {}) {
    const {
      query = '',
      tag = null,
      notebook = null,
      date = null,
      liked = undefined,
      trashed = false,
    } = options;

    const q = query.trim().toLowerCase();

    return currentNotes.filter((note) => {
      // Trash filter
      if (trashed) {
        if (!note.trashed) return false;
      } else {
        if (note.trashed) return false;
      }

      // Liked filter
      if (liked !== undefined && note.liked !== liked) {
        return false;
      }

      // Notebook filter
      if (notebook && note.notebook !== notebook) {
        return false;
      }

      // Tag filter
      if (tag && (!note.tags || !note.tags.includes(tag))) {
        return false;
      }

      // Date filter
      if (date && note.date !== date) {
        return false;
      }

      // Search query filter (matches title, content, author, tags)
      if (q) {
        const titleMatch = note.title && note.title.toLowerCase().includes(q);
        const authorMatch = note.author && note.author.toLowerCase().includes(q);
        const contentMatch = note.content && note.content.toLowerCase().includes(q);
        const tagMatch = note.tags && note.tags.some((t) => t.toLowerCase().includes(q));
        if (!titleMatch && !authorMatch && !contentMatch && !tagMatch) {
          return false;
        }
      }

      return true;
    });
  },

  /**
   * Export note as a Markdown string
   * @param {string} id
   * @returns {string}
   */
  exportAsMarkdown(id) {
    const note = this.getNoteById(id);
    if (!note) return '';

    let md = `# ${note.title.replace(/\n/g, ' ')}\n\n`;
    md += `*Notebook: ${note.notebook} | Author: ${note.author} | Date: ${note.date}*\n`;
    if (note.tags?.length > 0) {
      md += `*Tags: ${note.tags.map((t) => '#' + t).join(', ')}*\n`;
    }
    md += '\n---\n\n';
    md += note.content || '';

    if (note.blocks?.length > 0) {
      md += '\n\n## Blocks\n';
      note.blocks.forEach((block) => {
        md += `\n### ${block.number || ''} ${block.title || block.type}\n`;
        if (block.type === 'checklist' && Array.isArray(block.items)) {
          block.items.forEach((item) => {
            md += `- [${item.completed ? 'x' : ' '}] ${item.text}\n`;
          });
        } else if (block.content) {
          md += `${block.content}\n`;
        }
      });
    }

    return md;
  },

  /**
   * Export all notes as JSON
   * @returns {string}
   */
  exportAllAsJson() {
    return JSON.stringify(currentNotes, null, 2);
  },

  /**
   * Import notes from JSON backup string
   * @param {string} jsonString
   * @returns {boolean} success
   */
  importFromJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        commit(parsed);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to parse import JSON', e);
      return false;
    }
  },

  /**
   * Reset store to initial seed dataset
   */
  resetToSeed() {
    commit(JSON.parse(JSON.stringify(initialSeedNotes)));
  },
};

/**
 * Reactive React hook for components
 * Uses useSyncExternalStore for tear-free React 19 subscriptions
 */
export function useNotesStore() {
  const notes = useSyncExternalStore(
    notesStore.subscribe,
    notesStore.getSnapshot,
    notesStore.getSnapshot
  );

  return {
    notes,
    getNote: (id) => notesStore.getNoteById(id),
    saveNote: (data) => notesStore.saveNote(data),
    deleteNote: (id, permanent) => notesStore.deleteNote(id, permanent),
    restoreNote: (id) => notesStore.restoreNote(id),
    toggleLike: (id) => notesStore.toggleLike(id),
    togglePin: (id) => notesStore.togglePin(id),
    filterNotes: (opts) => notesStore.filterNotes(opts),
    exportAsMarkdown: (id) => notesStore.exportAsMarkdown(id),
    exportAllAsJson: () => notesStore.exportAllAsJson(),
    importFromJson: (json) => notesStore.importFromJson(json),
    resetToSeed: () => notesStore.resetToSeed(),
  };
}
