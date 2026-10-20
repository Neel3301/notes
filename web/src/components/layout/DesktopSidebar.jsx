import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  BookOpen,
  Share2,
  Trash2,
  Plus,
  Folder,
  Tag,
  Cloud,
  CloudOff,
  User,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useNotesStore } from '../../data/notesStore';

/**
 * DesktopSidebar component
 * Full-featured collapsible Left Sidebar for Desktop and Laptop viewports (>= 768px).
 * Strictly preserves the high-contrast Edsy dark minimalist design system.
 */
export default function DesktopSidebar({
  onNewNote,
  onOpenAuth,
  syncStatus = 'local', // 'local' | 'synced' | 'syncing' | 'offline'
  user = null,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useNotesStore();

  const [notebooksOpen, setNotebooksOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);

  // Compute notebooks and counts dynamically from store
  const notebooks = React.useMemo(() => {
    const counts = {};
    store.notes.forEach((n) => {
      if (!n.trashed) {
        const nb = n.notebook || 'Quick Notes';
        counts[nb] = (counts[nb] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [store.notes]);

  // Compute all unique tags
  const tags = React.useMemo(() => {
    const tagSet = new Set();
    store.notes.forEach((n) => {
      if (!n.trashed && Array.isArray(n.tags)) {
        n.tags.forEach((t) => tagSet.add(t));
      }
    });
    return Array.from(tagSet);
  }, [store.notes]);

  const navItems = [
    {
      id: 'timeline',
      label: 'Timeline',
      icon: <Calendar className="w-4 h-4" strokeWidth={1.75} />,
      path: '/timeline',
      active: location.pathname === '/timeline' || location.pathname === '/' || location.pathname === '/study-planning',
    },
    {
      id: 'notes',
      label: 'All Notes',
      icon: <BookOpen className="w-4 h-4" strokeWidth={1.75} />,
      path: '/notes',
      count: store.notes.filter((n) => !n.trashed).length,
      active: location.pathname === '/notes' || location.pathname === '/course-overview',
    },
    {
      id: 'shared',
      label: 'Shared Notes',
      icon: <Share2 className="w-4 h-4" strokeWidth={1.75} />,
      path: '/shared',
      active: location.pathname === '/shared',
    },
    {
      id: 'trash',
      label: 'Trash',
      icon: <Trash2 className="w-4 h-4" strokeWidth={1.75} />,
      path: '/menu',
      count: store.notes.filter((n) => n.trashed).length,
      active: false,
    },
  ];

  const handleCreateNote = () => {
    if (onNewNote) {
      onNewNote();
    } else {
      const newNote = store.saveNote({
        title: 'New Note',
        author: 'You',
        notebook: 'Quick Notes',
        color: 'blue',
        date: 'Today',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tags: ['Draft'],
        content: '# New Note\n\nWrite your thoughts here...',
      });
      navigate('/editor', { state: { note: newNote, noteId: newNote.id } });
    }
  };

  const handleSelectNotebook = (nbName) => {
    navigate('/notes', { state: { notebookFilter: nbName, tagFilter: 'All' } });
  };

  const handleSelectTag = (tag) => {
    navigate('/notes', { state: { tagFilter: tag, notebookFilter: null } });
  };

  return (
    <aside className="w-64 lg:w-72 h-screen bg-[#080808] border-r border-border-subtle/40 flex flex-col justify-between shrink-0 select-none z-20">
      {/* Top Header & Navigation */}
      <div className="flex flex-col overflow-y-auto no-scrollbar p-5">
        {/* Brand header */}
        <div className="flex items-center justify-between pb-6 border-b border-border-subtle/30">
          <div
            onClick={() => navigate('/timeline')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-xl font-light tracking-tight text-text-primary group-hover:text-cream-bg transition-colors">
              .edsy
            </span>
            <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded-full border border-border-subtle text-text-secondary">
              Notes
            </span>
          </div>

          <span className="text-[10px] font-mono text-text-dimmed px-1.5 py-0.5 rounded bg-divider/40">
            v2.0
          </span>
        </div>

        {/* Primary CTA: + New Note Button */}
        <button
          type="button"
          onClick={handleCreateNote}
          className="mt-5 w-full py-2.5 px-4 rounded-button bg-cream-bg text-cream-text text-body font-medium flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-lg shadow-cream-bg/5"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Note</span>
        </button>

        {/* Primary Nav Links */}
        <nav className="mt-6 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              className={`w-full px-3 py-2 rounded-card text-body flex items-center justify-between transition-colors ${
                item.active
                  ? 'bg-[#181818] text-text-primary font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-[#121212]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={item.active ? 'text-cream-bg' : 'text-text-secondary'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {typeof item.count === 'number' && item.count > 0 && (
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full bg-divider/60 text-text-secondary">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Notebooks Section */}
        <div className="mt-7">
          <button
            type="button"
            onClick={() => setNotebooksOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-label text-text-dimmed uppercase tracking-wider font-medium px-1 mb-2 hover:text-text-secondary transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5" />
              <span>Notebooks</span>
            </div>
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                notebooksOpen ? 'rotate-90' : ''
              }`}
            />
          </button>

          {notebooksOpen && (
            <div className="flex flex-col gap-0.5 pl-1">
              {notebooks.map((nb) => (
                <button
                  key={nb.name}
                  type="button"
                  onClick={() => handleSelectNotebook(nb.name)}
                  className="w-full px-2.5 py-1.5 rounded text-label text-text-secondary hover:text-text-primary hover:bg-[#121212] flex items-center justify-between transition-colors"
                >
                  <span className="truncate">{nb.name}</span>
                  <span className="text-[10px] font-mono text-text-dimmed">{nb.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tags Section */}
        {tags.length > 0 && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setTagsOpen((prev) => !prev)}
              className="w-full flex items-center justify-between text-label text-text-dimmed uppercase tracking-wider font-medium px-1 mb-2 hover:text-text-secondary transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Tags</span>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  tagsOpen ? 'rotate-90' : ''
                }`}
              />
            </button>

            {tagsOpen && (
              <div className="flex flex-wrap gap-1.5 pt-1 px-1">
                {tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleSelectTag(t)}
                    className="text-[11px] px-2 py-0.5 rounded-full border border-border-subtle/50 text-text-secondary hover:text-text-primary hover:border-cream-bg/50 transition-colors"
                  >
                    #{t}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer: Cloud Sync Status & Account */}
      <div className="p-4 border-t border-border-subtle/30 bg-[#060606] flex flex-col gap-2">
        {/* Sync Status Pill */}
        <div className="flex items-center justify-between px-3 py-2 rounded-card bg-[#101010] border border-border-subtle/40 text-label">
          <div className="flex items-center gap-2">
            {syncStatus === 'synced' ? (
              <Cloud className="w-3.5 h-3.5 text-accent-yellow" />
            ) : syncStatus === 'syncing' ? (
              <Cloud className="w-3.5 h-3.5 text-cream-bg animate-pulse" />
            ) : (
              <CloudOff className="w-3.5 h-3.5 text-text-dimmed" />
            )}
            <span className="text-text-secondary text-[11px]">
              {syncStatus === 'synced'
                ? 'Cloud Synced'
                : syncStatus === 'syncing'
                ? 'Syncing...'
                : 'Local Only (E2EE)'}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenAuth}
            className="text-[11px] text-cream-bg hover:underline font-medium"
          >
            {user ? 'Settings' : 'Enable Sync'}
          </button>
        </div>

        {/* User Account / Sign In */}
        <button
          type="button"
          onClick={onOpenAuth}
          className="w-full flex items-center justify-between px-3 py-2 rounded-card hover:bg-[#121212] transition-colors text-text-secondary hover:text-text-primary"
        >
          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-full bg-divider/60 border border-border-subtle flex items-center justify-center text-text-primary text-xs">
              <User className="w-3 h-3 text-text-secondary" />
            </div>
            <span className="text-body text-xs truncate">
              {user?.email || 'Offline Guest'}
            </span>
          </div>

          <span className="text-[10px] font-mono text-text-dimmed px-1.5 py-0.5 rounded border border-border-subtle/40">
            {user ? 'Account' : 'Sign in'}
          </span>
        </button>
      </div>
    </aside>
  );
}
