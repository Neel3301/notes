import React from 'react';

/**
 * PhoneShell component
 * Centered container with max-width 390px, min-height 100vh, black background.
 * Displays on a light grey-blue background (#dde3ea) on desktop, and pure black on mobile.
 */
export default function PhoneShell({ children }) {
  return (
    <div className="min-h-screen w-full bg-screen sm:bg-page flex justify-center items-start">
      <main className="w-full max-w-[390px] min-h-screen bg-screen text-text-primary relative shadow-2xl flex flex-col">
        {children}
      </main>
    </div>
  );
}
