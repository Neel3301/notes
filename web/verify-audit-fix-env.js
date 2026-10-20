/**
 * Audit & Fix Verification: Supabase Environment & Schema Setup
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
console.log('  Audit & Fix: Supabase Environment & Schema Audit Suite         ');
console.log('================================================================\n');

// 1. web/.env.example
const webEnvExample = path.join(rootDir, 'web', '.env.example');
assert(fs.existsSync(webEnvExample), 'web/.env.example exists');
if (fs.existsSync(webEnvExample)) {
  const content = fs.readFileSync(webEnvExample, 'utf-8');
  assert(content.includes('VITE_SUPABASE_URL='), 'web/.env.example defines VITE_SUPABASE_URL');
  assert(content.includes('VITE_SUPABASE_ANON_KEY='), 'web/.env.example defines VITE_SUPABASE_ANON_KEY');
}

// 2. web/.env
const webEnv = path.join(rootDir, 'web', '.env');
assert(fs.existsSync(webEnv), 'web/.env exists');
if (fs.existsSync(webEnv)) {
  const content = fs.readFileSync(webEnv, 'utf-8');
  assert(content.includes('VITE_SUPABASE_URL='), 'web/.env specifies VITE_SUPABASE_URL');
  assert(content.includes('VITE_SUPABASE_ANON_KEY='), 'web/.env specifies VITE_SUPABASE_ANON_KEY');
}

// 3. Root .env.example
const rootEnvExample = path.join(rootDir, '.env.example');
assert(fs.existsSync(rootEnvExample), '.env.example exists in root directory');

// 4. supabase-schema.sql
const schemaSql = path.join(rootDir, 'supabase-schema.sql');
assert(fs.existsSync(schemaSql), 'supabase-schema.sql exists in root directory');
if (fs.existsSync(schemaSql)) {
  const sql = fs.readFileSync(schemaSql, 'utf-8');
  assert(sql.includes('CREATE TABLE IF NOT EXISTS public.notes'), 'Schema defines public.notes table');
  assert(sql.includes('CREATE TABLE IF NOT EXISTS public.shared_notes'), 'Schema defines public.shared_notes table');
  assert(sql.includes('ENABLE ROW LEVEL SECURITY'), 'Schema enables Row Level Security (RLS)');
  assert(sql.includes('auth.uid() = user_id'), 'Schema includes user isolation RLS policy');
}

// 5. Root .gitignore
const gitignore = path.join(rootDir, '.gitignore');
assert(fs.existsSync(gitignore), '.gitignore exists in root');
if (fs.existsSync(gitignore)) {
  const content = fs.readFileSync(gitignore, 'utf-8');
  assert(content.includes('.env'), '.gitignore excludes .env files from git tracking');
}

// 6. supabaseClient.js and AuthModal.jsx
const clientPath = path.join(rootDir, 'web', 'src', 'services', 'supabaseClient.js');
if (fs.existsSync(clientPath)) {
  const clientCode = fs.readFileSync(clientPath, 'utf-8');
  assert(clientCode.includes('isCloudConfigured'), 'supabaseClient.js exports isCloudConfigured');
}

const authModalPath = path.join(rootDir, 'web', 'src', 'components', 'auth', 'AuthModal.jsx');
if (fs.existsSync(authModalPath)) {
  const authCode = fs.readFileSync(authModalPath, 'utf-8');
  assert(authCode.includes('isCloudConfigured'), 'AuthModal.jsx checks isCloudConfigured');
}

// Summary
const total = results.length;
const passed = results.filter((r) => r.passed).length;
const failed = total - passed;

console.log('\n----------------------------------------------------------------');
console.log(`Audit & Fix Results: ${passed}/${total} passed (${failed} failed)`);
console.log('----------------------------------------------------------------');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\nAll Supabase environment and schema requirements verified successfully!');
}
