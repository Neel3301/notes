import React from 'react';

/**
 * PhoneShell component
 * A centered container with max-width 390px, min-height 100vh, black background,
 * centered on a light grey-blue page background (#dde3ea) to simulate a mobile device on desktop.
 */
export default function PhoneShell({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#dde3ea] flex justify-center items-start">
      <main className="w-full max-w-[390px] min-h-screen bg-black text-white relative shadow-2xl flex flex-col">
        {children}
      </main>
    </div>
  );
}
