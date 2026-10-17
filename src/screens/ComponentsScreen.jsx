import React from 'react';
import AppHeader from '../components/layout/AppHeader';

/**
 * ComponentsScreen component
 * Component showcase page rendering AppHeader variants.
 * All data passed via props as per project rules.
 */
export default function ComponentsScreen({
  title = 'Component Showcase',
  subtitle = '',
  variants = [],
}) {
  return (
    <div className="w-full bg-screen text-text-primary px-5 py-8 flex flex-col gap-8 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-display mb-1">{title}</h1>
        {subtitle && <p className="text-label text-text-secondary">{subtitle}</p>}
      </div>

      {/* Header Variants */}
      <section className="flex flex-col gap-6">
        {variants.map((v) => (
          <div key={v.id} className="flex flex-col gap-2">
            <div className="flex flex-col">
              <span className="text-body font-medium text-text-primary">{v.name}</span>
              <span className="text-label text-text-secondary">{v.role}</span>
            </div>

            <div className="rounded-card border border-border-subtle bg-black overflow-hidden">
              <AppHeader
                left={v.left}
                logo={v.logo}
                onLeftClick={() => console.log(`Clicked ${v.left}`)}
              />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
