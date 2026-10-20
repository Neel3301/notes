import React, { useState } from 'react';
import {
  Sparkles,
  X,
  FileText,
  ListTodo,
  Tag as TagIcon,
  Wand2,
  Check,
  Plus,
  Loader2,
  Copy,
  ArrowRight,
} from 'lucide-react';
import { aiAssistantService } from '../../services/aiAssistantService';

/**
 * AiAssistantSheet component
 * Slide-up bottom sheet offering 1-tap AI assistance:
 * - Summarize Note
 * - Extract Action Items (creates interactive checklist block)
 * - Auto-generate Tags
 * - Polish & Expand note outline
 */
export default function AiAssistantSheet({
  note,
  onClose,
  onInsertBlock,
  onApplyTags,
  onReplaceContent,
  onAppendContent,
  className = '',
}) {
  const [activeAction, setActiveAction] = useState(null); // 'summary' | 'tasks' | 'tags' | 'polish'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [appliedFeedback, setAppliedFeedback] = useState('');

  const runAction = (actionKey) => {
    setActiveAction(actionKey);
    setLoading(true);
    setResult(null);

    setTimeout(() => {
      if (actionKey === 'summary') {
        const res = aiAssistantService.summarizeNote(note);
        setResult(res);
      } else if (actionKey === 'tasks') {
        const res = aiAssistantService.extractActionItems(note);
        setResult(res);
      } else if (actionKey === 'tags') {
        const res = aiAssistantService.generateTags(note);
        setResult(res);
      } else if (actionKey === 'polish') {
        const res = aiAssistantService.expandOrPolish(note);
        setResult(res);
      }
      setLoading(false);
    }, 350);
  };

  const handleInsertSummaryAsBlock = () => {
    if (!result?.summary) return;
    onInsertBlock?.({
      type: 'callout',
      title: 'AI Summary & Takeaways',
      content: `${result.summary}\n\nKey Points:\n${result.keyPoints.map((p) => `• ${p}`).join('\n')}`,
    });
    setAppliedFeedback('Summary inserted as callout block!');
    setTimeout(() => {
      setAppliedFeedback('');
      onClose?.();
    }, 1200);
  };

  const handleInsertTasksAsBlock = () => {
    if (!Array.isArray(result)) return;
    onInsertBlock?.({
      type: 'checklist',
      title: 'AI Action Items',
      items: result,
    });
    setAppliedFeedback('Action items inserted as checklist block!');
    setTimeout(() => {
      setAppliedFeedback('');
      onClose?.();
    }, 1200);
  };

  const handleApplyTags = () => {
    if (!Array.isArray(result)) return;
    onApplyTags?.(result);
    setAppliedFeedback('Tags added to note!');
    setTimeout(() => {
      setAppliedFeedback('');
      onClose?.();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center select-none bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Surface */}
      <div
        className={`relative z-10 w-full max-w-[390px] max-h-[85vh] bg-[#141414] border-t border-border-subtle rounded-t-[16px] p-5 shadow-2xl flex flex-col gap-4 overflow-y-auto animate-slideUp ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-divider/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-cream-bg/10 flex items-center justify-center text-cream-bg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-body font-medium text-text-primary">
                AI Note Assistant
              </h3>
              <p className="text-[11px] text-text-secondary">
                1-tap intelligent note actions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Choice Pills */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => runAction('summary')}
            className={`p-3 rounded-card text-left border transition-all flex flex-col gap-1.5 ${
              activeAction === 'summary'
                ? 'bg-[#1C1C1C] border-cream-bg text-text-primary'
                : 'bg-[#181818] border-border-subtle/50 text-text-secondary hover:text-text-primary hover:border-border-subtle'
            }`}
          >
            <div className="flex items-center justify-between">
              <FileText className="w-4 h-4 text-cream-bg" />
              <ArrowRight className="w-3 h-3 opacity-60" />
            </div>
            <span className="text-body text-[13px] font-medium text-text-primary">
              Summarize
            </span>
            <span className="text-[11px] text-text-secondary/70">
              Key synopsis & points
            </span>
          </button>

          <button
            type="button"
            onClick={() => runAction('tasks')}
            className={`p-3 rounded-card text-left border transition-all flex flex-col gap-1.5 ${
              activeAction === 'tasks'
                ? 'bg-[#1C1C1C] border-cream-bg text-text-primary'
                : 'bg-[#181818] border-border-subtle/50 text-text-secondary hover:text-text-primary hover:border-border-subtle'
            }`}
          >
            <div className="flex items-center justify-between">
              <ListTodo className="w-4 h-4 text-accent-yellow" />
              <ArrowRight className="w-3 h-3 opacity-60" />
            </div>
            <span className="text-body text-[13px] font-medium text-text-primary">
              Extract Tasks
            </span>
            <span className="text-[11px] text-text-secondary/70">
              Interactive checklist
            </span>
          </button>

          <button
            type="button"
            onClick={() => runAction('tags')}
            className={`p-3 rounded-card text-left border transition-all flex flex-col gap-1.5 ${
              activeAction === 'tags'
                ? 'bg-[#1C1C1C] border-cream-bg text-text-primary'
                : 'bg-[#181818] border-border-subtle/50 text-text-secondary hover:text-text-primary hover:border-border-subtle'
            }`}
          >
            <div className="flex items-center justify-between">
              <TagIcon className="w-4 h-4 text-card-blue" />
              <ArrowRight className="w-3 h-3 opacity-60" />
            </div>
            <span className="text-body text-[13px] font-medium text-text-primary">
              Suggest Tags
            </span>
            <span className="text-[11px] text-text-secondary/70">
              Smart taxonomy
            </span>
          </button>

          <button
            type="button"
            onClick={() => runAction('polish')}
            className={`p-3 rounded-card text-left border transition-all flex flex-col gap-1.5 ${
              activeAction === 'polish'
                ? 'bg-[#1C1C1C] border-cream-bg text-text-primary'
                : 'bg-[#181818] border-border-subtle/50 text-text-secondary hover:text-text-primary hover:border-border-subtle'
            }`}
          >
            <div className="flex items-center justify-between">
              <Wand2 className="w-4 h-4 text-cream-bg" />
              <ArrowRight className="w-3 h-3 opacity-60" />
            </div>
            <span className="text-body text-[13px] font-medium text-text-primary">
              Polish Note
            </span>
            <span className="text-[11px] text-text-secondary/70">
              Expand structure
            </span>
          </button>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-text-secondary animate-fadeIn">
            <Loader2 className="w-5 h-5 animate-spin text-cream-bg" />
            <span className="text-label text-[12px]">Analyzing note context...</span>
          </div>
        )}

        {/* Feedback Alert */}
        {appliedFeedback && (
          <div className="p-2.5 rounded-card bg-cream-bg/10 border border-cream-bg/30 text-cream-bg text-label flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>{appliedFeedback}</span>
          </div>
        )}

        {/* Result Area */}
        {!loading && result && (
          <div className="p-3.5 rounded-card bg-[#181818] border border-border-subtle flex flex-col gap-3 animate-fadeIn">
            {/* 1. Summary result */}
            {activeAction === 'summary' && (
              <div className="flex flex-col gap-2.5">
                <span className="text-label uppercase tracking-wider text-text-secondary font-medium text-[11px]">
                  Generated Summary
                </span>
                <p className="text-body text-text-primary leading-relaxed text-[13px]">
                  {result.summary}
                </p>
                <div className="flex flex-col gap-1 pt-1">
                  {result.keyPoints.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-label text-text-secondary">
                      <span className="text-cream-bg">•</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleInsertSummaryAsBlock}
                  className="mt-2 w-full py-2 rounded-pill bg-cream-bg text-cream-text text-label font-medium flex items-center justify-center gap-1.5 hover:scale-[1.01] transition-transform"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert as Callout Block</span>
                </button>
              </div>
            )}

            {/* 2. Tasks result */}
            {activeAction === 'tasks' && (
              <div className="flex flex-col gap-2.5">
                <span className="text-label uppercase tracking-wider text-text-secondary font-medium text-[11px]">
                  Extracted Action Items ({result.length})
                </span>
                <div className="flex flex-col gap-1.5">
                  {result.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-body text-[13px] text-text-primary">
                      <div className="w-3.5 h-3.5 rounded-sm border border-border-subtle" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleInsertTasksAsBlock}
                  className="mt-2 w-full py-2 rounded-pill bg-cream-bg text-cream-text text-label font-medium flex items-center justify-center gap-1.5 hover:scale-[1.01] transition-transform"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert as Checklist Block</span>
                </button>
              </div>
            )}

            {/* 3. Tags result */}
            {activeAction === 'tags' && (
              <div className="flex flex-col gap-2.5">
                <span className="text-label uppercase tracking-wider text-text-secondary font-medium text-[11px]">
                  Recommended Tags
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {result.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-pill bg-[#222222] border border-cream-bg/40 text-cream-bg text-label"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleApplyTags}
                  className="mt-2 w-full py-2 rounded-pill bg-cream-bg text-cream-text text-label font-medium flex items-center justify-center gap-1.5 hover:scale-[1.01] transition-transform"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tags to Note</span>
                </button>
              </div>
            )}

            {/* 4. Polish result */}
            {activeAction === 'polish' && (
              <div className="flex flex-col gap-2.5">
                <span className="text-label uppercase tracking-wider text-text-secondary font-medium text-[11px]">
                  Polished Markdown Preview
                </span>
                <div className="p-2.5 rounded-card bg-[#111111] max-h-40 overflow-y-auto text-body text-[12px] font-mono text-text-primary whitespace-pre-wrap">
                  {result}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onReplaceContent?.(result);
                      setAppliedFeedback('Content updated!');
                      setTimeout(() => {
                        setAppliedFeedback('');
                        onClose?.();
                      }, 1200);
                    }}
                    className="flex-1 py-2 rounded-pill bg-cream-bg text-cream-text text-label font-medium text-center"
                  >
                    Replace Note
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onAppendContent?.(result);
                      setAppliedFeedback('Appended to note!');
                      setTimeout(() => {
                        setAppliedFeedback('');
                        onClose?.();
                      }, 1200);
                    }}
                    className="flex-1 py-2 rounded-pill border border-border-subtle hover:border-cream-bg text-text-primary text-label font-medium text-center"
                  >
                    Append to Bottom
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
