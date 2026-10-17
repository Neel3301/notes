import React from 'react';
import { Calendar, ChevronDown, MoreVertical } from 'lucide-react';
import AppHeader from '../components/layout/AppHeader';
import Pill from '../components/ui/Pill';
import IconButton from '../components/ui/IconButton';
import Button from '../components/ui/Button';
import Heading from '../components/ui/Heading';

/**
 * ComponentsScreen component
 * Component showcase page rendering AppHeader, Pill, IconButton, Button, and Heading components.
 * All data passed via props as per project rules.
 */
export default function ComponentsScreen({
  title = 'Component Showcase',
  subtitle = '',
  headerVariants = [],
  pills = [],
  iconButtons = [],
  buttons = [],
  headings = [],
}) {
  return (
    <div className="w-full bg-screen text-text-primary px-5 py-8 flex flex-col gap-8 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-display mb-1">{title}</h1>
        {subtitle && <p className="text-label text-text-secondary">{subtitle}</p>}
      </div>

      {/* 1. AppHeader Variants */}
      <section className="flex flex-col gap-5">
        <div className="border-b border-divider pb-2">
          <h2 className="text-body font-medium text-text-primary">1. AppHeader (menu / close / back)</h2>
        </div>

        <div className="flex flex-col gap-4">
          {headerVariants.map((v) => (
            <div key={v.id} className="flex flex-col gap-1.5">
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
        </div>
      </section>

      {/* 2. Pill Component */}
      <section className="flex flex-col gap-4">
        <div className="border-b border-divider pb-2">
          <h2 className="text-body font-medium text-text-primary">2. Pill (outlined, fully rounded)</h2>
          <p className="text-label text-text-secondary">Optional icon / iconRight</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {pills.map((p) => (
            <Pill
              key={p.id}
              label={p.label}
              iconRight={p.hasChevron ? <ChevronDown className="w-4 h-4" /> : null}
              onClick={() => console.log(`Clicked ${p.label}`)}
            />
          ))}
        </div>
      </section>

      {/* 3. IconButton Component */}
      <section className="flex flex-col gap-4">
        <div className="border-b border-divider pb-2">
          <h2 className="text-body font-medium text-text-primary">3. IconButton (outlined & plain)</h2>
          <p className="text-label text-text-secondary">Circular 1px border & plain variant</p>
        </div>

        <div className="flex items-center gap-4">
          {iconButtons.map((ib) => {
            const iconNode =
              ib.icon === 'Calendar' ? (
                <Calendar className="w-4 h-4" />
              ) : (
                <MoreVertical className="w-5 h-5" />
              );

            return (
              <div key={ib.id} className="flex flex-col items-center gap-1.5">
                <IconButton
                  variant={ib.variant}
                  icon={iconNode}
                  ariaLabel={ib.label}
                  onClick={() => console.log(`Clicked ${ib.name}`)}
                />
                <span className="text-label text-text-secondary">{ib.variant}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Button Component (Cream CTA) */}
      <section className="flex flex-col gap-4">
        <div className="border-b border-divider pb-2">
          <h2 className="text-body font-medium text-text-primary">4. Button (cream CTA)</h2>
          <p className="text-label text-text-secondary">Signature cream button from course-detail.jpg</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {buttons.map((btn) => (
            <Button
              key={btn.id}
              variant={btn.variant}
              onClick={() => console.log(`Clicked ${btn.label}`)}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </section>

      {/* 5. Heading Component */}
      <section className="flex flex-col gap-4">
        <div className="border-b border-divider pb-2">
          <h2 className="text-body font-medium text-text-primary">5. Heading (.text-display, line breaks)</h2>
          <p className="text-label text-text-secondary">Hero title preserving multi-line breaks</p>
        </div>

        <div className="flex flex-col gap-6">
          {headings.map((h) => (
            <div key={h.id} className="flex flex-col gap-1 p-3 bg-divider/20 rounded-card border border-border-subtle/50">
              <span className="text-label text-text-secondary">{h.label}</span>
              <Heading text={h.text} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
