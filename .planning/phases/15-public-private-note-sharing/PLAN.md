# Plan: Phase 15 — Public & Private Secure Note Sharing

## Goal
Implement a secure, versatile note-sharing system allowing users to generate public or password-protected private shareable links with random or custom slugs, accessible in any browser with client-side decryption.

## Requirements Covered
- **SHR-01**: Public note sharing generates a shareable web link accessible in any browser without requiring an account or app installation.
- **SHR-02**: Private note sharing encrypts note content with a password-derived key; recipients must enter the correct password to decrypt and view the note.
- **SHR-03**: Users can customize the share link name/slug with instant availability validation against existing shared slugs.

## Proposed Architecture
1. **Sharing Service (`web/src/services/sharingService.js`)**:
   - `createPublicShare(note, customSlug)`: publishes public note to Supabase `shared_notes`.
   - `createPrivateShare(note, password, customSlug)`: derives key from password + salt via PBKDF2, encrypts with AES-256-GCM, publishes encrypted record.
   - `fetchAndDecryptSharedNote(slug, password)`: fetches record by slug, decrypts with password if private, or returns error if password incorrect.
   - `checkSlugAvailability(slug, currentNoteId)`: real-time availability check.
2. **Share Modal (`web/src/components/note/ShareNoteModal.jsx`)**:
   - Mode switcher: Public vs Private (Password-Protected).
   - Custom slug input with real-time uniqueness badge + random slug generator button.
   - Password prompt for private sharing.
   - Copy Link action with clipboard API and toast feedback.
   - Unpublish / Revoke share option.
3. **Shared Note Reader (`web/src/screens/SharedNoteScreen.jsx`)**:
   - Standalone web viewer route `#/share/:slug`.
   - Password challenge modal for private notes.
   - Displays rendered Markdown, Notion blocks, canvas doodle, audio memo.
   - 1-tap "Import into My Notes" into recipient's local notes store.
4. **Verification**:
   - Automated verification in `web/verify-phase15.js` checking public link generation, private password encryption, incorrect password rejection, custom slug availability, and recipient decryption.
