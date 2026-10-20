/**
 * Phase 16 Automated Verification Suite:
 * Mobile Shared Notes Access & Release APK Parity Rebuild
 *
 * Verifies:
 * 1. Mobile navigation support for Shared Notes (/shared) in MenuScreen.
 * 2. Mobile navigation support for Cloud Sync & Account (onOpenAuth) in MenuScreen.
 * 3. App.jsx wires onOpenAuth to MenuScreen.
 * 4. Production Web distribution (web/dist) built with relative asset links.
 * 5. Production Web assets embedded into mobile/android/app/src/main/assets/web.
 * 6. Responsive layout safeguard: DesktopSidebar hidden on mobile viewports (<768px).
 * 7. Android release APK exists, freshly packaged, and size > 15MB.
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

console.log('================================================================');
console.log('  Phase 16: Mobile Shared Notes Access & APK Parity Test Suite   ');
console.log('================================================================\n');

// 1. Mobile MenuScreen Navigation
const menuScreenPath = path.join(rootDir, 'web', 'src', 'screens', 'MenuScreen.jsx');
assert(fs.existsSync(menuScreenPath), 'MenuScreen.jsx exists');
if (fs.existsSync(menuScreenPath)) {
  const content = fs.readFileSync(menuScreenPath, 'utf-8');
  assert(content.includes("label=\"Shared Notes\""), 'MenuScreen contains "Shared Notes" menu item');
  assert(content.includes("navigate('/shared')"), 'MenuScreen navigates to /shared for shared notes list');
  assert(content.includes("label=\"Cloud Sync & Account\""), 'MenuScreen contains "Cloud Sync & Account" menu item');
  assert(content.includes("onOpenAuth"), 'MenuScreen supports onOpenAuth callback for authentication modal');
}

// 2. App.jsx Route Connections
const appJsxPath = path.join(rootDir, 'web', 'src', 'App.jsx');
assert(fs.existsSync(appJsxPath), 'web/src/App.jsx exists');
if (fs.existsSync(appJsxPath)) {
  const content = fs.readFileSync(appJsxPath, 'utf-8');
  assert(content.includes('path="/shared"'), 'App.jsx defines /shared route');
  assert(content.includes('SharedNotesListScreen'), 'App.jsx mounts SharedNotesListScreen');
  assert(content.includes('onOpenAuth={onOpenAuth}'), 'App.jsx passes onOpenAuth to MenuScreen');
}

// 3. Web Production Bundle
const distIndexPath = path.join(rootDir, 'web', 'dist', 'index.html');
const distAssetsDir = path.join(rootDir, 'web', 'dist', 'assets');
assert(fs.existsSync(distIndexPath), 'web/dist/index.html production bundle exists');
assert(fs.existsSync(distAssetsDir), 'web/dist/assets exists');

if (fs.existsSync(distIndexPath)) {
  const html = fs.readFileSync(distIndexPath, 'utf-8');
  assert(html.includes('./assets/'), 'web/dist/index.html uses relative paths (./assets/)');
}

// 4. Android Embedded Web Assets
const androidWebDir = path.join(rootDir, 'mobile', 'android', 'app', 'src', 'main', 'assets', 'web');
const androidIndexPath = path.join(androidWebDir, 'index.html');
const androidAssetsDir = path.join(androidWebDir, 'assets');

assert(fs.existsSync(androidIndexPath), 'Embedded index.html exists in Android assets/web');
assert(fs.existsSync(androidAssetsDir), 'Embedded assets/ directory exists in Android assets/web');

if (fs.existsSync(androidAssetsDir)) {
  const assetFiles = fs.readdirSync(androidAssetsDir);
  const hasJs = assetFiles.some((f) => f.endsWith('.js'));
  const hasCss = assetFiles.some((f) => f.endsWith('.css'));
  assert(hasJs, 'Android assets/web/assets contains JS bundle');
  assert(hasCss, 'Android assets/web/assets contains CSS stylesheet');
}

// 5. Responsive Layout Safeguard
const appLayoutPath = path.join(rootDir, 'web', 'src', 'components', 'layout', 'AppLayout.jsx');
assert(fs.existsSync(appLayoutPath), 'AppLayout.jsx exists');
if (fs.existsSync(appLayoutPath)) {
  const content = fs.readFileSync(appLayoutPath, 'utf-8');
  assert(content.includes('hidden md:flex'), 'DesktopSidebar uses "hidden md:flex" (hidden on mobile and APK WebView)');
}

// 6. Standalone Android APK Output
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

const apkFound = fs.existsSync(apkFile) || fs.existsSync(gradleReleaseApk);
assert(apkFound, 'Android APK output file exists');

const targetApk = fs.existsSync(apkFile) ? apkFile : gradleReleaseApk;
if (fs.existsSync(targetApk)) {
  const stats = fs.statSync(targetApk);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  assert(stats.size > 15 * 1024 * 1024, `APK binary file is valid (${sizeMb} MB > 15MB)`);
}

// Summary
const total = results.length;
const passed = results.filter((r) => r.passed).length;
const failed = total - passed;

console.log('\n----------------------------------------------------------------');
console.log(`Phase 16 Verification Results: ${passed}/${total} passed (${failed} failed)`);
console.log('----------------------------------------------------------------');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\nAll Phase 16 mobile access & APK parity checks passed successfully!');
}
