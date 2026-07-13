-- ====================================================
-- 🔐 GOOGLE AUTH & DYNAMIC EMOJI AVATARS SCHEMA
-- Run this script in your Supabase SQL Editor.
-- ====================================================

-- 1. Create avatar_type ENUM if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'avatar_type_enum') THEN
        CREATE TYPE avatar_type_enum AS ENUM ('url', 'emoji');
    END IF;
END$$;

-- 2. Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'Tourist',
    google_id VARCHAR(255) UNIQUE,
    avatar_type avatar_type_enum DEFAULT 'url',
    avatar_value TEXT,
    avatar_bg_color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for users
DROP POLICY IF EXISTS "users_anon_select" ON public.users;
DROP POLICY IF EXISTS "users_anon_insert" ON public.users;
DROP POLICY IF EXISTS "users_anon_update" ON public.users;

-- Allow SELECT for everyone (needed to render user avatars in lists or reviews)
CREATE POLICY "users_anon_select" ON public.users
  FOR SELECT TO anon, authenticated USING (true);

-- Allow INSERT for everyone (needed for backend registration utilizing anonymous keys)
CREATE POLICY "users_anon_insert" ON public.users
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow UPDATE for everyone (needed for backend profile updates utilizing anonymous keys)
CREATE POLICY "users_anon_update" ON public.users
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
