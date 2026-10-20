import React from 'react';
import { ArrowUpRight } from 'lucide-react';

/**
 * MenuItem component
 * Typographic navigation item for the full-screen Menu overlay.
 * Uses the large .text-menu style (38px / 300 weight).
 * Active state is pure white with an ArrowUpRight icon; inactive is muted grey.
 *
 * @param {string} label - Menu item text
 * @param {boolean} [active=false] - Whether this item is the currently selected route
 * @param {() => void} [onClick] - Click handler
 * @param {string} [className] - Optional custom classes
 */
export default function MenuItem({
  label,
  active = false,
  count,
  onClick,
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between text-left py-1 select-none transition-colors group cursor-pointer ${className}`}
    >
      <div className="flex items-baseline gap-2.5">
        <span
          className={`text-menu transition-colors ${
            active
              ? 'text-text-primary'
              : 'text-text-secondary group-hover:text-text-primary'
          }`}
        >
          {label}
        </span>
        {count !== undefined && count !== null && (
          <span className="text-label text-text-secondary/60 font-mono">
            {count}
          </span>
        )}
      </div>

      {active && (
        <span className="text-text-primary flex items-center justify-center pr-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <ArrowUpRight className="w-6 h-6 stroke-[1.5]" />
        </span>
      )}
    </button>
  );
}
