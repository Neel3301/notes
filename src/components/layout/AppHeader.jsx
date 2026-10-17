import React from 'react';
import { ChevronLeft, X } from 'lucide-react';

/**
 * AppHeader component
 * Standard top navigation header across all Edsy screens.
 *
 * @param {'menu' | 'back' | 'close'} left - Type of left-side icon action
 * @param {string} [logo] - Optional right-side brandmark text (e.g. ".edsy")
 * @param {() => void} [onLeftClick] - Optional click handler for the left icon button
 */
export default function AppHeader({
  left = 'menu',
  logo,
  onLeftClick,
}) {
  const renderLeftIcon = () => {
    switch (left) {
      case 'back':
        return (
          <button
            type="button"
            onClick={onLeftClick}
            aria-label="Go back"
            className="flex items-center justify-center p-1 -ml-1 text-text-primary hover:text-text-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.75} />
          </button>
        );
      case 'close':
        return (
          <button
            type="button"
            onClick={onLeftClick}
            aria-label="Close menu"
            className="flex items-center justify-center p-1 -ml-1 text-text-primary hover:text-text-secondary transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        );
      case 'menu':
      default:
        return (
          <button
            type="button"
            onClick={onLeftClick}
            aria-label="Open menu"
            className="flex flex-col justify-center gap-[5px] w-6 p-1 -ml-1 hover:opacity-80 transition-opacity"
          >
            <span className="h-[1.5px] w-6 bg-text-primary block rounded-full" />
            <span className="h-[1.5px] w-6 bg-text-primary block rounded-full" />
          </button>
        );
    }
  };

  return (
    <header className="w-full flex items-center justify-between py-3 px-5 bg-screen text-text-primary">
      <div className="flex items-center">
        {renderLeftIcon()}
      </div>

      {logo ? (
        <span className="text-body font-normal text-text-primary tracking-tight">
          {logo}
        </span>
      ) : (
        <div className="w-6" aria-hidden="true" />
      )}
    </header>
  );
}
