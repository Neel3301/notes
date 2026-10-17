import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * SearchPill component
 * Outlined, fully rounded search input field with icon and interactive states.
 *
 * @param {string} [value] - Current search value
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} [onChange] - Input change handler
 * @param {string} [placeholder='Course title'] - Input placeholder text
 * @param {() => void} [onClear] - Clear input handler
 * @param {string} [className] - Optional custom classes
 */
export default function SearchPill({
  value,
  onChange,
  placeholder = 'Course title',
  onClear,
  className = '',
}) {
  return (
    <div
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-pill border border-border-subtle bg-transparent text-text-primary transition-colors focus-within:border-text-secondary ${className}`}
    >
      <Search className="w-4 h-4 text-text-secondary flex-shrink-0" strokeWidth={1.75} />

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-transparent text-body text-text-primary placeholder:text-text-secondary outline-none font-normal"
      />

      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="text-text-secondary hover:text-text-primary transition-colors p-0.5"
        >
          <X className="w-4 h-4" strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}
