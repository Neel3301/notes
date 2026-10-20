import React from 'react';
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import PhoneShell from './components/layout/PhoneShell';
import TokensScreen from './screens/TokensScreen';
import ComponentsScreen from './screens/ComponentsScreen';
import TimelineScreen from './screens/TimelineScreen';
import NotesCatalogScreen from './screens/NotesCatalogScreen';
import NoteEditorScreen from './screens/NoteEditorScreen';
import MenuScreen from './screens/MenuScreen';
import {
  tokenColors,
  tokenTypography,
  tokenShapes,
  headerDemoData,
  uiComponentsDemoData,
  timelineData,
  notesCatalogData,
  noteEditorData,
  menuData,
} from './data/content';

/**
 * Main application routes with clean semantic note app URLs.
 */
function AppRoutes() {
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
        }
      />

      {/* 2. Notes Catalog / All Notes & Search */}
      <Route
        path="/notes"
        element={
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
          />
        }
      />

      {/* 3. Note Editor & Detail */}
      <Route
        path="/editor"
        element={
          <NoteEditorScreen
            header={noteEditorData.header}
            heading={location.state?.note?.title || noteEditorData.heading}
            actionButton={noteEditorData.actionButton}
            tabs={noteEditorData.tabs}
            onBackClick={() => navigate(-1)}
          />
        }
      />
      <Route
        path="/note/:id"
        element={
          <NoteEditorScreen
            header={noteEditorData.header}
            heading={location.state?.note?.title || noteEditorData.heading}
            actionButton={noteEditorData.actionButton}
            tabs={noteEditorData.tabs}
            onBackClick={() => navigate(-1)}
          />
        }
      />

      {/* 4. Slide-up Menu Overlay */}
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
          />
        }
      />

      {/* Showcase & Design System Routes */}
      <Route
        path="/components"
        element={
          <ComponentsScreen
            title={headerDemoData.title}
            subtitle={headerDemoData.subtitle}
            headerVariants={headerDemoData.variants}
            pills={uiComponentsDemoData.pills}
            iconButtons={uiComponentsDemoData.iconButtons}
            buttons={uiComponentsDemoData.buttons}
            headings={uiComponentsDemoData.headings}
            courseCards={uiComponentsDemoData.courseCards}
            datePager={uiComponentsDemoData.datePager}
            searchPill={uiComponentsDemoData.searchPill}
            tabs={uiComponentsDemoData.tabs}
            menuItems={uiComponentsDemoData.menuItems}
          />
        }
      />
      <Route
        path="/tokens"
        element={
          <TokensScreen
            title="Design Tokens"
            colors={tokenColors}
            typography={tokenTypography}
            shapes={tokenShapes}
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
  return (
    <HashRouter>
      <PhoneShell>
        <AppRoutes />
      </PhoneShell>
    </HashRouter>
  );
}
