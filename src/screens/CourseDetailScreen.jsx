import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Edit3, Check, Palette, FileText, ChevronDown } from 'lucide-react';
import AppHeader from '../components/layout/AppHeader';
import Heading from '../components/ui/Heading';
import Button from '../components/ui/Button';
import Tabs from '../components/ui/Tabs';
import LessonRow from '../components/course/LessonRow';
import MarkdownRenderer from '../components/note/MarkdownRenderer';
import { useNotesStore } from '../data/notesStore';

/**
 * CourseDetailScreen component
 * Note Detail & Editor Screen.
 * Strictly reproduces design-reference/course-detail.jpg.
 *
 * Features:
 * - Signature cream primary action button (#E5E7DA)
 * - Interactive tab switching: 'Preview' / 'Write' / 'Canvas'
 * - Markdown preview rendering and live writing textarea
 * - Expandable block sections styled after lesson rows
 * - Auto-save integration with notesStore
 */
export default function CourseDetailScreen({
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
  const [openLessonId, setOpenLessonId] = useState('block-1-1');

  // Sync state if store updates externally
  useEffect(() => {
    if (currentStoreNote) {
      setTitle(currentStoreNote.title);
      setContent(currentStoreNote.content || '');
      setNotebook(currentStoreNote.notebook || 'Notes');
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
        ...updatedFields,
      });
    }
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

  const toggleBlock = (id) => {
    setOpenLessonId((prev) => (prev === id ? null : id));
  };

  // Blocks to display under preview (adapting lesson rows)
  const displayBlocks = currentStoreNote?.blocks && currentStoreNote.blocks.length > 0
    ? currentStoreNote.blocks
    : previewLessons;

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

        {/* Signature Cream Action CTA Button */}
        <div className="mt-7 flex items-center">
          <Button
            variant="cream"
            onClick={handleToggleMode}
            icon={activeTab === 'Write' ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          >
            {activeTab === 'Write' ? 'Done' : 'Edit note'}
          </Button>
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
              <div className="rounded-card p-4 bg-divider/20 border border-border-subtle/30">
                <MarkdownRenderer
                  content={content}
                  onLinkClick={(linkedTitle) => {
                    const matchedNote = store.notes.find(
                      (n) => n.title.toLowerCase().includes(linkedTitle.toLowerCase())
                    );
                    if (matchedNote) {
                      navigate('/course-detail', {
                        state: { note: matchedNote, noteId: matchedNote.id },
                      });
                    }
                  }}
                />
              </div>

              {/* Expandable Blocks List (Styled after Course Detail Lesson Rows) */}
              {displayBlocks && displayBlocks.length > 0 && (
                <div className="flex flex-col mt-2">
                  <h3 className="text-label text-text-secondary uppercase tracking-wider mb-2 font-medium">
                    Attached Blocks & Tasks
                  </h3>
                  {displayBlocks.map((block, idx) => (
                    <LessonRow
                      key={block.id || idx}
                      number={block.number || String(idx + 1).padStart(2, '0')}
                      title={block.title || block.type}
                      description={
                        block.description ||
                        (block.items ? `${block.items.filter((i) => i.completed).length}/${block.items.length} tasks completed` : block.content)
                      }
                      isOpen={openLessonId === block.id}
                      onToggle={() => toggleBlock(block.id)}
                      showDivider={idx < displayBlocks.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WRITE / EDIT */}
          {activeTab === 'Write' && (
            <div className="flex flex-col gap-4 animate-fadeIn pb-8">
              <div className="flex items-center justify-between text-label text-text-secondary px-1">
                <span>Markdown Editor</span>
                <span>{content.split(/\s+/).filter(Boolean).length} words</span>
              </div>

              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  handleSave({ content: e.target.value });
                }}
                placeholder="Write your note in markdown (supports # headings, - lists, `code`, [[Backlinks]])..."
                rows={16}
                className="w-full p-4 rounded-card bg-[#111111] border border-border-subtle text-body text-text-primary font-mono text-[14px] leading-relaxed resize-none outline-none focus:border-cream-bg transition-colors"
              />
            </div>
          )}

          {/* TAB 3: CANVAS */}
          {activeTab === 'Canvas' && (
            <div className="flex flex-col items-center justify-center p-8 rounded-card border border-border-subtle/50 bg-divider/20 text-center animate-fadeIn my-4">
              <div className="w-12 h-12 rounded-full border border-border-subtle flex items-center justify-center text-text-secondary mb-3">
                <Palette className="w-6 h-6" />
              </div>
              <h4 className="text-body font-medium text-text-primary">
                Freehand Canvas Pad
              </h4>
              <p className="text-label text-text-secondary mt-1 max-w-[240px]">
                Interactive visual sketchpad arriving in Phase 6. Supports brush sizes, eraser, and theme palette colors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
