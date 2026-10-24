import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AuthModal from './components/auth/AuthModal';
import ShareNoteModal from './components/note/ShareNoteModal';
import { onAuthStateChange, getCachedUser } from './services/supabaseClient';
import { onSyncStatusChange, getSyncStatus, startAutoSync } from './services/syncService';
import { notesStore } from './data/notesStore';
import useIsDesktop from './hooks/useIsDesktop';
import TimelineScreen from './screens/TimelineScreen';
import NotesCatalogScreen from './screens/NotesCatalogScreen';
import NoteEditorScreen from './screens/NoteEditorScreen';
import DesktopNotesWorkspace from './screens/DesktopNotesWorkspace';
import SharedNotesListScreen from './screens/SharedNotesListScreen';
import SharedNoteScreen from './screens/SharedNoteScreen';
import MenuScreen from './screens/MenuScreen';
import {
  timelineData,
  notesCatalogData,
  noteEditorData,
  menuData,
} from './data/content';

/**
 * Responsive Notes View Switcher:
 * Uses DesktopNotesWorkspace (dual-pane) on screens >= 768px,
 * and canonical NotesCatalogScreen on mobile (< 768px).
 */
function ResponsiveNotesView({ onShareNote, ...props }) {
  const isDesktop = useIsDesktop(768);
  const navigate = useNavigate();

  if (isDesktop) {
    return (
      <DesktopNotesWorkspace
        onShareNote={onShareNote}
        {...props}
      />
    );
  }

  return (
    <NotesCatalogScreen
      header={notesCatalogData.header}
      heading={notesCatalogData.heading}
      search={notesCatalogData.search}
      onMenuClick={() => navigate('/menu')}
      onCardClick={(note) =>
        navigate('/editor', {
          state: { note, noteId: note.id },
        })
      }
      {...props}
    />
  );
}

/**
 * Main application routes with clean semantic URLs.
 */
function AppRoutes({ onOpenAuth, onShareNote }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Dynamic menu items reflecting active route
  const dynamicMenuItems = menuData.items.map((item) => {
    let isActive = false;
    if (
      item.label === 'Timeline' &&
      (location.pathname === '/timeline' || location.pathname === '/study-planning' || location.pathname === '/')
    ) {
      isActive = true;
    } else if (
      item.label === 'All Notes' &&
      (location.pathname === '/notes' || location.pathname === '/course-overview')
    ) {
      isActive = true;
    }
    return {
      ...item,
      active: isActive,
    };
  });

  return (
    <Routes>
      {/* 1. Timeline / Daily Notes (Home) */}
      <Route
        path="/timeline"
        element={
          <div className="w-full flex justify-center">
            <div className="w-full max-w-5xl">
              <TimelineScreen
                header={timelineData.header}
                heading={timelineData.heading}
                filterPill={timelineData.filterPill}
                calendarButton={timelineData.calendarButton}
                onMenuClick={() => navigate('/menu')}
                onCardClick={(note) =>
                  navigate('/editor', {
                    state: { note, noteId: note.id },
                  })
                }
              />
            </div>
          </div>
        }
      />

      {/* 2. Notes Catalog / All Notes (Dual-pane on Desktop, single-pane on Mobile) */}
      <Route
        path="/notes"
        element={<ResponsiveNotesView onShareNote={onShareNote} />}
      />

      {/* 3. Note Editor & Detail */}
      <Route
        path="/editor"
        element={
          <div className="w-full flex justify-center">
            <div className="w-full max-w-4xl">
              <NoteEditorScreen
                header={noteEditorData.header}
                heading={location.state?.note?.title || noteEditorData.heading}
                actionButton={noteEditorData.actionButton}
                tabs={noteEditorData.tabs}
                onBackClick={() => navigate(-1)}
                onShareNote={onShareNote}
              />
            </div>
          </div>
        }
      />
      <Route
        path="/note/:id"
        element={
          <div className="w-full flex justify-center">
            <div className="w-full max-w-4xl">
              <NoteEditorScreen
                header={noteEditorData.header}
                heading={location.state?.note?.title || noteEditorData.heading}
                actionButton={noteEditorData.actionButton}
                tabs={noteEditorData.tabs}
                onBackClick={() => navigate(-1)}
                onShareNote={onShareNote}
              />
            </div>
          </div>
        }
      />

      {/* 4. Shared Notes List */}
      <Route
        path="/shared"
        element={
          <SharedNotesListScreen
            onMenuClick={() => navigate('/menu')}
            onOpenShareModal={onShareNote}
          />
        }
      />

      {/* 5. Public / Private Shared Note Reader Route */}
      <Route
        path="/share/:slug"
        element={<SharedNoteScreen />}
      />

      {/* 6. Slide-up Menu Overlay */}
      <Route
        path="/menu"
        element={
          <MenuScreen
            header={menuData.header}
            items={dynamicMenuItems}
            onClose={() => navigate(-1)}
            onNavigate={(item) => {
              if (item.route && item.route !== '#') {
                navigate(item.route);
              }
            }}
            onOpenAuth={onOpenAuth}
          />
        }
      />

      {/* Backward-compatible redirects */}
      <Route path="/study-planning" element={<Navigate to="/timeline" replace />} />
      <Route path="/course-overview" element={<Navigate to="/notes" replace />} />
      <Route path="/course-detail" element={<Navigate to="/editor" replace />} />

      {/* Root redirect to Timeline */}
      <Route path="/" element={<Navigate to="/timeline" replace />} />
    </Routes>
  );
}

export default function App() {
  const [syncStatus, setSyncStatus] = useState(() => getSyncStatus());
  const [user, setUser] = useState(() => getCachedUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [sharingNote, setSharingNote] = useState(null);

  useEffect(() => {
    // Subscribe to Supabase auth changes
    const authSub = onAuthStateChange((_event, currentUser) => {
      setUser(currentUser);
    });

    // Subscribe to cloud sync status changes
    const syncSub = onSyncStatusChange((status) => {
      setSyncStatus(status);
    });

    const stopAutoSync = startAutoSync(notesStore);

    return () => {
      authSub?.unsubscribe?.();
      syncSub?.();
      stopAutoSync();
    };
  }, []);

  const handleOpenAuth = () => {
    setIsAuthModalOpen(true);
  };

  const handleShareNote = (note) => {
    setSharingNote(note);
  };

  return (
    <BrowserRouter>
      <AppLayout
        syncStatus={syncStatus}
        user={user}
        onOpenAuth={handleOpenAuth}
        onShareNote={handleShareNote}
      >
        <AppRoutes
          onOpenAuth={handleOpenAuth}
          onShareNote={handleShareNote}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
        <ShareNoteModal
          isOpen={Boolean(sharingNote)}
          note={sharingNote}
          onClose={() => setSharingNote(null)}
        />
      </AppLayout>
    </BrowserRouter>
  );
}
