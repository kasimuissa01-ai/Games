-- TERMINAL ASSET MANAGEMENT SYSTEM (TAMS) - FULL PRODUCTION SCHEMA

-- 0. CLEANUP (Optional - uncomment if you want to start totally fresh)
-- DROP TABLE IF EXISTS games CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;
-- DROP TABLE IF EXISTS purchases CASCADE;

-- 1. GAMES TABLE
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  price NUMERIC DEFAULT 0,
  image_url TEXT,
  video_url TEXT,
  download_url TEXT,
  platform TEXT,
  category TEXT,
  ram TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  username TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist if table was already there
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 3. PURCHASES TABLE
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  game_title TEXT,
  amount NUMERIC,
  status TEXT DEFAULT 'pending',
  purchased_at TIMESTAMPTZ DEFAULT now()
);

-- 4. STORAGE SETUP
-- Create bucket if it doesn't exist and ensure it's PUBLIC
INSERT INTO storage.buckets (id, name, public) 
VALUES ('game-assets', 'game-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Cleanup existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;

-- Create storage policies
-- 1. Allow everyone (public) to READ images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'game-assets');

-- 2. Allow authenticated users to INSERT images
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'game-assets' AND auth.role() = 'authenticated');

-- 3. Allow only admins to UPDATE or DELETE images (Highly recommended)
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING (
  bucket_id = 'game-assets' AND 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'game-assets' AND 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Cleanup existing policies
DROP POLICY IF EXISTS "Public Read Games" ON games;
DROP POLICY IF EXISTS "Admin All Games" ON games;
DROP POLICY IF EXISTS "Public Read Profiles" ON profiles;
DROP POLICY IF EXISTS "User Update Own Profile" ON profiles;
DROP POLICY IF EXISTS "Users can see their own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can create purchases" ON purchases;
DROP POLICY IF EXISTS "Admins can update purchases" ON purchases;

-- Create policies
CREATE POLICY "Public Read Games" ON games FOR SELECT USING (true);
CREATE POLICY "Admin All Games" ON games FOR ALL USING ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true );

CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "User Update Own Profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can see their own purchases" ON purchases FOR SELECT 
USING (auth.uid() = user_id OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);

CREATE POLICY "Users can create purchases" ON purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update purchases" ON purchases FOR UPDATE USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);

-- 6. AUTH TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (new.id, new.email, false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. SET ADMIN USER
-- IMPORTANT: You MUST run this in the SQL Editor AFTER you sign up in the app.
-- This allows you to manage games and confirm payments.
-- Replace user-email with your actual email.
UPDATE public.profiles SET is_admin = true WHERE email = 'grapherkidd0@gmail.com';

-- 8. TROUBLESHOOTING
-- If images or games don't appear:
-- 1. Ensure 'game-assets' bucket is PUBLIC in Supabase Storage.
-- 2. Run the SQL above to ensure you are an admin.
-- 3. Check the Browser Console (F12) for any RLS (Row Level Security) errors.

