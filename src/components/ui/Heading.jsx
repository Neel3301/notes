import React from 'react';

/**
 * Heading component
 * Standard display hero heading across screens (e.g. "Study\nPlanning", "Course\nOverview").
 * Applies the .text-display token and preserves line breaks.
 *
 * @param {React.ReactNode} [children] - Heading text content
 * @param {string} [text] - Text if children not provided
 * @param {'h1' | 'h2' | 'h3' | 'h4' | 'div'} [as='h1'] - Semantic HTML tag
 * @param {string} [className] - Optional custom classes
 */
export default function Heading({
  children,
  text,
  as: Component = 'h1',
  className = '',
}) {
  const content = children || text;

  return (
    <Component
      className={`text-display text-text-primary whitespace-pre-line ${className}`}
    >
      {content}
    </Component>
  );
}
