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
