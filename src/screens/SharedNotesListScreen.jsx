import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, Link, Lock, Globe, Plus, ExternalLink, ArrowRight, Clock, Trash2 } from 'lucide-react';
import AppHeader from '../components/layout/AppHeader';
import Heading from '../components/ui/Heading';
import Button from '../components/ui/Button';
import { useNotesStore } from '../data/notesStore';

/**
 * SharedNotesListScreen component
 * Allows users to view all notes they have shared publicly/privately,
 * access shared links, and enter a shared note link or slug to view it.
 */
export default function SharedNotesListScreen({
  onOpenShareModal,
  onMenuClick,
}) {
  const navigate = useNavigate();
  const store = useNotesStore();

  const [inputSlug, setInputSlug] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sample or stored shared notes
  const [sharedNotes, setSharedNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('edsy_shared_notes_cache');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return [
      {
        id: 'share-1',
        slug: 'design-tokens-v2',
        title: 'Design System & Token Architecture',
        isPrivate: false,
        createdAt: '2 hours ago',
        views: 14,
      },
      {
        id: 'share-2',
        slug: 'q4-strategy-private',
        title: 'Q4 Product Roadmap & Vision',
        isPrivate: true,
        createdAt: 'Yesterday',
        views: 3,
      },
    ];
  });

  const handleOpenSlug = (e) => {
    e.preventDefault();
    const clean = inputSlug.trim().replace(/^.*\/#\/share\//, '').replace(/^.*\/share\//, '');
    if (!clean) {
      setErrorMsg('Please enter a valid slug or share URL');
      return;
    }
    setErrorMsg('');
    navigate(`/share/${clean}`);
  };

  return (
    <div className="w-full min-h-screen bg-screen text-text-primary px-5 pt-3 pb-8 md:px-12 md:py-8 flex flex-col justify-between max-w-5xl mx-auto">
      <div className="flex flex-col">
        {/* Mobile Header (hidden on desktop) */}
        <div className="md:hidden">
          <AppHeader
            left="menu"
            logo=".edsy"
            onLeftClick={onMenuClick || (() => navigate('/menu'))}
          />
        </div>

        {/* Heading */}
        <div className="mt-6 md:mt-0 flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-label text-cream-bg uppercase tracking-wider font-mono">
              Collaborative Hub
            </span>
            <Heading>Shared Notes</Heading>
          </div>

          <button
            type="button"
            onClick={() => navigate('/notes')}
            className="px-4 py-2 rounded-button bg-cream-bg text-cream-text text-body font-medium flex items-center gap-2 hover:opacity-95 transition-opacity"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Share a Note</span>
          </button>
        </div>

        {/* Quick Link Opener Card */}
        <div className="mt-8 p-5 md:p-6 rounded-card bg-[#111111] border border-border-subtle/50 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-text-primary font-medium text-body">
            <Link className="w-4 h-4 text-cream-bg" />
            <span>Open a Shared Note</span>
          </div>
          <p className="text-label text-text-secondary">
            Enter a shareable link or custom slug to read a publicly or privately shared note.
          </p>

          <form onSubmit={handleOpenSlug} className="mt-2 flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <input
              type="text"
              value={inputSlug}
              onChange={(e) => {
                setInputSlug(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g. design-tokens-v2 or paste full link"
              className="flex-1 px-4 py-2.5 rounded-card bg-[#181818] border border-border-subtle text-body text-text-primary placeholder:text-text-dimmed outline-none focus:border-cream-bg transition-colors"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-button bg-cream-bg text-cream-text text-body font-medium flex items-center gap-1.5 shrink-0 hover:opacity-95 active:scale-95 transition-all"
            >
              <span>Open Note</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          {errorMsg && <p className="text-xs text-red-400 mt-1">{errorMsg}</p>}
        </div>

        {/* Active Shared Links */}
        <div className="mt-8">
          <h3 className="text-label text-text-dimmed uppercase tracking-wider font-medium px-1 mb-3">
            Active Shared Links
          </h3>

          <div className="flex flex-col gap-3">
            {sharedNotes.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-card bg-[#0D0D0D] border border-border-subtle/40 hover:border-border-subtle flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-start gap-3 truncate">
                  <div className="p-2.5 rounded-card bg-divider/40 text-text-secondary shrink-0 mt-0.5">
                    {item.isPrivate ? (
                      <Lock className="w-4 h-4 text-accent-yellow" />
                    ) : (
                      <Globe className="w-4 h-4 text-cream-bg" />
                    )}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-body font-medium text-text-primary truncate">
                      {item.title}
                    </span>
                    <span className="text-label text-text-dimmed font-mono mt-0.5 truncate">
                      #/share/{item.slug}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden sm:inline-block text-[11px] text-text-dimmed">
                    {item.createdAt}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/share/${item.slug}`)}
                    className="p-2 rounded-card border border-border-subtle hover:border-cream-bg/60 text-text-secondary hover:text-text-primary transition-colors"
                    title="View shared note"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
