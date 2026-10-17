import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PhoneShell from './components/layout/PhoneShell';
import TokensScreen from './screens/TokensScreen';
import { tokenColors, tokenTypography, tokenShapes } from './data/content';

export default function App() {
  return (
    <BrowserRouter>
      <PhoneShell>
        <Routes>
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
