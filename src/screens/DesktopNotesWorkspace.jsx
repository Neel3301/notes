import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MoreVertical,
  Plus,
  Heart,
  X,
  Folder,
  Edit3,
  Check,
  Palette,
  Download,
  FileDown,
  FileCode,
  Sparkles,
  Share2,
} from 'lucide-react';
import SearchPill from '../components/ui/SearchPill';
import IconButton from '../components/ui/IconButton';
import Button from '../components/ui/Button';
import Tabs from '../components/ui/Tabs';
import NoteCard from '../components/note/NoteCard';
import MarkdownRenderer from '../components/note/MarkdownRenderer';
import BlockList from '../components/note/BlockList';
import CanvasSketchpad from '../components/note/CanvasSketchpad';
import AudioMemoBlock from '../components/note/AudioMemoBlock';
import BacklinksDrawer from '../components/note/BacklinksDrawer';
import AiAssistantSheet from '../components/note/AiAssistantSheet';
import { useNotesStore } from '../data/notesStore';

/**
 * DesktopNotesWorkspace component
 * Premium responsive dual-pane workspace for desktop & laptop viewports (DSH-02).
 * Left pane: searchable note catalog with filter tags & active note indicator.
 * Right pane: active multi-modal note editor with instant live-saving.
 */
export default function DesktopNotesWorkspace({
  onShareNote,
  onOpenAuth,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const store = useNotesStore();

  // Search & Filter state
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(
    location.state?.tagFilter || 'All'
  );
  const [selectedNotebook, setSelectedNotebook] = useState(
    location.state?.notebookFilter || null
  );
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Active note selection
  const nonTrashedNotes = store.notes.filter((n) => !n.trashed);
  const passedNoteId = location.state?.noteId || location.state?.note?.id;
  const initialSelectedId = passedNoteId || (nonTrashedNotes[0]?.id || null);
  const [selectedNoteId, setSelectedNoteId] = useState(initialSelectedId);

  // Sync state if navigation changes
  useEffect(() => {
    if (location.state?.noteId) {
      setSelectedNoteId(location.state.noteId);
    }
    if (location.state?.tagFilter) {
      setSelectedTag(location.state.tagFilter);
    }
    if (location.state?.notebookFilter) {
      setSelectedNotebook(location.state.notebookFilter);
    }
  }, [location.state]);

  // Selected note object
  const activeNote = store.getNote(selectedNoteId) || nonTrashedNotes[0] || null;

  // Editor states for active note
  const [activeTab, setActiveTab] = useState('Preview');
  const [title, setTitle] = useState(activeNote?.title || '');
  const [content, setContent] = useState(activeNote?.content || '');
  const [notebook, setNotebook] = useState(activeNote?.notebook || 'Quick Notes');
  const [blocks, setBlocks] = useState(activeNote?.blocks || []);
  const [sketchData, setSketchData] = useState(activeNote?.sketchData || null);
  const [audioData, setAudioData] = useState(activeNote?.audioData || null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAiSheet, setShowAiSheet] = useState(false);

  // Update editor state when active note changes
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title || '');
      setContent(activeNote.content || '');
      setNotebook(activeNote.notebook || 'Quick Notes');
      setBlocks(activeNote.blocks || []);
      setSketchData(activeNote.sketchData || null);
      setAudioData(activeNote.audioData || null);
    }
  }, [activeNote?.id]);

  // Backlinks
  const backlinks = (activeNote?.id && typeof store?.getBacklinks === 'function')
    ? store.getBacklinks(activeNote.id)
    : [];

  const filterTags = ['All', 'Favorites', 'Design', 'Frontend', 'Art', 'Tokens'];

  // Filter notes
  const filteredNotes = nonTrashedNotes.filter((note) => {
    if (selectedNotebook && note.notebook !== selectedNotebook) return false;
    if (selectedTag === 'Favorites') {
      if (!note.liked) return false;
    } else if (selectedTag !== 'All') {
      if (!note.tags || !note.tags.includes(selectedTag)) return false;
    }
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      const titleMatch = note.title?.toLowerCase().includes(q);
      const contentMatch = note.content?.toLowerCase().includes(q);
      const tagMatch = note.tags?.some((t) => t.toLowerCase().includes(q));
      if (!titleMatch && !contentMatch && !tagMatch) return false;
    }
    return true;
  });

  const handleSave = (updatedFields = {}) => {
    if (activeNote?.id) {
      store.saveNote({
        id: activeNote.id,
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

  const handleCreateNew = () => {
    const newNote = store.saveNote({
      title: query.trim() ? query.trim() : 'New Note',
      author: 'You',
      notebook: selectedNotebook || 'Quick Notes',
      color: 'blue',
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tags: selectedTag !== 'All' && selectedTag !== 'Favorites' ? [selectedTag] : ['Idea'],
      content: '# New Note\n\nStart writing...',
    });
    setQuery('');
    setSelectedNoteId(newNote.id);
    setActiveTab('Write');
  };

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

  const handleExportMarkdown = () => {
    if (!activeNote?.id) return;
    const md = store.exportAsMarkdown(activeNote.id);
    const cleanName = (title || 'note').toLowerCase().replace(/[^a-z0-9]+/g, '_') + '.md';
    downloadFile(cleanName, md, 'text/markdown;charset=utf-8');
    setShowExportMenu(false);
  };

  const handleExportJson = () => {
    if (!activeNote) return;
    const json = JSON.stringify(activeNote, null, 2);
    const cleanName = (title || 'note').toLowerCase().replace(/[^a-z0-9]+/g, '_') + '.json';
    downloadFile(cleanName, json, 'application/json;charset=utf-8');
    setShowExportMenu(false);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden bg-screen text-text-primary">
      {/* LEFT COLUMN: Search & Note Catalog List (~380px) */}
      <div className="w-full lg:w-96 xl:w-[420px] h-full border-r border-border-subtle/30 flex flex-col bg-[#050505] shrink-0">
        {/* Search & Actions Header */}
        <div className="p-4 border-b border-border-subtle/30 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchPill
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes, tags, ideas..."
                onClear={() => setQuery('')}
              />
            </div>
            <IconButton
              icon={<Plus className="w-4 h-4 text-cream-bg" />}
              label="New note"
              variant="outlined"
              onClick={handleCreateNew}
            />
          </div>

          {/* Filter Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {filterTags.map((t) => {
              const active = selectedTag === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTag(t)}
                  className={`px-3 py-1 rounded-pill text-[11px] whitespace-nowrap transition-all ${
                    active
                      ? 'bg-cream-bg text-cream-text font-medium'
                      : 'bg-transparent text-text-secondary border border-border-subtle/50 hover:text-text-primary'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* Notebook filter badge */}
          {selectedNotebook && (
            <div className="flex items-center justify-between px-2.5 py-1 rounded-pill bg-[#1A1A1A] border border-cream-bg/40 text-[11px] text-text-primary">
              <div className="flex items-center gap-1.5 truncate">
                <Folder className="w-3 h-3 text-cream-bg shrink-0" />
                <span className="truncate">Notebook: <strong className="text-cream-bg">{selectedNotebook}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotebook(null)}
                className="p-0.5 text-text-secondary hover:text-text-primary ml-1 shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Note Cards List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 flex flex-col gap-3">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((card) => {
              const isSelected = card.id === selectedNoteId;
              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedNoteId(card.id)}
                  className={`cursor-pointer rounded-card transition-all ${
                    isSelected ? 'ring-2 ring-cream-bg/80 scale-[1.01]' : 'hover:opacity-90'
                  }`}
                >
                  <NoteCard
                    color={card.color}
                    author={card.author}
                    title={card.title}
                    time={card.time || card.date}
                    liked={card.liked}
                    fullWidth={true}
                    onLikeToggle={(e) => {
                      e.stopPropagation();
                      store.toggleLike(card.id);
                    }}
                  />
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center text-text-secondary text-body">
              No notes found
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Note Editor Workspace (Full Height) */}
      <div className="flex-1 h-full overflow-y-auto bg-screen flex flex-col p-6 lg:p-8 xl:p-10 max-w-4xl mx-auto">
        {activeNote ? (
          <div className="flex flex-col h-full justify-between">
            <div>
              {/* Note Header / Meta */}
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle/30 text-label text-text-secondary">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full border border-border-subtle font-mono text-[11px] text-cream-bg">
                    {notebook}
                  </span>
                  <span>{activeNote.date || 'Today'} • {activeNote.time || '12:00'}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Share Note Button */}
                  <button
                    type="button"
                    onClick={() => onShareNote?.(activeNote)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-button border border-border-subtle hover:border-cream-bg/60 text-text-secondary hover:text-text-primary text-[12px] transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-cream-bg" />
                    <span>Share</span>
                  </button>

                  {/* AI Assistant Button */}
                  <button
                    type="button"
                    onClick={() => setShowAiSheet(true)}
                    className="p-1.5 rounded-button border border-cream-bg/40 bg-cream-bg/10 hover:bg-cream-bg/20 text-cream-bg transition-colors"
                    title="AI Assistant"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>

                  {/* Export Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowExportMenu((prev) => !prev)}
                      className="p-1.5 rounded-button border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
                      title="Export"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {showExportMenu && (
                      <div className="absolute top-8 right-0 z-40 bg-[#161616] border border-border-subtle rounded-card py-1.5 shadow-2xl min-w-[150px] flex flex-col animate-fadeIn">
                        <button
                          type="button"
                          onClick={handleExportMarkdown}
                          className="px-3 py-1.5 text-label text-left text-text-secondary hover:text-text-primary hover:bg-divider/50 flex items-center gap-2"
                        >
                          <FileDown className="w-3 h-3 text-cream-bg" />
                          <span>Export .md</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleExportJson}
                          className="px-3 py-1.5 text-label text-left text-text-secondary hover:text-text-primary hover:bg-divider/50 flex items-center gap-2"
                        >
                          <FileCode className="w-3 h-3 text-accent-yellow" />
                          <span>Export .json</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Title Section */}
              <div className="mt-6">
                {activeTab === 'Write' ? (
                  <textarea
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      handleSave({ title: e.target.value });
                    }}
                    placeholder="Note title..."
                    rows={1}
                    className="w-full bg-transparent text-display text-text-primary font-light tracking-[-0.035em] leading-[1.05] resize-none outline-none border-b border-border-subtle/40 pb-2 focus:border-cream-bg transition-colors"
                  />
                ) : (
                  <h1 className="text-display text-text-primary font-light tracking-[-0.035em] leading-[1.05]">
                    {title}
                  </h1>
                )}
              </div>

              {/* Mode Toggle Button & Tabs */}
              <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
                <Button
                  variant="cream"
                  onClick={() => {
                    if (activeTab === 'Write') {
                      handleSave();
                      setActiveTab('Preview');
                    } else {
                      setActiveTab('Write');
                    }
                  }}
                  icon={activeTab === 'Write' ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                >
                  {activeTab === 'Write' ? 'Done Editing' : 'Edit Note'}
                </Button>

                <Tabs
                  items={['Preview', 'Write', 'Canvas']}
                  active={activeTab}
                  onChange={(tab) => {
                    if (activeTab === 'Write') handleSave();
                    setActiveTab(tab);
                  }}
                />
              </div>

              {/* Tab Contents */}
              <div className="mt-8">
                {/* PREVIEW TAB */}
                {activeTab === 'Preview' && (
                  <div className="flex flex-col gap-6 animate-fadeIn pb-12">
                    {content && (
                      <div className="rounded-card p-5 bg-divider/20 border border-border-subtle/30">
                        <MarkdownRenderer
                          content={content}
                          onLinkClick={(linkedTitle) => {
                            const matched = store.notes.find((n) =>
                              n.title.toLowerCase().includes(linkedTitle.toLowerCase())
                            );
                            if (matched) setSelectedNoteId(matched.id);
                          }}
                        />
                      </div>
                    )}

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
                          <img src={sketchData} alt="Sketch" className="w-full h-56 object-contain" />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <h3 className="text-label text-text-secondary uppercase tracking-wider font-medium">
                        Voice Memo
                      </h3>
                      <AudioMemoBlock
                        audioData={audioData}
                        onUpdate={(newAudio) => {
                          setAudioData(newAudio);
                          store.updateNote(activeNote.id, { audioData: newAudio });
                        }}
                        onDelete={() => {
                          setAudioData(null);
                          store.updateNote(activeNote.id, { audioData: null });
                        }}
                      />
                    </div>

                    <div className="mt-2">
                      <BlockList
                        blocks={blocks}
                        isEditing={false}
                        onChange={(next) => {
                          setBlocks(next);
                          store.updateNote(activeNote.id, { blocks: next });
                        }}
                      />
                    </div>

                    <div className="mt-6 pt-4 border-t border-border-subtle/50">
                      <BacklinksDrawer
                        currentNoteId={activeNote.id}
                        backlinks={backlinks}
                        availableNotes={store.notes}
                        isEditing={false}
                        onNavigateToNote={(n) => setSelectedNoteId(n.id)}
                      />
                    </div>
                  </div>
                )}

                {/* WRITE TAB */}
                {activeTab === 'Write' && (
                  <div className="flex flex-col gap-5 animate-fadeIn pb-12">
                    <textarea
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        handleSave({ content: e.target.value });
                      }}
                      placeholder="Write your note in markdown (# headings, - lists, `code`, [[Backlinks]])..."
                      rows={14}
                      className="w-full p-5 rounded-card bg-[#111111] border border-border-subtle text-body text-text-primary font-mono text-[14px] leading-relaxed resize-none outline-none focus:border-cream-bg transition-colors"
                    />

                    <div className="flex flex-col gap-2 pt-2">
                      <h4 className="text-label text-text-secondary uppercase tracking-wider font-medium">
                        Voice Memo
                      </h4>
                      <AudioMemoBlock
                        audioData={audioData}
                        onUpdate={(newAudio) => {
                          setAudioData(newAudio);
                          store.updateNote(activeNote.id, { audioData: newAudio });
                        }}
                        onDelete={() => {
                          setAudioData(null);
                          store.updateNote(activeNote.id, { audioData: null });
                        }}
                      />
                    </div>

                    <div className="mt-2 pt-4 border-t border-border-subtle/50">
                      <BlockList
                        blocks={blocks}
                        isEditing={true}
                        onChange={(next) => {
                          setBlocks(next);
                          store.updateNote(activeNote.id, { blocks: next });
                        }}
                      />
                    </div>

                    <div className="mt-2 pt-4 border-t border-border-subtle/50">
                      <BacklinksDrawer
                        currentNoteId={activeNote.id}
                        backlinks={backlinks}
                        availableNotes={store.notes}
                        isEditing={true}
                        onNavigateToNote={(n) => setSelectedNoteId(n.id)}
                        onInsertLink={(syntax) => {
                          const nextContent = content ? `${content}\n${syntax}` : syntax;
                          setContent(nextContent);
                          handleSave({ content: nextContent });
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* CANVAS TAB */}
                {activeTab === 'Canvas' && (
                  <div className="flex flex-col animate-fadeIn pb-12">
                    <div className="flex items-center justify-between text-label text-text-secondary mb-3">
                      <div className="flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-cream-bg" />
                        <span>Freehand Canvas Sketchpad</span>
                      </div>
                      <span className="text-[11px] text-text-secondary/70">
                        Auto-saved to note
                      </span>
                    </div>

                    <CanvasSketchpad
                      initialData={sketchData}
                      onSave={(dataUrl) => {
                        setSketchData(dataUrl);
                        store.updateNote(activeNote.id, { sketchData: dataUrl });
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <h3 className="text-title text-text-secondary font-light">No note selected</h3>
            <p className="text-body text-text-dimmed mt-2">
              Select a note from the left or create a new one to begin writing.
            </p>
            <button
              type="button"
              onClick={handleCreateNew}
              className="mt-5 px-6 py-2.5 rounded-button bg-cream-bg text-cream-text text-body font-medium"
            >
              + Create Note
            </button>
          </div>
        )}
      </div>

      {/* AI Assistant Action Sheet */}
      {showAiSheet && activeNote && (
        <AiAssistantSheet
          note={activeNote}
          onClose={() => setShowAiSheet(false)}
          onInsertBlock={(blockData) => {
            const nextBlock = {
              ...blockData,
              id: `block-ai-${Date.now()}`,
              number: String(blocks.length + 1).padStart(2, '0'),
            };
            const updated = [...blocks, nextBlock];
            setBlocks(updated);
            store.updateNote(activeNote.id, { blocks: updated });
          }}
          onApplyTags={(newTags) => {
            const currentTags = activeNote.tags || [];
            const merged = Array.from(new Set([...currentTags, ...newTags]));
            store.updateNote(activeNote.id, { tags: merged });
          }}
          onReplaceContent={(newContent) => {
            setContent(newContent);
            handleSave({ content: newContent });
          }}
          onAppendContent={(appendContent) => {
            const merged = content ? `${content}\n\n${appendContent}` : appendContent;
            setContent(merged);
            handleSave({ content: merged });
          }}
        />
      )}
    </div>
  );
}
