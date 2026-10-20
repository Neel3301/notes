import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Edit3,
  Check,
  Palette,
  FileText,
  ChevronDown,
  Download,
  FileDown,
  FileCode,
  Link2,
  Sparkles,
} from 'lucide-react';
import AppHeader from '../components/layout/AppHeader';
import Heading from '../components/ui/Heading';
import Button from '../components/ui/Button';
import Tabs from '../components/ui/Tabs';
import MarkdownRenderer from '../components/note/MarkdownRenderer';
import BlockList from '../components/note/BlockList';
import CanvasSketchpad from '../components/note/CanvasSketchpad';
import AudioMemoBlock from '../components/note/AudioMemoBlock';
import BacklinksDrawer from '../components/note/BacklinksDrawer';
import AiAssistantSheet from '../components/note/AiAssistantSheet';
import { useNotesStore } from '../data/notesStore';

/**
 * NoteEditorScreen component
 * Note Detail & Editor Screen.
 * Strictly reproduces design-reference/course-detail.jpg.
 *
 * Features:
 * - Signature cream primary action button (#E5E7DA)
 * - Interactive tab switching: 'Preview' / 'Write' / 'Canvas'
 * - Markdown preview rendering and live writing textarea
 * - Notion-style modular blocks with interactive checklists, callouts, and reordering
 * - HTML5 freehand Canvas sketchpad with stroke/color controls
 * - Interactive voice audio memo recorder and scrubber player
 * - Auto-save integration with notesStore
 */
