import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Trash2,
  CheckCircle2,
  Circle,
  Plus,
  X,
  Lightbulb,
  Code2,
  FileText,
  ListTodo,
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

/**
 * BlockItem component
 * Notion-style block row styled after course-detail.jpg numbered lesson rows.
 *
 * Types:
 * - 'text': rich text / markdown content
 * - 'checklist': interactive tasks with toggleable checkboxes
 * - 'callout': emphasized tip / alert box
 * - 'code': monospace code snippet with syntax styling
 */
export default function BlockItem({
  block,
  index,
  totalBlocks,
  isEditing,
  isOpen,
  onToggleOpen,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  onToggleCheckItem,
}) {
  const [newItemText, setNewItemText] = useState('');

  const numberDisplay = block.number || String(index + 1).padStart(2, '0');

  const handleTitleChange = (e) => {
    onChange({ ...block, title: e.target.value });
  };

  const handleContentChange = (e) => {
    onChange({ ...block, content: e.target.value });
  };

  const handleAddCheckItem = (e) => {
    e?.preventDefault();
    if (!newItemText.trim()) return;
    const items = block.items || [];
    const newItem = {
      id: `chk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: newItemText.trim(),
      completed: false,
    };
    onChange({ ...block, items: [...items, newItem] });
    setNewItemText('');
  };

  const handleRemoveCheckItem = (itemId) => {
    const items = (block.items || []).filter((i) => i.id !== itemId);
    onChange({ ...block, items });
  };

  const handleCheckItemTextChange = (itemId, text) => {
    const items = (block.items || []).map((i) =>
      i.id === itemId ? { ...i, text } : i
    );
    onChange({ ...block, items });
  };

  // Type Icon helper
  const getTypeIcon = () => {
    switch (block.type) {
      case 'checklist':
        return <ListTodo className="w-3.5 h-3.5 text-cream-bg" />;
      case 'callout':
        return <Lightbulb className="w-3.5 h-3.5 text-accent-yellow" />;
      case 'code':
        return <Code2 className="w-3.5 h-3.5 text-card-blue" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-text-secondary" />;
    }
  };

  // Task count summary for checklists
  const getSummary = () => {
    if (block.type === 'checklist' && block.items) {
      const completed = block.items.filter((i) => i.completed).length;
      return `${completed}/${block.items.length} tasks completed`;
    }
    return block.description || '';
  };

  return (
    <div className="w-full py-3.5 border-b border-divider transition-all select-none">
      {/* Block Header Row */}
      <div className="w-full flex items-center gap-3">
        {/* Number index (01, 02...) */}
        <span className="text-body font-mono text-text-secondary shrink-0 w-6">
          {numberDisplay}
        </span>

        {/* Title & Type Badge */}
        <div
          onClick={onToggleOpen}
          className="flex-1 min-w-0 cursor-pointer flex items-center gap-2 group"
        >
          <div className="flex items-center gap-1.5 shrink-0">
            {getTypeIcon()}
          </div>

          {isEditing ? (
            <input
              type="text"
              value={block.title || ''}
              onClick={(e) => e.stopPropagation()}
              onChange={handleTitleChange}
              placeholder="Block title..."
              className="flex-1 bg-transparent border-b border-border-subtle/50 text-body font-medium text-text-primary px-1 py-0.5 outline-none focus:border-cream-bg transition-colors"
            />
          ) : (
            <div className="flex-1 min-w-0">
              <h4 className="text-body font-medium text-text-primary truncate group-hover:text-cream-bg transition-colors">
                {block.title || `Block ${numberDisplay}`}
              </h4>
              {getSummary() && !isOpen && (
                <p className="text-label text-text-secondary truncate mt-0.5">
                  {getSummary()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {isEditing && (
            <>
              {/* Move Up */}
              <button
                type="button"
                onClick={onMoveUp}
                disabled={index === 0}
                className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-20 transition-opacity"
                title="Move block up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>

              {/* Move Down */}
              <button
                type="button"
                onClick={onMoveDown}
                disabled={index === totalBlocks - 1}
                className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-20 transition-opacity"
                title="Move block down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>

              {/* Delete Block */}
              <button
                type="button"
                onClick={onDelete}
                className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-red-400 transition-colors"
                title="Delete block"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Expand/Collapse Chevron */}
          <button
            type="button"
            onClick={onToggleOpen}
            className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            {isOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Block Body */}
      {isOpen && (
        <div className="mt-3.5 pl-9 pr-1 animate-fadeIn flex flex-col gap-3">
          {/* 1. TEXT BLOCK */}
          {block.type === 'text' && (
            <div>
              {isEditing ? (
                <textarea
                  value={block.content || ''}
                  onChange={handleContentChange}
                  placeholder="Write block content (markdown supported)..."
                  rows={4}
                  className="w-full p-3 rounded-card bg-[#111111] border border-border-subtle text-body text-text-primary font-mono text-[13px] leading-relaxed resize-none outline-none focus:border-cream-bg transition-colors"
                />
              ) : (
                <div className="text-body text-text-secondary leading-relaxed">
                  <MarkdownRenderer content={block.content || ''} />
                </div>
              )}
            </div>
          )}

          {/* 2. CHECKLIST BLOCK */}
          {block.type === 'checklist' && (
            <div className="flex flex-col gap-2">
              {/* Task Items */}
              {block.items && block.items.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {block.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 group/item"
                    >
                      {/* Checkbox Toggle (active in both view and edit modes) */}
                      <button
                        type="button"
                        onClick={() => onToggleCheckItem(block.id, item.id)}
                        className="shrink-0 text-text-secondary hover:text-cream-bg transition-colors"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-accent-yellow fill-accent-yellow/20" />
                        ) : (
                          <Circle className="w-4 h-4 text-text-secondary/70 group-hover/item:text-text-primary" />
                        )}
                      </button>

                      {/* Text */}
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) =>
                            handleCheckItemTextChange(item.id, e.target.value)
                          }
                          className={`flex-1 bg-transparent text-body outline-none border-b border-transparent focus:border-border-subtle transition-colors ${
                            item.completed
                              ? 'line-through text-text-secondary/60'
                              : 'text-text-primary'
                          }`}
                        />
                      ) : (
                        <span
                          onClick={() => onToggleCheckItem(block.id, item.id)}
                          className={`text-body cursor-pointer select-none transition-colors ${
                            item.completed
                              ? 'line-through text-text-secondary/60'
                              : 'text-text-primary hover:text-cream-bg'
                          }`}
                        >
                          {item.text}
                        </span>
                      )}

                      {/* Remove item button (edit mode) */}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCheckItem(item.id)}
                          className="opacity-0 group-hover/item:opacity-100 text-text-secondary hover:text-red-400 p-1 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-label text-text-secondary/60 italic">
                  No checklist items yet.
                </p>
              )}

              {/* Add Checklist Item input */}
              {isEditing && (
                <form
                  onSubmit={handleAddCheckItem}
                  className="flex items-center gap-2 mt-2 pt-2 border-t border-divider/40"
                >
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="New task..."
                    className="flex-1 bg-[#111111] px-3 py-1.5 rounded-pill border border-border-subtle text-body text-text-primary text-[13px] outline-none focus:border-cream-bg"
                  />
                  <button
                    type="submit"
                    disabled={!newItemText.trim()}
                    className="px-3 py-1.5 rounded-pill bg-cream-bg text-cream-text text-label font-medium disabled:opacity-40 transition-opacity flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 3. CALLOUT BLOCK */}
          {block.type === 'callout' && (
            <div className="bg-[#141414] border-l-2 border-cream-bg rounded-r-[8px] p-3.5 flex items-start gap-3">
              <Lightbulb className="w-4 h-4 text-cream-bg shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <textarea
                    value={block.content || ''}
                    onChange={handleContentChange}
                    placeholder="Callout text or key takeaway..."
                    rows={2}
                    className="w-full bg-transparent text-body text-text-primary text-[13px] leading-relaxed resize-none outline-none border-b border-border-subtle/40 focus:border-cream-bg"
                  />
                ) : (
                  <p className="text-body text-text-secondary text-[13px] leading-relaxed">
                    {block.content || 'Important note or highlight.'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 4. CODE BLOCK */}
          {block.type === 'code' && (
            <div className="rounded-[8px] overflow-hidden border border-border-subtle bg-[#0C0C0C]">
              <div className="px-3 py-1.5 bg-[#161616] border-b border-border-subtle/50 flex items-center justify-between text-label text-text-secondary font-mono">
                <span>{block.language || 'code'}</span>
                <Code2 className="w-3.5 h-3.5 opacity-60" />
              </div>
              <div className="p-3">
                {isEditing ? (
                  <textarea
                    value={block.content || ''}
                    onChange={handleContentChange}
                    placeholder="// write code here..."
                    rows={4}
                    className="w-full bg-transparent font-mono text-[13px] text-text-primary leading-relaxed resize-none outline-none"
                  />
                ) : (
                  <pre className="font-mono text-[13px] text-text-primary whitespace-pre-wrap overflow-x-auto">
                    {block.content || '// empty code block'}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
