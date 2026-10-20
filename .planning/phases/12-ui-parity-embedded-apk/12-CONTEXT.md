# Phase 12 Context: Unified Web & Mobile UI Parity via Embedded React Native WebView

## Problem Statement
In Phase 11, a standalone React Native application was created in `/mobile`. However, because the React Native screens were handwritten with basic `StyleSheet` views rather than the full web component library:
1. The UI diverged significantly from the Web application.
2. The APK lacked interactive HTML5 Canvas sketching, Web Audio memos, Framer Motion slide-up animations, and the AI Assistant action sheet.
3. The layout introduced a bottom navigation tab bar that does not exist in the Web application.

The user explicitly mandated:
> "I Need Our Apk and Web Ui Must Remain Exactly same no change as when i check the apk it has different ui then the web PLease audit all thid create a new phase and fix all the thing"

## Target Architecture
1. **Single Source of Truth**: The full Vite + React + Tailwind + Framer Motion application in `/web` is the canonical UI.
2. **Offline-Capable Web Bundle**: Build `web/` with `base: './'` and `HashRouter` so that routing and assets resolve 100% offline under `file:///android_asset/web/index.html`.
3. **React Native Shell**: The native Android application in `/mobile` hosts the compiled web application using `react-native-webview` with hardware acceleration, native back handling, and local storage persistence.
4. **100% UI Parity**: The Web browser preview and the installed Android APK render the **exact same components, animations, styles, and features**.
