import React from 'react';

/**
 * Button component
 * Standard primary CTA button featuring the signature cream aesthetic from the reference designs.
 *
 * @param {React.ReactNode} [children] - Button content
 * @param {'cream' | 'outline'} [variant='cream'] - Visual style variant
 * @param {() => void} [onClick] - Click handler
 * @param {boolean} [disabled=false] - Disabled state
 * @param {'button' | 'submit' | 'reset'} [type='button'] - Button HTML type
 * @param {React.ReactNode} [icon] - Optional left icon
 * @param {React.ReactNode} [iconRight] - Optional right icon
 * @param {string} [className] - Optional custom classes
 */
export default function Button({
  children,
  variant = 'cream',
  onClick,
  disabled = false,
  type = 'button',
  icon,
  iconRight,
  className = '',
}) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-button text-body font-medium transition-all select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const variantClasses =
    variant === 'cream'
      ? 'bg-cream-bg text-cream-text hover:opacity-90'
      : 'bg-transparent text-text-primary border border-border-subtle hover:border-text-secondary';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      {children && <span>{children}</span>}
      {iconRight && <span className="flex items-center justify-center">{iconRight}</span>}
    </button>
  );
}
