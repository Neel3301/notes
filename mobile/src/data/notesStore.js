import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'edsy_mobile_notes_v2';
const TOMBSTONE_KEY = 'edsy_mobile_tombstones_v1';

const welcomeNote = () => {
  const now = Date.now();
  return {
    id: `note-${now}`,
    title: 'Welcome to\nEdsy Notes',
    author: 'You',
    notebook: 'Quick Notes',
    color: 'yellow',
    liked: false,
    pinned: true,
    trashed: false,
    date: 'Today',
    time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    tags: ['Welcome'],
    content:
      '# Welcome\n\nNotes live on your device first. Sign in from the menu to sync them across devices, end-to-end encrypted.\n\nLink notes with [[Note Title]].',
    blocks: [],
    createdAt: now,
    updatedAt: now,
  };
};

let notes = [];
let tombstones = [];
let ready = false;
const listeners = new Set();

const snapshot = () => notes;
const notify = () => listeners.forEach((l) => l(snapshot()));

let writeChain = Promise.resolve();
function persist() {
  const data = JSON.stringify(notes);
  const tombs = JSON.stringify(tombstones);
  writeChain = writeChain
    .then(() =>
      Promise.all([AsyncStorage.setItem(STORAGE_KEY, data), AsyncStorage.setItem(TOMBSTONE_KEY, tombs)])
    )
    .catch((e) => console.warn('Failed to persist notes', e));
  return writeChain;
}

function commit(next) {
  notes = next;
  notify();
  return persist();
}

export const notesStore = {
  async init() {
    if (ready) return;
    try {
      const [stored, tombs] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(TOMBSTONE_KEY),
      ]);
      const parsed = stored ? JSON.parse(stored) : null;
      notes = Array.isArray(parsed) ? parsed : [welcomeNote()];
      tombstones = tombs ? JSON.parse(tombs) : [];
    } catch (e) {
      console.warn('Failed to load notes', e);
      notes = [welcomeNote()];
    }
    ready = true;
    await commit(notes);
  },

  get notes() {
    return notes;
  },
  getNotes: () => notes,
  getNote: (id) => notes.find((n) => n.id === id),

  async saveNote(data) {
    const now = Date.now();
    const idx = notes.findIndex((n) => n.id === data.id);
    let saved;
    if (idx >= 0) {
      saved = { ...notes[idx], ...data, updatedAt: now };
      const next = [...notes];
      next[idx] = saved;
      await commit(next);
    } else {
      saved = {
        id: data.id || `note-${now}-${Math.random().toString(36).slice(2, 8)}`,
        title: data.title || 'Untitled Note',
        author: data.author || 'You',
        notebook: data.notebook || 'Quick Notes',
        color: data.color || 'blue',
        liked: Boolean(data.liked),
        pinned: Boolean(data.pinned),
        trashed: false,
        date: data.date || 'Today',
        time: data.time || new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tags: Array.isArray(data.tags) ? data.tags : [],
        content: data.content || '',
        blocks: Array.isArray(data.blocks) ? data.blocks : [],
        createdAt: now,
        updatedAt: now,
      };
      await commit([saved, ...notes]);
    }
    return saved;
  },

  toggleLike(id) {
    return commit(notes.map((n) => (n.id === id ? { ...n, liked: !n.liked, updatedAt: Date.now() } : n)));
  },

  togglePin(id) {
    return commit(notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned, updatedAt: Date.now() } : n)));
  },

  deleteNote(id, permanent = false) {
    if (permanent) {
      tombstones = [...tombstones.filter((t) => t.id !== id), { id, deletedAt: Date.now() }];
      return commit(notes.filter((n) => n.id !== id));
    }
    return commit(notes.map((n) => (n.id === id ? { ...n, trashed: true, updatedAt: Date.now() } : n)));
  },

  restoreNote(id) {
    return commit(notes.map((n) => (n.id === id ? { ...n, trashed: false, updatedAt: Date.now() } : n)));
  },

  getBacklinks(noteId) {
    const target = notes.find((n) => n.id === noteId);
    if (!target) return [];
    const needle = `[[${target.title.replace(/\s+/g, ' ').toLowerCase()}]]`;
    return notes
      .filter((s) => s.id !== noteId && !s.trashed && s.content && s.content.toLowerCase().includes(needle))
      .map((note) => ({ note }));
  },

  // ---- cloud-sync hooks (do not bump updatedAt) ----
  applyRemoteNote(note) {
    const idx = notes.findIndex((n) => n.id === note.id);
    if (idx >= 0) {
      const next = [...notes];
      next[idx] = { ...notes[idx], ...note };
      return commit(next);
    }
    return commit([note, ...notes]);
  },

  removeLocalNote(id) {
    if (notes.some((n) => n.id === id)) return commit(notes.filter((n) => n.id !== id));
    return Promise.resolve();
  },

  getTombstones: () => tombstones,

  clearTombstones(ids) {
    const drop = new Set(ids);
    tombstones = tombstones.filter((t) => !drop.has(t.id));
    return persist();
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useNotes() {
  const [list, setList] = useState(notes);

  useEffect(() => {
    notesStore.init().then(() => setList(snapshot()));
    return notesStore.subscribe(setList);
  }, []);

  return {
    notes: list,
    getNote: notesStore.getNote,
    saveNote: (d) => notesStore.saveNote(d),
    toggleLike: (id) => notesStore.toggleLike(id),
    togglePin: (id) => notesStore.togglePin(id),
    deleteNote: (id, perm) => notesStore.deleteNote(id, perm),
    restoreNote: (id) => notesStore.restoreNote(id),
    getBacklinks: (id) => notesStore.getBacklinks(id),
  };
}
