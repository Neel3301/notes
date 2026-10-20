import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Trash2,
  Folder,
  Tag as TagIcon,
  Plus,
  Heart,
  Calendar,
  Layers,
  Download,
  Upload,
  Database,
  Check,
  FileJson,
} from 'lucide-react';
import AppHeader from '../components/layout/AppHeader';
import MenuItem from '../components/ui/MenuItem';
import Heading from '../components/ui/Heading';
import Button from '../components/ui/Button';
import Pill from '../components/ui/Pill';
import { useNotesStore } from '../data/notesStore';

/**
 * MenuScreen component
 * Full-screen navigation overlay and smart views organizer.
 * Adapts design-reference/menu.jpg with giant .text-menu typography.
 *
 * Smart Sub-Views:
 * - 'main': Primary navigation (Timeline, All Notes, Notebooks, Tags, Favorites, Trash)
 * - 'notebooks': Browse notes by notebook folder
 * - 'tags': Browse notes by tag taxonomy
 * - 'trash': Manage soft-deleted notes with 1-tap restore & permanent purge
 */
export default function MenuScreen({
  header = { left: 'close', logo: '.edsy' },
  onClose,
  onNavigate,
  className = '',
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useNotesStore();

  const [activeSubView, setActiveSubView] = useState('main'); // 'main' | 'notebooks' | 'tags' | 'trash'
  const [newNotebookName, setNewNotebookName] = useState('');
  const [showAddNotebook, setShowAddNotebook] = useState(false);

  // Active and trashed notes
  const activeNotes = store.notes.filter((n) => !n.trashed);
  const trashedNotes = store.notes.filter((n) => n.trashed);

  // Notebooks breakdown
  const notebooksMap = activeNotes.reduce((acc, note) => {
    const nb = note.notebook || 'Quick Notes';
    acc[nb] = (acc[nb] || 0) + 1;
    return acc;
  }, {});
  const notebooks = Object.entries(notebooksMap).map(([name, count]) => ({
    name,
    count,
  }));

  // Tags breakdown
  const tagsMap = activeNotes.reduce((acc, note) => {
    (note.tags || []).forEach((t) => {
      acc[t] = (acc[t] || 0) + 1;
    });
    return acc;
  }, {});
  const tags = Object.entries(tagsMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const favoritesCount = activeNotes.filter((n) => n.liked).length;

  const [restoreStatus, setRestoreStatus] = useState('');

  // Download entire vault as JSON backup
  const handleDownloadBackup = () => {
    const json = store.exportAllAsJson();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edsy_notes_vault_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Restore notes from uploaded JSON backup
  const handleFileRestore = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const imported = store.importFromJson(text);
        setRestoreStatus(`Restored ${imported.length} notes!`);
        setTimeout(() => setRestoreStatus(''), 4000);
      } catch (err) {
        setRestoreStatus('Failed: invalid JSON backup');
        setTimeout(() => setRestoreStatus(''), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const handleCreateNotebook = (e) => {
    e?.preventDefault();
    if (!newNotebookName.trim()) return;
    // Create draft note in new notebook
    store.saveNote({
      title: `${newNotebookName.trim()} Overview`,
      notebook: newNotebookName.trim(),
      tags: [newNotebookName.trim()],
      content: `# ${newNotebookName.trim()}\n\nNew notebook created.`,
      blocks: [],
    });
    setNewNotebookName('');
    setShowAddNotebook(false);
  };

  const handleEmptyTrash = () => {
    trashedNotes.forEach((note) => {
      store.deleteNote(note.id, true);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`w-full min-h-screen bg-screen text-text-primary px-5 pt-3 pb-12 flex flex-col justify-between select-none ${className}`}
    >
      {/* 1. MAIN MENU VIEW */}
      {activeSubView === 'main' && (
        <div className="w-full flex-1 flex flex-col justify-between">
          {/* Header */}
          <AppHeader
            left={header.left || 'close'}
            logo={header.logo || '.edsy'}
            onLeftClick={handleClose}
          />

          {/* Large Typographic Menu Items (Matching menu.jpg) */}
          <div className="w-full flex flex-col gap-1 mt-auto pb-6">
            <MenuItem
              label="Timeline"
              active={location.pathname === '/timeline' || location.pathname === '/study-planning' || location.pathname === '/'}
              onClick={() => {
                navigate('/timeline');
              }}
            />

            <MenuItem
              label="All Notes"
              count={activeNotes.length}
              active={location.pathname === '/course-overview' || location.pathname === '/notes'}
              onClick={() => {
                navigate('/notes');
              }}
            />

            <MenuItem
              label="Notebooks"
              count={notebooks.length}
              onClick={() => setActiveSubView('notebooks')}
            />

            <MenuItem
              label="Tags"
              count={tags.length}
              onClick={() => setActiveSubView('tags')}
            />

            <MenuItem
              label="Favorites"
              count={favoritesCount}
              onClick={() => {
                navigate('/notes', { state: { initialFilter: 'favorites' } });
              }}
            />

            <MenuItem
              label="Trash"
              count={trashedNotes.length > 0 ? trashedNotes.length : null}
              onClick={() => setActiveSubView('trash')}
            />

            <MenuItem
              label="Vault Backup"
              onClick={() => setActiveSubView('vault')}
            />
          </div>

          {/* Quick Footer Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-divider/40 text-label text-text-secondary/70">
            <span>{activeNotes.length} notes total</span>
            <span>{trashedNotes.length} in trash</span>
          </div>
        </div>
      )}

      {/* 2. NOTEBOOKS SUBVIEW */}
      {activeSubView === 'notebooks' && (
        <div className="w-full flex-1 flex flex-col animate-fadeIn">
          <AppHeader
            left="back"
            logo="Notebooks"
            onLeftClick={() => setActiveSubView('main')}
          />

          <div className="mt-8 mb-4">
            <Heading>Notebooks</Heading>
          </div>

          {/* Notebooks List */}
          <div className="flex flex-col gap-2.5 mt-2 flex-1 overflow-y-auto">
            {notebooks.map((nb) => (
              <div
                key={nb.name}
                onClick={() => {
                  navigate('/notes', { state: { notebookFilter: nb.name } });
                }}
                className="w-full p-4 rounded-card bg-[#141414] border border-border-subtle hover:border-cream-bg/60 cursor-pointer flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#1F1F1F] flex items-center justify-center text-text-secondary group-hover:text-cream-bg transition-colors">
                    <Folder className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-body font-medium text-text-primary group-hover:text-cream-bg transition-colors">
                      {nb.name}
                    </h4>
                    <span className="text-label text-text-secondary font-mono">
                      {nb.count} {nb.count === 1 ? 'note' : 'notes'}
                    </span>
                  </div>
                </div>

                <span className="text-text-secondary group-hover:text-cream-bg group-hover:translate-x-1 transition-all">
                  →
                </span>
              </div>
            ))}

            {/* Add Notebook Form */}
            {showAddNotebook ? (
              <form
                onSubmit={handleCreateNotebook}
                className="w-full p-3.5 rounded-card bg-[#181818] border border-cream-bg/40 flex items-center gap-2 mt-2 animate-fadeIn"
              >
                <input
                  type="text"
                  value={newNotebookName}
                  onChange={(e) => setNewNotebookName(e.target.value)}
                  placeholder="New notebook title..."
                  autoFocus
                  className="flex-1 bg-transparent text-body text-text-primary outline-none"
                />
                <button
                  type="submit"
                  disabled={!newNotebookName.trim()}
                  className="px-3 py-1.5 rounded-pill bg-cream-bg text-cream-text text-label font-medium disabled:opacity-40"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddNotebook(false)}
                  className="px-2 py-1 text-label text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddNotebook(true)}
                className="w-full py-3 rounded-card border border-dashed border-border-subtle hover:border-cream-bg/60 text-label text-text-secondary hover:text-cream-bg flex items-center justify-center gap-2 transition-colors mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Notebook</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. TAGS SUBVIEW */}
      {activeSubView === 'tags' && (
        <div className="w-full flex-1 flex flex-col animate-fadeIn">
          <AppHeader
            left="back"
            logo="Tags"
            onLeftClick={() => setActiveSubView('main')}
          />

          <div className="mt-8 mb-4">
            <Heading>Tags</Heading>
          </div>

          <div className="flex flex-wrap gap-2.5 mt-2">
            {tags.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => {
                  navigate('/notes', { state: { tagFilter: t.name } });
                }}
                className="px-3.5 py-2 rounded-pill bg-[#151515] border border-border-subtle hover:border-cream-bg text-text-primary flex items-center gap-2 transition-all hover:scale-105"
              >
                <TagIcon className="w-3.5 h-3.5 text-text-secondary" />
                <span className="text-body text-[13px]">{t.name}</span>
                <span className="text-[11px] font-mono text-text-secondary/70">
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. TRASH SUBVIEW */}
      {activeSubView === 'trash' && (
        <div className="w-full flex-1 flex flex-col animate-fadeIn">
          <AppHeader
            left="back"
            logo="Trash"
            onLeftClick={() => setActiveSubView('main')}
          />

          <div className="mt-8 mb-4 flex items-center justify-between">
            <Heading>Trash</Heading>
            {trashedNotes.length > 0 && (
              <button
                type="button"
                onClick={handleEmptyTrash}
                className="px-3 py-1.5 rounded-pill bg-[#202020] hover:bg-red-950/60 border border-border-subtle hover:border-red-500/50 text-label text-text-secondary hover:text-red-400 transition-colors"
              >
                Empty Trash
              </button>
            )}
          </div>

          {trashedNotes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-12 h-12 rounded-full border border-border-subtle flex items-center justify-center text-text-secondary mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="text-body font-medium text-text-primary">
                Trash is empty
              </h4>
              <p className="text-label text-text-secondary mt-1 max-w-[200px]">
                Notes you delete will appear here before being permanently removed.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-2 flex-1 overflow-y-auto">
              {trashedNotes.map((note) => (
                <div
                  key={note.id}
                  className="w-full p-4 rounded-card bg-[#141414] border border-border-subtle flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <h4 className="text-body font-medium text-text-primary truncate">
                      {note.title}
                    </h4>
                    <span className="text-label text-text-secondary">
                      {note.notebook || 'Notes'} • {note.date || 'Recently'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Restore button */}
                    <button
                      type="button"
                      onClick={() => store.restoreNote(note.id)}
                      className="px-3 py-1.5 rounded-pill bg-cream-bg text-cream-text text-label font-medium flex items-center gap-1.5 hover:scale-105 transition-transform"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>

                    {/* Permanent delete button */}
                    <button
                      type="button"
                      onClick={() => store.deleteNote(note.id, true)}
                      className="p-1.5 text-text-secondary hover:text-red-400 transition-colors"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. VAULT BACKUP SUBVIEW */}
      {activeSubView === 'vault' && (
        <div className="w-full flex-1 flex flex-col animate-fadeIn">
          <AppHeader
            left="back"
            logo="Vault Backup"
            onLeftClick={() => setActiveSubView('main')}
          />

          <div className="mt-8 mb-4">
            <Heading>Vault Backup</Heading>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {/* Download Backup Card */}
            <div className="p-4 rounded-card bg-[#141414] border border-border-subtle flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-cream-bg" />
                <h4 className="text-body font-medium text-text-primary">
                  Export Vault Backup
                </h4>
              </div>
              <p className="text-label text-text-secondary leading-relaxed">
                Download a full JSON archive of all your notes, modular blocks, tags, canvas sketches, and audio memos.
              </p>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="mt-1 px-4 py-2 rounded-pill bg-cream-bg text-cream-text text-label font-medium flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Backup (.json)</span>
              </button>
            </div>

            {/* Restore Backup Card */}
            <div className="p-4 rounded-card bg-[#141414] border border-border-subtle flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <Upload className="w-4 h-4 text-accent-yellow" />
                <h4 className="text-body font-medium text-text-primary">
                  Restore From Backup
                </h4>
              </div>
              <p className="text-label text-text-secondary leading-relaxed">
                Import an existing vault JSON file. Notes will be safely merged or updated in your local offline storage.
              </p>

              <label className="mt-1 px-4 py-2 rounded-pill border border-border-subtle hover:border-cream-bg/60 text-text-primary text-label font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Choose Backup File (.json)</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileRestore}
                  className="hidden"
                />
              </label>

              {restoreStatus && (
                <div className="flex items-center gap-2 text-label text-cream-bg animate-fadeIn">
                  <Check className="w-3.5 h-3.5" />
                  <span>{restoreStatus}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