export default function NoteEditorScreen({
  header = { left: 'back', logo: undefined },
  heading: propHeading,
  actionButton: propActionButton,
  tabs = ['Preview', 'Write', 'Canvas'],
  previewLessons = [],
  details = {},
  onBackClick,
  className = '',
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const store = useNotesStore();

  // Resolve note ID from router location state or fallback to first available
  const passedNote = location.state?.note;
  const passedNoteId = location.state?.noteId || passedNote?.id;

  const currentStoreNote = passedNoteId
    ? store.getNote(passedNoteId)
    : store.notes[0];

  const initialNote = currentStoreNote || passedNote || {
    id: 'note-draft',
    title: propHeading || 'Untitled Note',
    author: 'You',
    notebook: 'Quick Notes',
    color: 'blue',
    content: '# Draft Note\n\nStart writing your ideas...',
    blocks: [],
    tags: ['Draft'],
    liked: false,
    date: 'Today',
  };

  const [activeTab, setActiveTab] = useState(tabs[0] || 'Preview');
  const [title, setTitle] = useState(initialNote.title);
  const [content, setContent] = useState(initialNote.content || '');
  const [notebook, setNotebook] = useState(initialNote.notebook || 'Notes');
  const [blocks, setBlocks] = useState(initialNote.blocks || []);
  const [sketchData, setSketchData] = useState(initialNote.sketchData || null);
  const [audioData, setAudioData] = useState(initialNote.audioData || null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAiSheet, setShowAiSheet] = useState(false);

  // Compute bi-directional backlinks to this note
  const backlinks = (currentStoreNote?.id && typeof store?.getBacklinks === 'function')
    ? store.getBacklinks(currentStoreNote.id)
    : [];

  // AI Assistant action handlers
  const handleAiInsertBlock = (blockData) => {
    const nextBlock = {
      ...blockData,
      id: `block-ai-${Date.now()}`,
      number: String(blocks.length + 1).padStart(2, '0'),
    };
    handleBlocksChange([...blocks, nextBlock]);
  };

  const handleAiApplyTags = (newTags) => {
    if (!currentStoreNote?.id) return;
    const currentTags = currentStoreNote.tags || [];
    const merged = Array.from(new Set([...currentTags, ...newTags]));
    store.updateNote(currentStoreNote.id, { tags: merged });
  };

  const handleAiReplaceContent = (newContent) => {
    setContent(newContent);
    handleSave({ content: newContent });
  };

  const handleAiAppendContent = (appendContent) => {
    const merged = content ? `${content}\n\n${appendContent}` : appendContent;
    setContent(merged);
    handleSave({ content: merged });
  };

  // Sync state if store updates externally
  useEffect(() => {
    if (currentStoreNote) {
      setTitle(currentStoreNote.title);
      setContent(currentStoreNote.content || '');
      setNotebook(currentStoreNote.notebook || 'Notes');
      setBlocks(currentStoreNote.blocks || []);
      setSketchData(currentStoreNote.sketchData || null);
      setAudioData(currentStoreNote.audioData || null);
    }
  }, [currentStoreNote?.id]);

  // Save changes to notesStore
  const handleSave = (updatedFields = {}) => {
    if (currentStoreNote?.id) {
      store.saveNote({
        id: currentStoreNote.id,
        title,
        content,
        notebook,
        blocks,
        sketchData,
        audioData,
        ...updatedFields,
      });
    }
  };

  // Update blocks and persist immediately
  const handleBlocksChange = (nextBlocks) => {
    setBlocks(nextBlocks);
    if (currentStoreNote?.id) {
      store.updateNote(currentStoreNote.id, { blocks: nextBlocks });
    }
  };

  // Update sketch data and persist immediately
  const handleSketchSave = (dataUrl) => {
    setSketchData(dataUrl);
    if (currentStoreNote?.id) {
      store.updateNote(currentStoreNote.id, { sketchData: dataUrl });
    }
  };

  // Update audio memo data
  const handleAudioUpdate = (newAudioData) => {
    setAudioData(newAudioData);
    if (currentStoreNote?.id) {
      store.updateNote(currentStoreNote.id, { audioData: newAudioData });
    }
  };

  const handleAudioDelete = () => {
    setAudioData(null);
    if (currentStoreNote?.id) {
      store.updateNote(currentStoreNote.id, { audioData: null });
    }
  };

  // Browser download helper
  const downloadFile = (filename, fileContent, type = 'text/plain') => {
    const blob = new Blob([fileContent], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export note as Markdown
  const handleExportMarkdown = () => {
    if (!currentStoreNote?.id) return;
    const md = store.exportAsMarkdown(currentStoreNote.id);
    const cleanName = (title || 'note').toLowerCase().replace(/[^a-z0-9]+/g, '_') + '.md';
    downloadFile(cleanName, md, 'text/markdown;charset=utf-8');
    setShowExportMenu(false);
  };

  // Export note as JSON
  const handleExportJson = () => {
    if (!currentStoreNote) return;
    const json = JSON.stringify(currentStoreNote, null, 2);
    const cleanName = (title || 'note').toLowerCase().replace(/[^a-z0-9]+/g, '_') + '.json';
    downloadFile(cleanName, json, 'application/json;charset=utf-8');
    setShowExportMenu(false);
  };

  // Toggle between Edit mode and Preview mode
  const handleToggleMode = () => {
    if (activeTab === 'Write') {
      handleSave();
      setActiveTab('Preview');
    } else {
      setActiveTab('Write');
    }
  };

  return (
    <div
      className={`w-full min-h-screen bg-screen text-text-primary px-5 pt-3 pb-8 flex flex-col justify-between select-none ${className}`}
    >
      <div className="flex flex-col">
        {/* App Header */}
        <AppHeader
          left={header.left || 'back'}
          logo={notebook || header.logo || '.edsy'}
          onLeftClick={onBackClick || (() => navigate(-1))}
        />

        {/* Hero Title */}
        <div className="mt-8">
          {activeTab === 'Write' ? (
            <textarea
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                handleSave({ title: e.target.value });
              }}
              placeholder="Note title..."
              rows={2}
              className="w-full bg-transparent text-title text-text-primary font-light tracking-[-0.03em] leading-[1.08] resize-none outline-none border-b border-border-subtle/50 pb-2 focus:border-cream-bg transition-colors"
            />
          ) : (
            <Heading>{title}</Heading>
          )}
        </div>

        {/* Signature Cream Action CTA Button & Export / AI Menu */}
        <div className="mt-7 flex items-center justify-between">
          <Button
            variant="cream"
            onClick={handleToggleMode}
            icon={activeTab === 'Write' ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          >
            {activeTab === 'Write' ? 'Done' : 'Edit note'}
          </Button>

          <div className="flex items-center gap-2">
            {/* AI Assistant Button */}
            <button
              type="button"
              onClick={() => setShowAiSheet(true)}
              className="p-2.5 rounded-full border border-cream-bg/40 bg-cream-bg/10 hover:bg-cream-bg/25 text-cream-bg transition-all flex items-center justify-center group active:scale-95"
              title="AI Note Assistant"
            >
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </button>

            {/* Export Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu((prev) => !prev)}
                className="p-2.5 rounded-full border border-border-subtle hover:border-cream-bg/60 text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center"
                title="Export note"
              >
                <Download className="w-4 h-4" />
              </button>

              {showExportMenu && (
                <div className="absolute top-11 right-0 z-40 bg-[#161616] border border-border-subtle rounded-card py-1.5 shadow-2xl min-w-[160px] flex flex-col animate-fadeIn">
                  <button
                    type="button"
                    onClick={handleExportMarkdown}
                    className="px-3.5 py-2 text-label text-left text-text-secondary hover:text-text-primary hover:bg-divider/50 flex items-center gap-2 transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5 text-cream-bg" />
                    <span>Export as .md</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="px-3.5 py-2 text-label text-left text-text-secondary hover:text-text-primary hover:bg-divider/50 flex items-center gap-2 transition-colors"
                  >
                    <FileCode className="w-3.5 h-3.5 text-accent-yellow" />
                    <span>Export as .json</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="mt-8">
          <Tabs
            items={tabs}
            active={activeTab}
            onChange={(tab) => {
              if (activeTab === 'Write') {
                handleSave();
              }
              setActiveTab(tab);
            }}
          />
        </div>

        {/* Tab Content Area */}
        <div className="mt-5">
          {/* TAB 1: PREVIEW */}
          {activeTab === 'Preview' && (
            <div className="flex flex-col gap-6 animate-fadeIn pb-8">
              {/* Markdown Document Content */}
              {content && (
                <div className="rounded-card p-4 bg-divider/20 border border-border-subtle/30">
                  <MarkdownRenderer
                    content={content}
                    onLinkClick={(linkedTitle) => {
                      const matchedNote = store.notes.find(
                        (n) => n.title.toLowerCase().includes(linkedTitle.toLowerCase())
                      );
                      if (matchedNote) {
                        navigate('/editor', {
                          state: { note: matchedNote, noteId: matchedNote.id },
                        });
                      }
                    }}
                  />
                </div>
              )}

              {/* Freehand Sketch Preview Card (if sketch exists) */}
              {sketchData && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-label text-text-secondary uppercase tracking-wider font-medium">
                    <span>Attached Sketch</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('Canvas')}
                      className="text-cream-bg hover:underline text-[11px] lowercase"
                    >
                      edit in canvas
                    </button>
                  </div>
                  <div
                    onClick={() => setActiveTab('Canvas')}
                    className="w-full rounded-card overflow-hidden border border-border-subtle bg-[#121212] cursor-pointer hover:border-cream-bg/50 transition-colors"
                  >
                    <img
                      src={sketchData}
                      alt="Note sketch preview"
                      className="w-full h-44 object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Attached Audio Memo Player */}
              <div className="flex flex-col gap-2">
                <h3 className="text-label text-text-secondary uppercase tracking-wider font-medium">
                  Voice Memo Attachment
                </h3>
                <AudioMemoBlock
                  audioData={audioData}
                  onUpdate={handleAudioUpdate}
                  onDelete={handleAudioDelete}
                />
              </div>

              {/* Modular Blocks Engine (Numbered rows matching course-detail.jpg) */}
              <div className="mt-2">
                <BlockList
                  blocks={blocks}
                  isEditing={false}
                  onChange={handleBlocksChange}
                />
              </div>

              {/* Linked References & Bi-directional Backlinks */}
              <div className="mt-4 pt-4 border-t border-border-subtle/50">
                <BacklinksDrawer
                  currentNoteId={currentStoreNote?.id}
                  backlinks={backlinks}
                  availableNotes={store.notes}
                  isEditing={false}
                  onNavigateToNote={(targetNote) => {
                    navigate('/editor', {
                      state: { note: targetNote, noteId: targetNote.id },
                    });
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: WRITE / EDIT */}
          {activeTab === 'Write' && (
            <div className="flex flex-col gap-5 animate-fadeIn pb-8">
              <div className="flex items-center justify-between text-label text-text-secondary px-1">
                <span>Markdown Document</span>
                <span>{content.split(/\s+/).filter(Boolean).length} words</span>
              </div>

              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  handleSave({ content: e.target.value });
                }}
                placeholder="Write your note in markdown (supports # headings, - lists, `code`, [[Backlinks]])..."
                rows={12}
                className="w-full p-4 rounded-card bg-[#111111] border border-border-subtle text-body text-text-primary font-mono text-[14px] leading-relaxed resize-none outline-none focus:border-cream-bg transition-colors"
              />

              {/* Audio Memo in Write mode */}
              <div className="flex flex-col gap-2 pt-2">
                <h4 className="text-label text-text-secondary uppercase tracking-wider font-medium">
                  Voice Memo
                </h4>
                <AudioMemoBlock
                  audioData={audioData}
                  onUpdate={handleAudioUpdate}
                  onDelete={handleAudioDelete}
                />
              </div>

              {/* Editable Modular Blocks in Write mode */}
              <div className="mt-2 pt-4 border-t border-border-subtle/50">
                <BlockList
                  blocks={blocks}
                  isEditing={true}
                  onChange={handleBlocksChange}
                />
              </div>

              {/* Link Insertion Helper in Write mode */}
              <div className="mt-2 pt-4 border-t border-border-subtle/50">
                <BacklinksDrawer
                  currentNoteId={currentStoreNote?.id}
                  backlinks={backlinks}
                  availableNotes={store.notes}
                  isEditing={true}
                  onNavigateToNote={(targetNote) => {
                    navigate('/editor', {
                      state: { note: targetNote, noteId: targetNote.id },
                    });
                  }}
                  onInsertLink={(linkSyntax) => {
                    const nextContent = content ? `${content}\n${linkSyntax}` : linkSyntax;
                    setContent(nextContent);
                    handleSave({ content: nextContent });
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 3: CANVAS */}
          {activeTab === 'Canvas' && (
            <div className="flex flex-col animate-fadeIn pb-8">
              <div className="flex items-center justify-between text-label text-text-secondary mb-3 px-1">
                <div className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-cream-bg" />
                  <span>Freehand Canvas Pad</span>
                </div>
                <span className="text-[11px] text-text-secondary/70">
                  Auto-saved to note
                </span>
              </div>

              <CanvasSketchpad
                initialData={sketchData}
                onSave={handleSketchSave}
              />
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Action Sheet */}
      {showAiSheet && (
        <AiAssistantSheet
          note={currentStoreNote}
          onClose={() => setShowAiSheet(false)}
          onInsertBlock={handleAiInsertBlock}
          onApplyTags={handleAiApplyTags}
          onReplaceContent={handleAiReplaceContent}
          onAppendContent={handleAiAppendContent}
        />
      )}
    </div>
  );
}
