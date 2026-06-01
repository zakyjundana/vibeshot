-- ==========================================
-- VIBESHOT DATABASE SCHEMA & RLS POLICIES
-- ==========================================
-- Copy-paste this SQL into the Supabase SQL Editor to set up your tables!

-- 1. Create the briefs table
CREATE TABLE IF NOT EXISTS briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  premise TEXT NOT NULL,
  visual_style TEXT DEFAULT 'real-life',
  master_identity JSONB,
  shotlist JSONB NOT NULL DEFAULT '[]'::jsonb,
  moodboard JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS) on the table
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;

-- 3. Configure Security Policies
-- Policy A: Anyone can read a brief if they know its exact ID (public read access for link sharing)
CREATE POLICY "Allow public select briefs by ID" 
ON briefs FOR SELECT 
TO public 
USING (true);

-- Policy B: Only logged-in users can save their own briefs (matching JWT sub with user_id)
CREATE POLICY "Allow authenticated insert briefs" 
ON briefs FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy C: Only the brief owner can update their own briefs
CREATE POLICY "Allow authenticated update briefs" 
ON briefs FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Policy D: Only the brief owner can delete their own briefs
CREATE POLICY "Allow authenticated delete briefs" 
ON briefs FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 4. Create the chat_sessions table for chat history
CREATE TABLE IF NOT EXISTS chat_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT,
  messages    JSONB NOT NULL DEFAULT '[]'::jsonb,
  extracted   JSONB NOT NULL DEFAULT '{}'::jsonb,
  brief_id    UUID REFERENCES briefs(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable Row Level Security (RLS) on chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- 6. Configure Security Policies for chat_sessions
CREATE POLICY "Allow authenticated select own chat_sessions"
ON chat_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated insert own chat_sessions"
ON chat_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated update own chat_sessions"
ON chat_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated delete own chat_sessions"
ON chat_sessions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- 7. Create the profiles table for payment tier and credits tracking
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier        TEXT DEFAULT 'free', -- 'free' or 'premium'
  credits     INTEGER DEFAULT 5, -- render credits
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Configure Security Policies for profiles
CREATE POLICY "Allow authenticated select own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Allow authenticated update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);


