import React from 'react';

/**
 * Helper to render inline markdown elements (bold, italic, code, backlinks)
 * without using dangerouslySetInnerHTML.
 */
function renderInline(text, onLinkClick) {
  if (!text) return null;

  // Pattern matches:
  // 1. Backlinks: [[Title]]
  // 2. Bold: **bold**
  // 3. Italic: *italic*
  // 4. Inline code: `code`
  const regex = /(\[\[[^\]]+\]\]|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Backlink [[Title]]
    if (part.startsWith('[[') && part.endsWith(']]')) {
      const linkTitle = part.slice(2, -2);
      return (
        <button
          key={index}
          type="button"
          onClick={() => onLinkClick?.(linkTitle)}
          className="inline-flex items-center px-2 py-0.5 rounded-pill bg-card-blue/20 text-card-blue border border-card-blue/30 text-[12px] font-medium mx-0.5 hover:bg-card-blue/30 transition-colors cursor-pointer"
        >
          {linkTitle}
        </button>
      );
    }

    // Bold **text**
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic *text*
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic text-text-primary/90">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Inline code `code`
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-divider/80 text-card-blue text-[13px] font-mono border border-border-subtle/50"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Plain text
    return <span key={index}>{part}</span>;
  });
}

/**
 * MarkdownRenderer component
 * Fast, lightweight, zero-dependency Markdown renderer designed for
 * dark high-contrast mobile typography.
 *
 * @param {string} content - Markdown text
 * @param {(title: string) => void} [onLinkClick] - Backlink click handler
 * @param {string} [className] - Optional custom classes
 */
export default function MarkdownRenderer({ content = '', onLinkClick, className = '' }) {
  if (!content) {
    return (
      <div className={`text-text-secondary text-body italic py-4 ${className}`}>
        No content written yet.
      </div>
    );
  }

  const lines = content.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let codeLang = '';

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Fenced Code Block start/end
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        elements.push(
          <div
            key={`code-${i}`}
            className="my-3 p-3.5 rounded-card bg-[#111111] border border-border-subtle/80 overflow-x-auto text-[13px] font-mono text-text-primary"
          >
            {codeLang && (
              <div className="text-[10px] uppercase tracking-wider text-text-secondary pb-1 border-b border-divider/40 mb-2">
                {codeLang}
              </div>
            )}
            <pre className="whitespace-pre overflow-x-auto no-scrollbar">
              {codeBuffer.join('\n')}
            </pre>
          </div>
        );
      }
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      i++;
      continue;
    }

    const trimmed = line.trim();

    // Empty line / paragraph break
    if (!trimmed) {
      elements.push(<div key={`empty-${i}`} className="h-3" />);
      i++;
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      elements.push(
        <div key={`hr-${i}`} className="border-b border-divider my-4" />
      );
      i++;
      continue;
    }

    // Heading 1 (# )
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1
          key={`h1-${i}`}
          className="text-title font-light text-text-primary tracking-tight mt-5 mb-2 whitespace-pre-line"
        >
          {renderInline(trimmed.slice(2), onLinkClick)}
        </h1>
      );
      i++;
      continue;
    }

    // Heading 2 (## )
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-[20px] font-medium text-text-primary tracking-tight mt-4 mb-2"
        >
          {renderInline(trimmed.slice(3), onLinkClick)}
        </h2>
      );
      i++;
      continue;
    }

    // Heading 3 (### )
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-body font-medium text-text-secondary mt-3 mb-1"
        >
          {renderInline(trimmed.slice(4), onLinkClick)}
        </h3>
      );
      i++;
      continue;
    }

    // Blockquote (> )
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-2 border-card-blue/90 pl-3.5 py-1.5 my-2.5 text-text-secondary text-body italic bg-divider/20 rounded-r-sm"
        >
          {renderInline(trimmed.slice(2), onLinkClick)}
        </blockquote>
      );
      i++;
      continue;
    }

    // Checklist item (- [x] or - [ ])
    if (/^[-*]\s+\[([ xX])\]\s+/.test(trimmed)) {
      const isChecked = trimmed.charAt(3) !== ' ';
      const itemText = trimmed.replace(/^[-*]\s+\[([ xX])\]\s+/, '');
      elements.push(
        <div key={`chk-${i}`} className="flex items-start gap-2.5 my-1.5 text-body">
          <div
            className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border text-[11px] ${
              isChecked
                ? 'bg-cream-bg text-cream-text border-cream-bg'
                : 'border-border-subtle bg-transparent'
            }`}
          >
            {isChecked ? '✓' : ''}
          </div>
          <span
            className={`flex-1 ${
              isChecked ? 'line-through text-text-secondary' : 'text-text-primary'
            }`}
          >
            {renderInline(itemText, onLinkClick)}
          </span>
        </div>
      );
      i++;
      continue;
    }

    // Unordered bullet list item (- or *)
    if (/^[-*]\s+/.test(trimmed)) {
      elements.push(
        <div key={`li-${i}`} className="flex items-start gap-2.5 my-1 text-body text-text-primary">
          <span className="text-text-secondary select-none mt-0.5">•</span>
          <span className="flex-1 leading-relaxed">
            {renderInline(trimmed.replace(/^[-*]\s+/, ''), onLinkClick)}
          </span>
        </div>
      );
      i++;
      continue;
    }

    // Ordered numbered list item (1. )
    if (/^\d+\.\s+/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (match) {
        elements.push(
          <div key={`ol-${i}`} className="flex items-start gap-2.5 my-1 text-body text-text-primary">
            <span className="text-text-secondary font-mono text-[13px] select-none min-w-[16px]">
              {match[1]}.
            </span>
            <span className="flex-1 leading-relaxed">
              {renderInline(match[2], onLinkClick)}
            </span>
          </div>
        );
        i++;
        continue;
      }
    }

    // Standard paragraph line
    elements.push(
      <p key={`p-${i}`} className="text-body text-text-primary/95 leading-relaxed my-1">
        {renderInline(line, onLinkClick)}
      </p>
    );
    i++;
  }

  return <div className={`flex flex-col ${className}`}>{elements}</div>;
}
