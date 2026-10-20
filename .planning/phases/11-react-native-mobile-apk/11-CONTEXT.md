# Phase 11 Context: React Native Mobile App & Android APK Build

## Background & Objective
The user has requested an installable Android `.apk` file to run the Advanced Notes app on their physical mobile device, using React Native, while preserving the existing web version. Work must be done in a separate branch so that the original `notes-app` branch remains untouched.

---

## Locked Decisions from Discussion

### 1. Dedicated Git Branch
- Dedicated branch: `react-native-mobile` (checked out from `notes-app`).
- The `notes-app` branch is preserved at commit `44dd3bd`.

### 2. Workspace Monorepo Structure
- Move / preserve the existing Vite React web app in `/web`.
- Initialize the new React Native + Expo mobile application in `/mobile`.
- Root package.json can orchestrate both or provide convenience scripts.

### 3. Technology Stack & Framework
- Framework: **Expo + React Native**
- Core Native Libraries:
  - `react-native`: Core UI primitives (`View`, `Text`, `TouchableOpacity`, `ScrollView`, `TextInput`)
  - `@react-navigation/native` & `@react-navigation/bottom-tabs` / `native-stack`
  - `lucide-react-native` for high-contrast icons
  - `expo-file-system` / `@react-native-async-storage/async-storage` for local note storage
- Android Build Engine:
  - Local Android SDK (Platform 34/36/37, Build-Tools 34-37, JDK 17)
  - `npx expo prebuild` generating native `android/` directory
  - Gradle command `./gradlew assembleDebug` / `assembleRelease` producing standalone `.apk`

### 4. Design Invariants
- Identical visual fidelity:
  - Screen Background: `#000000`
  - Cards: `#6F91B6` (blue), `#DCE3EB` (light), `#CABC3F` (yellow)
  - CTA / Highlights: `#E5E7DA` (cream)
  - Text: `#FFFFFF` (primary), `#757575` (secondary), `#4B4B4B` (dimmed)
- Same screens: Timeline, Notes Catalog, Note Editor, and Menu Organizer.

### 5. Deliverable
- An installable Android `.apk` file output to `mobile/android/app/build/outputs/apk/...` and copied to root `apk/` for 1-click access.
