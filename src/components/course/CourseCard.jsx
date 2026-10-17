import React from 'react';
import { Heart } from 'lucide-react';

/**
 * CourseCard component
 * Signature flat course card used in Study Planning and Course Overview.
 *
 * @param {'blue' | 'light' | 'yellow'} [color='blue'] - Card color token
 * @param {string} author - Course author / instructor name
 * @param {string} title - Course title (preserves multi-line formatting)
 * @param {string} [time] - Optional class time range (e.g. "10:00 am – 11:30 am")
 * @param {boolean} [liked] - Heart icon toggle state (undefined = no heart icon)
 * @param {(e: React.MouseEvent) => void} [onLikeToggle] - Heart toggle handler
 * @param {() => void} [onClick] - Card selection handler
 * @param {string} [className] - Optional custom classes
 */
export default function CourseCard({
  color = 'blue',
  author,
  title,
  time,
  liked,
  fullWidth = false,
  onLikeToggle,
  onClick,
  className = '',
}) {
  const colorMap = {
    blue: 'bg-card-blue text-card-text',
    light: 'bg-card-light text-card-text',
    yellow: 'bg-card-yellow text-card-text',
  };

  const selectedColorClass = colorMap[color] || colorMap.blue;
  const sizeClasses = fullWidth ? 'w-full h-[320px]' : 'w-[236px] h-[320px] flex-shrink-0';

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`${sizeClasses} rounded-card p-5 flex flex-col justify-between select-none transition-transform active:scale-[0.99] cursor-pointer ${selectedColorClass} ${className}`}
    >
      {/* Top Row: Author & optional Heart */}
      <div className="flex items-center justify-between">
        <span className="text-label font-normal tracking-normal text-card-text/90">
          {author}
        </span>

        {liked !== undefined && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLikeToggle?.(e);
            }}
            aria-label={liked ? 'Unlike course' : 'Like course'}
            className="text-card-text hover:opacity-75 transition-opacity -mr-1 -mt-1 p-1"
          >
            <Heart
              className={`w-5 h-5 ${liked ? 'fill-card-text text-card-text' : 'text-card-text'}`}
              strokeWidth={1.5}
            />
          </button>
        )}
      </div>

      {/* Center: Title with line breaks */}
      <div className="my-auto py-2">
        <h3 className="text-title text-card-text font-light whitespace-pre-line leading-[1.08] tracking-[-0.03em]">
          {title}
        </h3>
      </div>

      {/* Bottom Row: Optional Time */}
      {time && (
        <div className="text-label text-card-text/80 font-normal">
          {time}
        </div>
      )}
    </div>
  );
}
