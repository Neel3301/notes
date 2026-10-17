import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PhoneShell from './components/layout/PhoneShell';
import TokensScreen from './screens/TokensScreen';
import ComponentsScreen from './screens/ComponentsScreen';
import {
  tokenColors,
  tokenTypography,
  tokenShapes,
  headerDemoData,
  uiComponentsDemoData,
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
            path="/"
            element={<Navigate to="/tokens" replace />}
          />
        </Routes>
      </PhoneShell>
    </BrowserRouter>
  );
}
