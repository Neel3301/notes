import React, { useState } from 'react';
import { Play } from 'lucide-react';

/**
 * LessonRow component
 * Expandable/collapsible lesson row from Course Detail screen.
 * Displays lesson index, title, description, and nested video thumbnail preview.
 *
 * @param {string | number} number - Lesson index (e.g. "01")
 * @param {string} title - Lesson title
 * @param {string} [description] - Optional lesson description
 * @param {string} [thumbnail] - Optional image URL for thumbnail
 * @param {boolean} [isOpen] - Controlled open/expanded state
 * @param {() => void} [onToggle] - Callback when row is clicked
 * @param {boolean} [showDivider=true] - Whether to show bottom divider line
 * @param {string} [className] - Optional custom classes
 */
export default function LessonRow({
  number,
  title,
  description,
  thumbnail,
  isOpen,
  onToggle,
  showDivider = true,
  className = '',
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isExpanded = isOpen !== undefined ? isOpen : internalOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  return (
    <div
      className={`w-full py-4 transition-all ${
        showDivider ? 'border-b border-divider' : ''
      } ${className}`}
    >
      <div
        onClick={handleToggle}
        className="w-full flex items-start gap-4 cursor-pointer select-none group"
      >
        {/* Number index */}
        <span className="text-body font-normal text-text-secondary shrink-0 pt-0.5 w-6">
          {typeof number === 'number' && number < 10 ? `0${number}` : number}
        </span>

        {/* Lesson content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-body font-medium text-text-primary group-hover:text-cream-bg transition-colors">
              {title}
            </h4>
          </div>

          {/* Expanded details */}
          {isExpanded && (
            <div className="mt-2.5 animate-fadeIn">
              {description && (
                <p className="text-body text-text-secondary leading-snug">
                  {description}
                </p>
              )}

              {/* Video Thumbnail preview */}
              <div className="mt-4 w-full aspect-[16/9] rounded-[8px] overflow-hidden relative bg-[#1A1A1A] border border-border-subtle/40 group/video">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#242424] to-[#141414] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                )}

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg transition-transform group-hover/video:scale-110">
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
