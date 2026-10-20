import React, { useState } from 'react';
import { Plus, FileText, ListTodo, Lightbulb, Code2 } from 'lucide-react';
import BlockItem from './BlockItem';

/**
 * BlockList component
 * Manages Notion-style modular blocks matching course-detail.jpg numbered lesson rows.
 *
 * Supports:
 * - Text, Checklist, Callout, Code blocks
 * - Interactive checklist task toggling
 * - Reordering (up/down)
 * - Block addition and deletion
 * - Numbered index synchronization ('01', '02', '03'...)
 */
export default function BlockList({
  blocks = [],
  isEditing = false,
  onChange,
  onToggleCheckItem,
}) {
  const [openBlockId, setOpenBlockId] = useState(blocks[0]?.id || null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Sync two-digit numbering across blocks
  const renumber = (items) =>
    items.map((b, idx) => ({
      ...b,
      number: String(idx + 1).padStart(2, '0'),
    }));

  const handleToggleOpen = (id) => {
    setOpenBlockId((prev) => (prev === id ? null : id));
  };

  const handleBlockChange = (index, updatedBlock) => {
    const nextBlocks = [...blocks];
    nextBlocks[index] = updatedBlock;
    onChange?.(nextBlocks);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const nextBlocks = [...blocks];
    const temp = nextBlocks[index - 1];
    nextBlocks[index - 1] = nextBlocks[index];
    nextBlocks[index] = temp;
    onChange?.(renumber(nextBlocks));
  };

  const handleMoveDown = (index) => {
    if (index === blocks.length - 1) return;
    const nextBlocks = [...blocks];
    const temp = nextBlocks[index + 1];
    nextBlocks[index + 1] = nextBlocks[index];
    nextBlocks[index] = temp;
    onChange?.(renumber(nextBlocks));
  };

  const handleDelete = (index) => {
    const nextBlocks = blocks.filter((_, idx) => idx !== index);
    onChange?.(renumber(nextBlocks));
  };

  const handleAddBlock = (type) => {
    const newId = `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newBlock = {
      id: newId,
      number: String(blocks.length + 1).padStart(2, '0'),
      type,
      title:
        type === 'checklist'
          ? 'Checklist'
          : type === 'callout'
          ? 'Key Insight'
          : type === 'code'
          ? 'Code Snippet'
          : 'Section Notes',
      content:
        type === 'callout'
          ? 'Key takeaway or design principle.'
          : type === 'code'
          ? '// code snippet here\nconst result = true;'
          : '',
      items:
        type === 'checklist'
          ? [
              {
                id: `chk-${Date.now()}`,
                text: 'New task item',
                completed: false,
              },
            ]
          : undefined,
      language: type === 'code' ? 'javascript' : undefined,
    };

    const nextBlocks = [...blocks, newBlock];
    onChange?.(nextBlocks);
    setOpenBlockId(newId);
    setShowAddMenu(false);
  };

  // Toggle checklist item status (works in both edit and preview modes)
  const handleToggleCheck = (blockId, itemId) => {
    if (onToggleCheckItem) {
      onToggleCheckItem(blockId, itemId);
      return;
    }

    const nextBlocks = blocks.map((b) => {
      if (b.id !== blockId || !b.items) return b;
      return {
        ...b,
        items: b.items.map((item) =>
          item.id === itemId
            ? { ...item, completed: !item.completed }
            : item
        ),
      };
    });
    onChange?.(nextBlocks);
  };

  return (
    <div className="w-full flex flex-col">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-label text-text-secondary uppercase tracking-wider font-medium">
          Blocks & Modular Content
        </h3>
        <span className="text-label text-text-secondary/70">
          {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
        </span>
      </div>

      {/* Blocks List */}
      <div className="flex flex-col">
        {blocks.map((block, idx) => (
          <BlockItem
            key={block.id || idx}
            block={block}
            index={idx}
            totalBlocks={blocks.length}
            isEditing={isEditing}
            isOpen={openBlockId === block.id}
            onToggleOpen={() => handleToggleOpen(block.id)}
            onChange={(updated) => handleBlockChange(idx, updated)}
            onMoveUp={() => handleMoveUp(idx)}
            onMoveDown={() => handleMoveDown(idx)}
            onDelete={() => handleDelete(idx)}
            onToggleCheckItem={handleToggleCheck}
          />
        ))}
      </div>

      {/* Add Block Toolbar (always accessible or highlighted in edit mode) */}
      <div className="mt-4 flex flex-col items-center">
        {!showAddMenu ? (
          <button
            type="button"
            onClick={() => setShowAddMenu(true)}
            className="w-full py-2.5 px-4 rounded-pill border border-dashed border-border-subtle/80 hover:border-cream-bg/60 text-label text-text-secondary hover:text-cream-bg flex items-center justify-center gap-2 transition-colors select-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Block</span>
          </button>
        ) : (
          <div className="w-full p-2.5 rounded-card bg-[#121212] border border-border-subtle animate-fadeIn flex flex-col gap-2">
            <div className="flex items-center justify-between px-2 text-label text-text-secondary">
              <span>Select block type</span>
              <button
                type="button"
                onClick={() => setShowAddMenu(false)}
                className="text-text-secondary hover:text-text-primary text-[11px]"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleAddBlock('text')}
                className="flex items-center gap-2 px-3 py-2 rounded-[6px] bg-[#1A1A1A] hover:bg-[#222222] text-text-primary text-label transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-text-secondary" />
                <span>Text Block</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddBlock('checklist')}
                className="flex items-center gap-2 px-3 py-2 rounded-[6px] bg-[#1A1A1A] hover:bg-[#222222] text-text-primary text-label transition-colors"
              >
                <ListTodo className="w-3.5 h-3.5 text-cream-bg" />
                <span>Checklist</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddBlock('callout')}
                className="flex items-center gap-2 px-3 py-2 rounded-[6px] bg-[#1A1A1A] hover:bg-[#222222] text-text-primary text-label transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5 text-accent-yellow" />
                <span>Callout Tip</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddBlock('code')}
                className="flex items-center gap-2 px-3 py-2 rounded-[6px] bg-[#1A1A1A] hover:bg-[#222222] text-text-primary text-label transition-colors"
              >
                <Code2 className="w-3.5 h-3.5 text-card-blue" />
                <span>Code Box</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
