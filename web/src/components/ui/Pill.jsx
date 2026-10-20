import React from 'react';

/**
 * Pill component
 * Outlined, fully-rounded badge or filter button.
 *
 * @param {React.ReactNode} [children] - Content inside pill
 * @param {string} [label] - Text label if children not used
 * @param {React.ReactNode} [icon] - Optional left icon
 * @param {React.ReactNode} [iconRight] - Optional right icon (e.g. ChevronDown)
 * @param {() => void} [onClick] - Click handler
 * @param {string} [className] - Optional custom classes
 */
export default function Pill({
  children,
  label,
  icon,
  iconRight,
  onClick,
  className = '',
}) {
  const content = children || label;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-pill border border-border-subtle bg-transparent text-body text-text-primary hover:border-text-secondary transition-colors ${className}`}
    >
      {icon && <span className="flex items-center justify-center text-text-primary">{icon}</span>}
      {content && <span>{content}</span>}
      {iconRight && <span className="flex items-center justify-center text-text-secondary">{iconRight}</span>}
    </button>
  );
}
