-- ==============================================================================
-- Edsy Notes - Supabase schema (v3, production)
-- ==============================================================================
-- Run in: Supabase Dashboard -> SQL Editor -> New query. Safe to re-run.
--
-- Also required in the dashboard (Authentication -> Providers -> Email):
--   * Turn OFF "Confirm email"  (username login uses a synthetic email, so no
--     confirmation mail can ever be delivered).
--   * Consider enabling CAPTCHA / rate limits under Authentication -> Attack Protection.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. user_keys: per-user KDF salt + passphrase check value.
--    The salt must be identical on every device, otherwise the same passphrase
--    derives a different key and notes cannot be decrypted elsewhere.
--    check_blob is an encrypted constant used to detect a wrong passphrase.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_keys (
    user_id    UUID PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    salt       TEXT NOT NULL,
    check_iv   TEXT NOT NULL,
    check_blob TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.user_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_keys select own" ON public.user_keys;
DROP POLICY IF EXISTS "user_keys insert own" ON public.user_keys;
CREATE POLICY "user_keys select own" ON public.user_keys
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_keys insert own" ON public.user_keys
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- No UPDATE / DELETE policy: the salt is immutable once created.

-- ------------------------------------------------------------------------------
-- 2. notes: end-to-end encrypted note records. Primary key is (user_id, id) so
--    two users can never collide on, or overwrite, each other's note ids.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notes (
    user_id        UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    id             TEXT NOT NULL,
    iv             TEXT NOT NULL,
    encrypted_blob TEXT NOT NULL,
    version        INTEGER NOT NULL DEFAULT 1,
    deleted        BOOLEAN NOT NULL DEFAULT FALSE,   -- tombstone (permanently deleted)
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, id)
);

-- Upgrade from the v1/v2 schema (single-column PK, no version/deleted columns).
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.notes ALTER COLUMN user_id SET DEFAULT auth.uid();
DELETE FROM public.notes WHERE user_id IS NULL;
ALTER TABLE public.notes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.notes ALTER COLUMN updated_at SET NOT NULL;
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.notes'::regclass AND contype = 'p'
          AND array_length(conkey, 1) = 1
    ) THEN
        ALTER TABLE public.notes DROP CONSTRAINT notes_pkey;
        ALTER TABLE public.notes ADD PRIMARY KEY (user_id, id);
    END IF;
END $$;

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own encrypted notes"   ON public.notes;
DROP POLICY IF EXISTS "Users can insert their own encrypted notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own encrypted notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own encrypted notes" ON public.notes;
DROP POLICY IF EXISTS "notes select own" ON public.notes;
DROP POLICY IF EXISTS "notes insert own" ON public.notes;
DROP POLICY IF EXISTS "notes update own" ON public.notes;
DROP POLICY IF EXISTS "notes delete own" ON public.notes;

CREATE POLICY "notes select own" ON public.notes
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notes insert own" ON public.notes
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes update own" ON public.notes
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes delete own" ON public.notes
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP INDEX IF EXISTS public.idx_notes_user_id;
DROP INDEX IF EXISTS public.idx_notes_updated_at;
CREATE INDEX IF NOT EXISTS idx_notes_user_updated ON public.notes (user_id, updated_at);

-- ------------------------------------------------------------------------------
-- 3. shared_notes: public / password-protected share links.
--    * Only the owner can insert / update / delete a row.
--    * The table itself is NOT readable by anonymous users (no enumeration).
--      Readers fetch exactly one row through the get_shared_note() function.
--    * Public shares store the note as plain JSON (is_private = false, iv/salt
--      empty). Private shares store AES-256-GCM ciphertext; the key is derived
--      from the share password in the browser and never leaves it.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shared_notes (
    id             TEXT PRIMARY KEY,
    user_id        UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    note_id        TEXT NOT NULL,
    slug           TEXT UNIQUE NOT NULL,
    is_private     BOOLEAN NOT NULL DEFAULT FALSE,
    title_hint     TEXT,
    salt           TEXT NOT NULL DEFAULT '',
    iv             TEXT NOT NULL DEFAULT '',
    encrypted_blob TEXT NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Upgrade from the v1/v2 schema.
ALTER TABLE public.shared_notes
    ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
-- Old rows were world-writable and publicly "encrypted" with a key shipped in the JS.
DELETE FROM public.shared_notes WHERE user_id IS NULL;
ALTER TABLE public.shared_notes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.shared_notes ALTER COLUMN salt SET DEFAULT '';
ALTER TABLE public.shared_notes ALTER COLUMN iv SET DEFAULT '';

ALTER TABLE public.shared_notes DROP CONSTRAINT IF EXISTS shared_notes_slug_format;
ALTER TABLE public.shared_notes
    ADD CONSTRAINT shared_notes_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9_-]{2,63}$');

ALTER TABLE public.shared_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view shared notes by slug"     ON public.shared_notes;
DROP POLICY IF EXISTS "Anyone can publish or update shared notes" ON public.shared_notes;
DROP POLICY IF EXISTS "shared select own" ON public.shared_notes;
DROP POLICY IF EXISTS "shared insert own" ON public.shared_notes;
DROP POLICY IF EXISTS "shared update own" ON public.shared_notes;
DROP POLICY IF EXISTS "shared delete own" ON public.shared_notes;

CREATE POLICY "shared select own" ON public.shared_notes
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "shared insert own" ON public.shared_notes
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "shared update own" ON public.shared_notes
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "shared delete own" ON public.shared_notes
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP INDEX IF EXISTS public.idx_shared_notes_slug;
CREATE INDEX IF NOT EXISTS idx_shared_notes_user ON public.shared_notes (user_id);

-- Anonymous read of exactly one share by slug.
CREATE OR REPLACE FUNCTION public.get_shared_note(p_slug TEXT)
RETURNS SETOF public.shared_notes
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT * FROM public.shared_notes WHERE slug = lower(p_slug) LIMIT 1;
$$;

-- Slug availability check: true if free, or already owned by the caller.
CREATE OR REPLACE FUNCTION public.is_slug_available(p_slug TEXT, p_note_id TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT NOT EXISTS (
        SELECT 1 FROM public.shared_notes
        WHERE slug = lower(p_slug)
          AND NOT (user_id = auth.uid() AND note_id = p_note_id)
    );
$$;

REVOKE ALL ON FUNCTION public.get_shared_note(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_slug_available(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_note(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_slug_available(TEXT, TEXT) TO authenticated;

-- ------------------------------------------------------------------------------
-- 4. Account deletion (required by app stores). Called as supabase.rpc('delete_my_account').
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'not authenticated';
    END IF;
    DELETE FROM auth.users WHERE id = auth.uid();  -- cascades to all user data
END;
$$;
REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
