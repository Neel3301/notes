-- ==============================================================================
-- Edsy Notes - Supabase SQL Schema & Row Level Security (RLS) Setup
-- ==============================================================================
-- Run this script in your Supabase Project Dashboard -> SQL Editor -> New Query.
-- It creates the tables required for:
-- 1. End-to-End Encrypted (E2EE) Cloud Sync (`notes` table)
-- 2. Public & Private Secure Note Sharing (`shared_notes` table)
-- ==============================================================================

-- 1. Create `notes` table for Zero-Knowledge E2EE Cloud Sync
CREATE TABLE IF NOT EXISTS public.notes (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    iv TEXT NOT NULL,
    encrypted_blob TEXT NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (RLS) on `notes`
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Users can view their own encrypted notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert their own encrypted notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own encrypted notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own encrypted notes" ON public.notes;

-- RLS Policies: Ensure users can ONLY access their own encrypted notes
CREATE POLICY "Users can view their own encrypted notes"
    ON public.notes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own encrypted notes"
    ON public.notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own encrypted notes"
    ON public.notes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own encrypted notes"
    ON public.notes FOR DELETE
    USING (auth.uid() = user_id);

-- Index for fast user query lookups
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON public.notes(updated_at DESC);


-- ==============================================================================
-- 2. Create `shared_notes` table for Public & Private Note Sharing
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.shared_notes (
    id TEXT PRIMARY KEY,
    note_id TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    is_private BOOLEAN DEFAULT FALSE NOT NULL,
    title_hint TEXT,
    salt TEXT NOT NULL,
    iv TEXT NOT NULL,
    encrypted_blob TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (RLS) on `shared_notes`
ALTER TABLE public.shared_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Anyone can view shared notes by slug" ON public.shared_notes;
DROP POLICY IF EXISTS "Anyone can publish or update shared notes" ON public.shared_notes;

-- RLS Policies:
-- Anyone can view shared notes by slug (private notes are encrypted with password;
-- client-side AES-256-GCM guarantees privacy).
CREATE POLICY "Anyone can view shared notes by slug"
    ON public.shared_notes FOR SELECT
    USING (true);

-- Anyone can publish or update shared notes
CREATE POLICY "Anyone can publish or update shared notes"
    ON public.shared_notes FOR ALL
    USING (true)
    WITH CHECK (true);

-- Index for instantaneous slug routing
CREATE INDEX IF NOT EXISTS idx_shared_notes_slug ON public.shared_notes(slug);

-- ==============================================================================
-- End of Schema
-- ==============================================================================
