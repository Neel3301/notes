import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Unlock, ArrowLeft, Download, Check, ShieldCheck, Globe } from 'lucide-react';
import Heading from '../components/ui/Heading';
import Button from '../components/ui/Button';
import MarkdownRenderer from '../components/note/MarkdownRenderer';
import BlockList from '../components/note/BlockList';
import AudioMemoBlock from '../components/note/AudioMemoBlock';
import { useNotesStore } from '../data/notesStore';

/**
 * SharedNoteScreen component
 * Standalone web viewer for public and password-protected notes (SHR-01, SHR-02).
 * Allows recipients to view notes in any browser without an account, and import them.
 */
export default function SharedNoteScreen() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const store = useNotesStore();

  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [imported, setImported] = useState(false);
  const [noteData, setNoteData] = useState(null);

  // Load shared note by slug
  useEffect(() => {
    // 1. Check local cache or mock database
    setLoading(true);
    setTimeout(() => {
      // Sample mock response or local match
      if (slug === 'q4-strategy-private') {
        setIsLocked(true);
        setNoteData({
          id: 'shared-private-1',
          title: 'Q4 Product Roadmap & Vision',
          author: 'Alex',
          date: 'Yesterday',
          color: 'blue',
          notebook: 'Strategy',
          isPrivate: true,
          correctPassword: 'edsy',
          content: '## Confidential Q4 Milestones\n\n- E2EE Zero-Knowledge Sync\n- Public and Private Link Sharing\n- Responsive Desktop Dashboard\n- Android APK Parity Release',
          blocks: [
            {
              id: 'b1',
              number: '01',
              title: 'Core Philosophy',
              content: 'Privacy first. User data must never touch unencrypted cloud servers.',
              items: [],
            },
          ],
        });
      } else {
        // Public note
        setIsLocked(false);
        setNoteData({
          id: 'shared-public-1',
          title: 'Design System & Token Architecture',
          author: 'Design Team',
          date: 'Today',
          color: 'yellow',
          notebook: 'Design Systems',
          isPrivate: false,
          content: '## Edsy Token Guidelines\n\nAll screens use `#000000` canvas background with curated accent card colors:\n- Blue: `#6F91B6`\n- Light: `#DCE3EB`\n- Yellow: `#CABC3F`\n- Primary CTA: `#E5E7DA`\n\nUse typography styles `.text-display` (46px) and `.text-title` (30px).',
          blocks: [
            {
              id: 'b1',
              number: '01',
              title: 'Verified Color Tokens',
              content: 'Pure black canvas, high contrast, minimalist typography.',
              items: [
                { id: 'i1', text: 'Black Canvas (#000000)', completed: true },
                { id: 'i2', text: 'Cream CTA (#E5E7DA)', completed: true },
              ],
            },
          ],
        });
      }
      setLoading(false);
    }, 200);
  }, [slug]);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (noteData?.correctPassword && passwordInput !== noteData.correctPassword) {
      setPasswordError('Incorrect password. Please try again.');
      return;
    }
    setPasswordError('');
    setIsLocked(false);
  };

  const handleImport = () => {
    if (!noteData) return;
    const importedNote = store.saveNote({
      title: noteData.title,
      author: noteData.author || 'Shared',
      notebook: 'Imported Notes',
      color: noteData.color || 'blue',
      content: noteData.content || '',
      blocks: noteData.blocks || [],
      sketchData: noteData.sketchData || null,
      audioData: noteData.audioData || null,
      tags: ['Shared', 'Imported'],
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setImported(true);
    setTimeout(() => {
      navigate('/editor', { state: { note: importedNote, noteId: importedNote.id } });
    }, 800);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-screen text-text-primary flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-cream-bg border-t-transparent animate-spin" />
          <span className="text-body text-text-secondary font-light">Loading shared note...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-screen text-text-primary px-5 py-8 md:px-12 md:py-12 flex flex-col justify-between max-w-4xl mx-auto">
      <div>
        {/* Top Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-border-subtle/30">
          <button
            type="button"
            onClick={() => navigate('/notes')}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-body transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Notes</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-text-dimmed px-2 py-0.5 rounded border border-border-subtle/40">
              {noteData?.isPrivate ? 'Private Encrypted' : 'Public Note'}
            </span>
            <span className="text-sm font-light text-cream-bg">.edsy</span>
          </div>
        </div>

        {/* Password Protection Gate */}
        {isLocked ? (
          <div className="py-16 md:py-24 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-divider/40 border border-border-subtle flex items-center justify-center mb-6">
              <Lock className="w-6 h-6 text-accent-yellow" />
            </div>

            <h2 className="text-title text-text-primary font-light">
              This note is password protected
            </h2>
            <p className="text-body text-text-secondary mt-2">
              The author has encrypted this note. Enter the correct password to decrypt and view the contents.
            </p>

            <form onSubmit={handleUnlock} className="mt-6 w-full flex flex-col gap-3">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                placeholder="Enter password..."
                className="w-full px-4 py-3 rounded-card bg-[#121212] border border-border-subtle text-text-primary placeholder:text-text-dimmed outline-none focus:border-cream-bg transition-colors text-center text-body tracking-wider"
                autoFocus
              />
              {passwordError && (
                <span className="text-xs text-red-400">{passwordError}</span>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-button bg-cream-bg text-cream-text text-body font-medium flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all mt-1"
              >
                <Unlock className="w-4 h-4" />
                <span>Decrypt Note</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-6 animate-fadeIn">
            {/* Note Header Details */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 text-label text-text-dimmed mb-2">
                  <span className="text-cream-bg font-mono">By {noteData?.author || 'Unknown'}</span>
                  <span>•</span>
                  <span>{noteData?.date || 'Recently'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[11px] text-accent-yellow">
                    <ShieldCheck className="w-3 h-3" />
                    <span>E2EE Verified</span>
                  </span>
                </div>
                <h1 className="text-display text-text-primary font-light tracking-[-0.035em] leading-[1.05]">
                  {noteData?.title}
                </h1>
              </div>

              {/* Import to My Notes Action */}
              <button
                type="button"
                onClick={handleImport}
                disabled={imported}
                className="px-5 py-2.5 rounded-button bg-cream-bg text-cream-text text-body font-medium flex items-center gap-2 hover:opacity-95 active:scale-95 transition-all shrink-0"
              >
                {imported ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Imported to Notes!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 stroke-[2]" />
                    <span>Import into My Notes</span>
                  </>
                )}
              </button>
            </div>

            {/* Note Markdown Content */}
            {noteData?.content && (
              <div className="rounded-card p-6 bg-divider/20 border border-border-subtle/30 mt-4">
                <MarkdownRenderer content={noteData.content} />
              </div>
            )}

            {/* Blocks */}
            {noteData?.blocks && noteData.blocks.length > 0 && (
              <div className="mt-2">
                <BlockList blocks={noteData.blocks} isEditing={false} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-6 border-t border-border-subtle/30 flex items-center justify-between text-label text-text-dimmed">
        <span>Powered by Edsy Notes</span>
        <button
          type="button"
          onClick={() => navigate('/timeline')}
          className="hover:text-text-primary text-cream-bg transition-colors"
        >
          Create your own note →
        </button>
      </footer>
    </div>
  );
}
