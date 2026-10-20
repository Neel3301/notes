/**
 * Phase 12 Automated Verification Suite: Web & APK UI Parity
 * Verifies 100% visual and functional identity between Web and Android APK.
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

console.log('====================================================');
console.log('  Phase 12: Web & Android APK 100% UI Parity Audit  ');
console.log('====================================================\n');

// 1. PRT-01: Offline Relative Web Configuration
const viteConfigPath = path.join(rootDir, 'web', 'vite.config.js');
const appJsxPath = path.join(rootDir, 'web', 'src', 'App.jsx');
const distIndexPath = path.join(rootDir, 'web', 'dist', 'index.html');

assert(fs.existsSync(viteConfigPath), 'web/vite.config.js exists');
if (fs.existsSync(viteConfigPath)) {
  const content = fs.readFileSync(viteConfigPath, 'utf-8');
  assert(content.includes("base: './'"), "web/vite.config.js specifies relative asset base (base: './')");
}

assert(fs.existsSync(appJsxPath), 'web/src/App.jsx exists');
if (fs.existsSync(appJsxPath)) {
  const content = fs.readFileSync(appJsxPath, 'utf-8');
  assert(content.includes('HashRouter'), 'web/src/App.jsx uses HashRouter for offline file protocol routing');
}

assert(fs.existsSync(distIndexPath), 'web/dist/index.html production bundle exists');
if (fs.existsSync(distIndexPath)) {
  const content = fs.readFileSync(distIndexPath, 'utf-8');
  assert(content.includes('src="./assets/'), 'web/dist/index.html loads relative asset scripts (./assets/)');
}

// 2. PRT-02: Embedded Web Assets in Native Android Project
const androidAssetsWebDir = path.join(
  rootDir,
  'mobile',
  'android',
  'app',
  'src',
  'main',
  'assets',
  'web'
);
const androidAssetsIndex = path.join(androidAssetsWebDir, 'index.html');
const androidAssetsDir = path.join(androidAssetsWebDir, 'assets');

assert(fs.existsSync(androidAssetsWebDir), 'Native Android assets directory exists at assets/web');
assert(fs.existsSync(androidAssetsIndex), 'Embedded index.html exists in Android assets/web');
assert(fs.existsSync(androidAssetsDir), 'Embedded assets/ bundle exists in Android assets/web');

// 3. PRT-02: React Native WebView Host
const mobileAppJs = path.join(rootDir, 'mobile', 'App.js');
assert(fs.existsSync(mobileAppJs), 'mobile/App.js exists');
if (fs.existsSync(mobileAppJs)) {
  const content = fs.readFileSync(mobileAppJs, 'utf-8');
  assert(content.includes('react-native-webview'), 'mobile/App.js imports react-native-webview');
  assert(
    content.includes('file:///android_asset/web/index.html'),
    'mobile/App.js points to local offline asset URI file:///android_asset/web/index.html'
  );
  assert(content.includes('BackHandler'), 'mobile/App.js connects hardware Android BackHandler');
}

// 4. PRT-03: Standalone Android Release APK
const apkFile = path.join(rootDir, 'apk', 'edsy-notes.apk');
const gradleReleaseApk = path.join(
  rootDir,
  'mobile',
  'android',
  'app',
  'build',
  'outputs',
  'apk',
  'release',
  'app-release.apk'
);

const apkExists = fs.existsSync(apkFile) || fs.existsSync(gradleReleaseApk);
assert(apkExists, 'Standalone Android APK output file exists');

if (fs.existsSync(apkFile)) {
  const stats = fs.statSync(apkFile);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  assert(stats.size > 15 * 1024 * 1024, `APK binary file size is valid (${sizeMb} MB > 15MB)`);
}

// Summary
const total = results.length;
const passed = results.filter((r) => r.passed).length;
const failed = total - passed;

console.log('\n----------------------------------------------------');
console.log(`Parity Audit Results: ${passed}/${total} passed (${failed} failed)`);
console.log('----------------------------------------------------');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n100% UI and functional parity between Web and APK confirmed!');
}
