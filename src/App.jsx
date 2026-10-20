import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import PhoneShell from './components/layout/PhoneShell';
import TokensScreen from './screens/TokensScreen';
import ComponentsScreen from './screens/ComponentsScreen';
import StudyPlanningScreen from './screens/StudyPlanningScreen';
import CourseOverviewScreen from './screens/CourseOverviewScreen';
import CourseDetailScreen from './screens/CourseDetailScreen';
import MenuScreen from './screens/MenuScreen';
import {
  tokenColors,
  tokenTypography,
  tokenShapes,
  headerDemoData,
  uiComponentsDemoData,
  studyPlanningData,
  courseOverviewData,
  courseDetailData,
  menuData,
} from './data/content';

/**
 * Main application routes with full inter-screen navigation flow.
 */
function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  // Dynamic menu items reflecting active route
  const dynamicMenuItems = menuData.items.map((item) => {
    let isActive = false;
    if (item.label === 'Courses' && location.pathname.startsWith('/course')) {
      isActive = true;
    } else if (
      item.label === 'Planning' &&
      (location.pathname === '/study-planning' || location.pathname === '/')
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
      {/* 1. Study Planning (Home) */}
      <Route
        path="/study-planning"
        element={
          <StudyPlanningScreen
            header={studyPlanningData.header}
            heading={studyPlanningData.heading}
            filterPill={studyPlanningData.filterPill}
            calendarButton={studyPlanningData.calendarButton}
            onMenuClick={() => navigate('/menu')}
            onCardClick={(card) =>
              navigate('/course-detail', {
                state: { course: card, note: card, noteId: card.id },
              })
            }
          />
        }
      />

      {/* 2. Course Overview */}
      <Route
        path="/course-overview"
        element={
          <CourseOverviewScreen
            header={courseOverviewData.header}
            heading={courseOverviewData.heading}
            search={courseOverviewData.search}
            cards={courseOverviewData.cards}
            onMenuClick={() => navigate('/menu')}
            onCardClick={(card) =>
              navigate('/course-detail', { state: { course: card } })
            }
          />
        }
      />

      {/* 3. Course Detail */}
      <Route
        path="/course-detail"
        element={
          <CourseDetailScreen
            header={courseDetailData.header}
            heading={
              location.state?.course?.title || courseDetailData.heading
            }
            actionButton={courseDetailData.actionButton}
            tabs={courseDetailData.tabs}
            previewLessons={courseDetailData.previewLessons}
            details={courseDetailData.details}
            onBackClick={() => navigate(-1)}
            onStartCourse={() => console.log('Starting course')}
          />
        }
      />

      {/* 4. Menu Overlay */}
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
            lessons={uiComponentsDemoData.lessons}
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

      {/* Default Route redirecting to Study Planning */}
      <Route path="/" element={<Navigate to="/study-planning" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PhoneShell>
        <AppRoutes />
      </PhoneShell>
    </BrowserRouter>
  );
}
