# Plan: Phase 14 — Supabase Client, Optional Authentication & E2EE Cloud Sync

## Goal
Integrate Supabase for optional user authentication, cloud storage, and client-side end-to-end encrypted note synchronization, maintaining 100% offline local-first note-taking without requiring an account.

## Requirements Covered
- **SYNC-01**: Local-first note-taking is 100% functional without an account or network connection.
- **SYNC-02**: Optional Supabase authentication (email/password sign-up, sign-in, session persistence) to enable cloud features.
- **SYNC-03**: End-to-end encryption (E2EE) using Web Crypto (AES-256-GCM + PBKDF2) ensures note titles, bodies, blocks, sketches, and audio are encrypted client-side before upload; zero-knowledge encryption ensures server never sees plaintext.
- **SYNC-04**: User-controlled cloud sync toggle allows users to opt-in or opt-out, trigger manual "Sync Now", and observe sync status.
- **SYNC-05**: Offline sync queue handles offline edits and merges changes smoothly upon reconnection via timestamp-based conflict resolution.

## Proposed Architecture
1. **Supabase Client (`web/src/services/supabaseClient.js`)**:
   - Initialized with standard environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) with graceful fallback to local storage / mock cloud when unconfigured.
   - Authentication helpers (`signUp`, `signIn`, `signOut`, `getSession`, `onAuthStateChange`).
2. **Web Crypto E2EE Engine (`web/src/services/cryptoService.js`)**:
   - Zero-knowledge client-side encryption.
   - Uses Web Crypto API (`crypto.subtle`):
     - `deriveKey(passphrase, salt)`: PBKDF2 with SHA-256, 100,000 iterations -> AES-256-GCM key.
     - `encryptPayload(data, key)`: AES-256-GCM encryption producing `ciphertext` and `iv`.
     - `decryptPayload(ciphertext, iv, key)`: AES-256-GCM decryption returning parsed plaintext object.
   - No plaintext titles, contents, blocks, sketches, or voice memos are ever transmitted over the network or stored in the database.
3. **Cloud Sync Service (`web/src/services/syncService.js`)**:
   - Manages cloud sync state (`local`, `syncing`, `synced`, `offline`, `error`).
   - Sync toggle (`isSyncEnabled`), stored in localStorage and reactive across components.
   - Offline queue: tracks dirty note IDs locally.
   - Last-write-wins (LWW) conflict resolution using ISO `updated_at` timestamps.
4. **Auth & Cloud Settings Modal (`web/src/components/auth/AuthModal.jsx`)**:
   - Sleek Edsy-styled modal:
     - Tabs: "Sign In" / "Create Account" / "Cloud Sync Settings".
     - Passphrase setup/unlock for E2EE master key.
     - Opt-in/opt-out Cloud Sync toggle switch.
     - "Sync Now" button with timestamp ("Last synced: Just now").
     - Clear privacy statement: "Zero-Knowledge Encryption: Your notes are encrypted on this device before being uploaded. Nobody, not even the server, can read them."
5. **Verification**:
   - Comprehensive test suite `web/verify-phase14.js` validating encryption, decryption, auth state, sync toggles, and offline queue.
