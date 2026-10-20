import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar';

/**
 * AppLayout component
 * Comprehensive responsive application container supporting:
 * 1. Full-width, desktop-friendly dashboard with Left Sidebar (>= 768px).
 * 2. 100% pixel-perfect mobile presentation for small viewports (< 768px) and Android APK WebView.
 */
export default function AppLayout({
  children,
  onOpenAuth,
  onShareNote,
  syncStatus = 'local',
  user = null,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Track window width for conditional viewport checks if needed
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full min-h-screen bg-screen text-text-primary flex flex-col md:flex-row overflow-x-hidden">
      {/* Desktop Left Sidebar (Visible on screens >= 768px) */}
      <div className="hidden md:flex shrink-0">
        <DesktopSidebar
          syncStatus={syncStatus}
          user={user}
          onOpenAuth={onOpenAuth}
        />
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 min-h-screen h-screen flex flex-col bg-screen overflow-y-auto relative">
        {/* On mobile screens, wrap in centered container if window is intermediate, else 100% */}
        <div className="w-full h-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
