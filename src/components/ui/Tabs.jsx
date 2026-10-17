import React from 'react';

/**
 * Tabs component
 * Text-based tab switcher from Course Detail screen ("Preview" / "Details").
 *
 * @param {Array<string | { id: string, label: string }>} items - List of tabs
 * @param {string} active - Current active tab identifier
 * @param {(tab: string) => void} onChange - Tab selection change handler
 * @param {string} [className] - Optional custom classes
 */
export default function Tabs({
  items = [],
  active,
  onChange,
  className = '',
}) {
  return (
    <div className={`w-full flex items-center gap-6 border-b border-divider pb-3 ${className}`}>
      {items.map((item) => {
        const id = typeof item === 'string' ? item : item.id;
        const label = typeof item === 'string' ? item : item.label;
        const isActive = active === id || active === label;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange?.(id)}
            className={`text-body transition-colors select-none ${
              isActive
                ? 'font-medium text-text-primary'
                : 'font-normal text-text-secondary hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
