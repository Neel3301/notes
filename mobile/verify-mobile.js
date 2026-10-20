/**
 * Phase 11 Verification Suite
 * Verifies Web preservation, React Native codebase, and Android APK artifact.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const results = [];

function assert(condition, testName, details = '') {
  results.push({ testName, passed: !!condition, details });
  const status = condition ? 'PASS' : 'FAIL';
  console.log(`[${status}] ${testName}${details ? ` - ${details}` : ''}`);
}

console.log('==============================================');
console.log('       Phase 11: Mobile & APK Verification    ');
console.log('==============================================\n');

// 1. MBL-01: Web App Preservation
const webDir = path.join(rootDir, 'web');
const webIndexHtml = path.join(webDir, 'index.html');
const webPackageJson = path.join(webDir, 'package.json');
const webAppJsx = path.join(webDir, 'src', 'App.jsx');

assert(fs.existsSync(webDir), 'Web directory exists at /web');
assert(fs.existsSync(webIndexHtml), 'Web index.html preserved');
assert(fs.existsSync(webPackageJson), 'Web package.json preserved');
assert(fs.existsSync(webAppJsx), 'Web App.jsx preserved');

// 2. MBL-02: React Native Mobile Codebase
const mobileDir = path.join(rootDir, 'mobile');
const mobileAppJs = path.join(mobileDir, 'App.js');
const mobileAppJson = path.join(mobileDir, 'app.json');
const tokensJs = path.join(mobileDir, 'src', 'theme', 'tokens.js');
const storeJs = path.join(mobileDir, 'src', 'data', 'notesStore.js');
const timelineScreen = path.join(mobileDir, 'src', 'screens', 'TimelineScreen.js');
const catalogScreen = path.join(mobileDir, 'src', 'screens', 'NotesCatalogScreen.js');
const editorScreen = path.join(mobileDir, 'src', 'screens', 'NoteEditorScreen.js');
const menuScreen = path.join(mobileDir, 'src', 'screens', 'MenuScreen.js');

assert(fs.existsSync(mobileDir), 'Mobile directory exists at /mobile');
assert(fs.existsSync(mobileAppJs), 'mobile/App.js root router exists');
assert(fs.existsSync(mobileAppJson), 'mobile/app.json configuration exists');
assert(fs.existsSync(tokensJs), 'mobile/src/theme/tokens.js design tokens exist');
assert(fs.existsSync(storeJs), 'mobile/src/data/notesStore.js AsyncStorage reactive store exists');
assert(fs.existsSync(timelineScreen), 'mobile/src/screens/TimelineScreen.js exists');
assert(fs.existsSync(catalogScreen), 'mobile/src/screens/NotesCatalogScreen.js exists');
assert(fs.existsSync(editorScreen), 'mobile/src/screens/NoteEditorScreen.js exists');
assert(fs.existsSync(menuScreen), 'mobile/src/screens/MenuScreen.js exists');

// Verify mobile app.json package name
if (fs.existsSync(mobileAppJson)) {
  const appJson = JSON.parse(fs.readFileSync(mobileAppJson, 'utf-8'));
  assert(
    appJson.expo?.android?.package === 'com.edsy.notesapp',
    'mobile/app.json specifies package com.edsy.notesapp'
  );
}

// 3. MBL-03: APK Generation & Delivery
const apkDir = path.join(rootDir, 'apk');
const apkFile = path.join(apkDir, 'edsy-notes.apk');
const gradleReleaseApk = path.join(
  mobileDir,
  'android',
  'app',
  'build',
  'outputs',
  'apk',
  'release',
  'app-release.apk'
);

const apkFound = fs.existsSync(apkFile) || fs.existsSync(gradleReleaseApk);
assert(apkFound, 'Android APK file artifact generated');

if (fs.existsSync(apkFile)) {
  const stats = fs.statSync(apkFile);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  assert(stats.size > 10 * 1024 * 1024, `APK file size is valid (${sizeMb} MB > 10MB)`);
} else if (fs.existsSync(gradleReleaseApk)) {
  const stats = fs.statSync(gradleReleaseApk);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  assert(stats.size > 10 * 1024 * 1024, `Gradle APK file size is valid (${sizeMb} MB > 10MB)`);
}

// Summary
const total = results.length;
const passed = results.filter((r) => r.passed).length;
const failed = total - passed;

console.log('\n----------------------------------------------');
console.log(`Results: ${passed}/${total} passed (${failed} failed)`);
console.log('----------------------------------------------');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\nAll Phase 11 assertions verified successfully!');
}
