import React from 'react';

/**
 * IconButton component
 * Circular icon action button supporting outlined and plain variants.
 *
 * @param {React.ReactNode} icon - Icon element to display
 * @param {'outlined' | 'plain'} [variant='outlined'] - Visual styling variant
 * @param {() => void} [onClick] - Click handler
 * @param {string} [ariaLabel] - Accessibility label
 * @param {string} [className] - Optional custom classes
 */
export default function IconButton({
  icon,
  variant = 'outlined',
  onClick,
  ariaLabel = 'Button',
  className = '',
}) {
  const baseClasses = 'w-[38px] h-[38px] rounded-circle flex items-center justify-center transition-colors';
  const variantClasses =
    variant === 'plain'
      ? 'bg-transparent text-text-primary hover:text-text-secondary'
      : 'bg-transparent text-text-primary border border-border-subtle hover:border-text-secondary';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {icon}
    </button>
  );
}
