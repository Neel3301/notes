import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * DatePager component
 * Bottom date pager strip from Study Planning (< Mon. 12 > Tue. 13).
 *
 * @param {string} current - Current active date label (e.g. "Mon. 12")
 * @param {string} [next] - Next adjacent date label (e.g. "Tue. 13")
 * @param {() => void} [onPrev] - Previous date click handler
 * @param {() => void} [onNext] - Next date click handler
 * @param {string} [className] - Optional custom classes
 */
export default function DatePager({
  current = 'Mon. 12',
  next = 'Tue. 13',
  onPrev,
  onNext,
  className = '',
}) {
  return (
    <div
      className={`inline-flex items-center gap-4 py-2 select-none text-body ${className}`}
    >
      {/* Previous Arrow */}
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous date"
        className="text-text-secondary hover:text-text-primary transition-colors p-1"
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
      </button>

      {/* Current Active Date */}
      <span className="font-medium text-text-primary tracking-tight">
        {current}
      </span>

      {/* Next Arrow */}
      <button
        type="button"
        onClick={onNext}
        aria-label="Next date"
        className="text-text-secondary hover:text-text-primary transition-colors p-1"
      >
        <ChevronRight className="w-4 h-4" strokeWidth={2} />
      </button>

      {/* Next Inactive Date */}
      {next && (
        <button
          type="button"
          onClick={onNext}
          className="font-normal text-text-secondary hover:text-text-primary transition-colors tracking-tight ml-2"
        >
          {next}
        </button>
      )}
    </div>
  );
}
