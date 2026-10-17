import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

/**
 * TokensScreen component
 * Visual preview of all design system colors, typography utilities, and primitive shapes.
 * All content provided via props as per project rules.
 */
export default function TokensScreen({
  title = 'Design Tokens',
  colors = [],
  typography = [],
  shapes = {},
}) {
  return (
    <div className="w-full bg-screen text-text-primary px-5 py-8 flex flex-col gap-10">
      {/* Header */}
      <div>
        <h1 className="text-display mb-1">{title}</h1>
        <p className="text-label text-text-secondary">Edsy UI Kit • 390px Design Width</p>
      </div>

      {/* 1. Color Palette */}
      <section className="flex flex-col gap-4">
        <div className="border-b border-divider pb-2">
          <h2 className="text-body text-text-primary font-medium">1. Color Palette</h2>
          <p className="text-label text-text-secondary">Extracted tokens from /design-reference</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {colors.map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-3 p-2 bg-divider/30 rounded-card border border-border-subtle/50"
            >
              <div
                className={`w-10 h-10 rounded-card flex-shrink-0 ${c.bgClass} border ${c.borderClass || 'border-border-subtle'}`}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-body text-text-primary truncate font-medium">{c.name}</span>
                <span className="text-label text-text-secondary uppercase">{c.hex}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Typography Styles */}
      <section className="flex flex-col gap-5">
        <div className="border-b border-divider pb-2">
          <h2 className="text-body text-text-primary font-medium">2. Typography Utilities</h2>
          <p className="text-label text-text-secondary">Configured with Hanken Grotesk and strict metrics</p>
        </div>

        <div className="flex flex-col gap-6">
          {typography.map((t) => (
            <div key={t.name} className="flex flex-col gap-1.5 pb-4 border-b border-divider/50">
              <div className="flex items-center justify-between">
                <span className="text-label text-card-yellow font-mono">{t.name}</span>
                <span className="text-label text-text-dimmed">{t.specs}</span>
              </div>
              <div className={`${t.className} ${t.colorClass} whitespace-pre-line`}>
                {t.sample}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Shapes & Components */}
      <section className="flex flex-col gap-5">
        <div className="border-b border-divider pb-2">
          <h2 className="text-body text-text-primary font-medium">3. Shapes & Borders</h2>
          <p className="text-label text-text-secondary">Cards, pills, circle controls, and primary CTA</p>
        </div>

        <div className="flex flex-col gap-6">
          {/* A. Card with Card Radius (8px) */}
          <div className="flex flex-col gap-2">
            <span className="text-label text-text-secondary">Card Radius (8px, flat, no shadows):</span>
            <div className="w-full bg-card-blue rounded-card p-5 text-card-text flex flex-col justify-between min-h-[200px]">
              <span className="text-label text-card-text/80">{shapes.card?.author}</span>
              <div className="text-title text-card-text whitespace-pre-line font-light my-2">
                {shapes.card?.title}
              </div>
              <span className="text-label text-card-text/80">{shapes.card?.time}</span>
            </div>
          </div>

          {/* B. Outlined Pill */}
          <div className="flex flex-col gap-2">
            <span className="text-label text-text-secondary">Outlined Pill (1px border, rounded-pill):</span>
            <div className="flex items-center">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-pill border border-border-subtle text-body text-text-primary bg-transparent hover:border-text-secondary transition-colors"
              >
                <span>{shapes.pill?.label}</span>
                <ChevronDown className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
          </div>

          {/* C. Circle Button */}
          <div className="flex flex-col gap-2">
            <span className="text-label text-text-secondary">Circle Button (1px border, 38px, rounded-circle):</span>
            <div className="flex items-center">
              <button
                type="button"
                className="w-[38px] h-[38px] rounded-circle border border-border-subtle flex items-center justify-center text-text-primary bg-transparent hover:border-text-secondary transition-colors"
                aria-label={shapes.circleButton?.label}
              >
                <Calendar className="w-4 h-4 text-text-primary" />
              </button>
            </div>
          </div>

          {/* D. Cream Button */}
          <div className="flex flex-col gap-2">
            <span className="text-label text-text-secondary">Cream Primary Button (8px radius, bg-cream-bg):</span>
            <div className="flex items-center">
              <button
                type="button"
                className="px-6 py-3 rounded-button bg-cream-bg text-cream-text text-body font-medium transition-opacity hover:opacity-90"
              >
                {shapes.creamButton?.label}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
