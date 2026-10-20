import React, { useState } from 'react';
import { Link2, ArrowUpRight, Plus, ExternalLink } from 'lucide-react';

/**
 * BacklinksDrawer component
 * Displays bi-directional backlinks (linked references) to the active note.
 * Also provides quick link insertion buttons in edit mode.
 */
export default function BacklinksDrawer({
  currentNoteId,
  backlinks = [],
  availableNotes = [],
  isEditing = false,
  onNavigateToNote,
  onInsertLink,
  className = '',
}) {
  const [showSuggester, setShowSuggester] = useState(false);

  // Other notes that can be linked
  const linkableNotes = availableNotes.filter((n) => n.id !== currentNoteId && !n.trashed);

  return (
    <div className={`w-full flex flex-col gap-3 select-none ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-label text-text-secondary uppercase tracking-wider font-medium">
          <Link2 className="w-3.5 h-3.5 text-cream-bg" />
          <span>Linked References ({backlinks.length})</span>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={() => setShowSuggester((prev) => !prev)}
            className="text-[11px] text-cream-bg hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Insert [[Link]]</span>
          </button>
        )}
      </div>

      {/* Link Suggester Picker (Edit Mode) */}
      {showSuggester && isEditing && (
        <div className="p-3 rounded-card bg-[#161616] border border-border-subtle animate-fadeIn flex flex-col gap-2">
          <div className="flex items-center justify-between text-label text-text-secondary">
            <span>Tap to insert note link</span>
            <button
              type="button"
              onClick={() => setShowSuggester(false)}
              className="text-[11px] hover:text-text-primary"
            >
              Close
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
            {linkableNotes.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  const cleanTitle = n.title.replace(/\n+/g, ' ');
                  onInsertLink?.(`[[${cleanTitle}]]`);
                  setShowSuggester(false);
                }}
                className="px-2.5 py-1 rounded-pill bg-[#202020] hover:bg-cream-bg hover:text-cream-text text-label text-text-primary border border-border-subtle/50 transition-colors truncate max-w-[200px]"
              >
                [[{n.title.replace(/\n+/g, ' ')}]]
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backlinks List */}
      {backlinks.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {backlinks.map(({ note, snippet }, idx) => (
            <div
              key={note.id || idx}
              onClick={() => onNavigateToNote?.(note)}
              className="w-full p-3.5 rounded-card bg-[#141414] border border-border-subtle hover:border-cream-bg/60 cursor-pointer flex flex-col gap-1.5 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-body font-medium text-text-primary group-hover:text-cream-bg transition-colors truncate">
                  {note.title.replace(/\n+/g, ' ')}
                </span>
                <span className="text-text-secondary group-hover:text-cream-bg flex items-center gap-1 text-[11px] font-mono shrink-0">
                  <span>Open</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>

              {snippet && (
                <p className="text-label text-text-secondary/80 leading-relaxed italic line-clamp-2">
                  "{snippet}"
                </p>
              )}

              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-text-secondary/60">
                <span>{note.notebook || 'Quick Notes'}</span>
                <span>•</span>
                <span>{note.date || 'Recent'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-card bg-[#101010] border border-border-subtle/40 text-center">
          <p className="text-label text-text-secondary/60">
            No linked references found. Mention this note elsewhere using <span className="text-cream-bg font-mono">[[Note Title]]</span> to create a bi-directional backlink.
          </p>
        </div>
      )}
    </div>
  );
}
