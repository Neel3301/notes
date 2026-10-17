import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PhoneShell from './components/layout/PhoneShell';
import TokensScreen from './screens/TokensScreen';
import ComponentsScreen from './screens/ComponentsScreen';
import StudyPlanningScreen from './screens/StudyPlanningScreen';
import CourseOverviewScreen from './screens/CourseOverviewScreen';
import {
  tokenColors,
  tokenTypography,
  tokenShapes,
  headerDemoData,
  uiComponentsDemoData,
  studyPlanningData,
  courseOverviewData,
} from './data/content';

export default function App() {
  return (
    <BrowserRouter>
      <PhoneShell>
        <Routes>
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
          <Route
            path="/study-planning"
            element={
              <StudyPlanningScreen
                header={studyPlanningData.header}
                heading={studyPlanningData.heading}
                filterPill={studyPlanningData.filterPill}
                calendarButton={studyPlanningData.calendarButton}
                cards={studyPlanningData.cards}
                datePager={studyPlanningData.datePager}
              />
            }
          />
          <Route
            path="/course-overview"
            element={
              <CourseOverviewScreen
                header={courseOverviewData.header}
                heading={courseOverviewData.heading}
                search={courseOverviewData.search}
                cards={courseOverviewData.cards}
              />
            }
          />
          <Route
            path="/"
            element={<Navigate to="/study-planning" replace />}
          />
        </Routes>
      </PhoneShell>
    </BrowserRouter>
  );
}
