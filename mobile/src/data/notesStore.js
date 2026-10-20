import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'edsy_mobile_notes_v1';

export const initialSeedNotes = [
  {
    id: 'note-1',
    title: 'Intro to Frontend\nDevelopment',
    author: 'Lena Brooks',
    notebook: 'Design Systems',
    color: 'yellow',
    liked: true,
    pinned: true,
    trashed: false,
    date: 'Mon. 12',
    time: '10:00 am – 11:30 am',
    tags: ['Frontend', 'CSS', 'Design'],
    content: `# Intro to Frontend Development\n\nUnderstand the role of frontend in mobile development and how it interacts with system services.\n\n## Principles\n- [[Color Theory & Visual Hierarchy]]\n- Mobile touch ergonomics\n- Native performance optimization`,
    blocks: [
      {
        id: 'block-1',
        type: 'text',
        number: '01',
        title: 'Core Architecture',
        content: 'Understand native mobile threading, gesture handlers, and responsive layouts.',
      },
      {
        id: 'block-2',
        type: 'checklist',
        number: '02',
        title: 'Milestone Checklist',
        items: [
          { id: 'c1', text: 'Define primitive tokens in tokens.js', completed: true },
          { id: 'c2', text: 'Build responsive NoteCard component', completed: true },
          { id: 'c3', text: 'Compile release APK for mobile device', completed: false },
        ],
      },
      {
        id: 'block-3',
        type: 'callout',
        number: '03',
        title: 'Design Rule',
        content: 'Preserve high-contrast minimalist dark palette (#000000, #E5E7DA).',
      },
    ],
  },
  {
    id: 'note-2',
    title: 'Digital Illustration:\nVector Art',
    author: 'Marcus Levin',
    notebook: 'Design Systems',
    color: 'light',
    liked: false,
    pinned: false,
    trashed: false,
    date: 'Mon. 12',
    time: '2:45 pm – 4:15 pm',
    tags: ['Art', 'Design'],
    content: `# Digital Illustration: Vector Art\n\nMastering geometric vector drawing and canvas freehand sketches for mobile touchscreens.`,
    blocks: [
      {
        id: 'b2-1',
        type: 'text',
        number: '01',
        title: 'Canvas Foundations',
        content: 'Touch coordinates, bezier curves, and pressure sensitivity.',
      },
    ],
  },
  {
    id: 'note-3',
    title: 'Color Theory &\nVisual Hierarchy',
    author: 'Olivia Bennett',
    notebook: 'Design Systems',
    color: 'blue',
    liked: true,
    pinned: false,
    trashed: false,
    date: 'Tue. 13',
    time: '5:00 pm – 6:30 pm',
    tags: ['Design', 'Tokens'],
    content: `# Color Theory & Visual Hierarchy\n\nEstablishing high-contrast aesthetics across mobile screens without relying on generic saturated colors.`,
    blocks: [
      {
        id: 'b3-1',
        type: 'callout',
        number: '01',
        title: 'Palette Harmony',
        content: 'Balance primary cream #E5E7DA against card blue #6F91B6 and card yellow #CABC3F.',
      },
    ],
  },
  {
    id: 'note-4',
    title: 'Design Systems &\nToken Architecture',
    author: 'Sarah Chen',
    notebook: 'Workflow',
    color: 'yellow',
    liked: false,
    pinned: true,
    trashed: false,
    date: 'Wed. 14',
    time: '11:00 am – 12:30 pm',
    tags: ['Workflow', 'Tokens'],
    content: `# Design Systems & Token Architecture\n\nScalable design tokens for mobile interfaces with seamless dark mode support.`,
    blocks: [],
  },
];

let memoryNotes = [...initialSeedNotes];
const listeners = new Set();

const notify = () => {
  listeners.forEach((l) => l(memoryNotes));
};

export const notesStore = {
  async init() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        memoryNotes = JSON.parse(stored);
      } else {
        memoryNotes = [...initialSeedNotes];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memoryNotes));
      }
      notify();
    } catch (e) {
      console.warn('AsyncStorage load failed, using memory fallback', e);
    }
  },

  getNotes() {
    return memoryNotes;
  },

  getNote(id) {
    return memoryNotes.find((n) => n.id === id);
  },

  async saveNote(noteData) {
    const now = Date.now();
    const existingIndex = memoryNotes.findIndex((n) => n.id === noteData.id);
    let saved;

    if (existingIndex >= 0) {
      saved = { ...memoryNotes[existingIndex], ...noteData, updatedAt: now };
      memoryNotes[existingIndex] = saved;
    } else {
      saved = {
        id: noteData.id || `note-${now}`,
        title: noteData.title || 'Untitled Note',
        author: noteData.author || 'You',
        notebook: noteData.notebook || 'Quick Notes',
        color: noteData.color || 'blue',
        liked: Boolean(noteData.liked),
        pinned: Boolean(noteData.pinned),
        trashed: false,
        date: noteData.date || 'Today',
        time: noteData.time || '10:00 am',
        tags: noteData.tags || ['Idea'],
        content: noteData.content || '',
        blocks: noteData.blocks || [],
        createdAt: now,
        updatedAt: now,
      };
      memoryNotes.unshift(saved);
    }

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memoryNotes));
    } catch (e) {}

    notify();
    return saved;
  },

  async toggleLike(id) {
    const note = memoryNotes.find((n) => n.id === id);
    if (note) {
      note.liked = !note.liked;
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memoryNotes));
      } catch (e) {}
      notify();
    }
  },

  async deleteNote(id, permanent = false) {
    if (permanent) {
      memoryNotes = memoryNotes.filter((n) => n.id !== id);
    } else {
      memoryNotes = memoryNotes.map((n) => (n.id === id ? { ...n, trashed: true } : n));
    }
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memoryNotes));
    } catch (e) {}
    notify();
  },

  async restoreNote(id) {
    memoryNotes = memoryNotes.map((n) => (n.id === id ? { ...n, trashed: false } : n));
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memoryNotes));
    } catch (e) {}
    notify();
  },

  getBacklinks(noteId) {
    const target = memoryNotes.find((n) => n.id === noteId);
    if (!target) return [];
    const normalized = target.title.replace(/\s+/g, ' ').toLowerCase();
    const results = [];

    memoryNotes.forEach((source) => {
      if (source.id === noteId || source.trashed) return;
      if (source.content && source.content.toLowerCase().includes(`[[${normalized}]]`)) {
        results.push({ note: source });
      }
    });

    return results;
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useNotes() {
  const [notes, setNotes] = useState(memoryNotes);

  useEffect(() => {
    notesStore.init();
    const unsub = notesStore.subscribe(setNotes);
    return unsub;
  }, []);

  return {
    notes,
    getNote: (id) => notesStore.getNote(id),
    saveNote: (data) => notesStore.saveNote(data),
    toggleLike: (id) => notesStore.toggleLike(id),
    deleteNote: (id, perm) => notesStore.deleteNote(id, perm),
    restoreNote: (id) => notesStore.restoreNote(id),
    getBacklinks: (id) => notesStore.getBacklinks(id),
  };
}
