-- TERMINAL ASSET MANAGEMENT SYSTEM (TAMS) - FULL PRODUCTION SCHEMA

-- 1. TABLES
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  username TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- REPAIR PROFILES (Run this if you get column errors)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS public.games (
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

CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  game_title TEXT,
  amount NUMERIC,
  status TEXT DEFAULT 'pending',
  purchased_at TIMESTAMPTZ DEFAULT now()
);

-- 2. STORAGE
-- Create bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('game-assets', 'game-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'game-assets');
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'game-assets');
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING (bucket_id = 'game-assets');
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING (bucket_id = 'game-assets');

-- 3. RLS POWERS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow Select" ON public.games;
DROP POLICY IF EXISTS "Allow Admin All" ON public.games;
CREATE POLICY "Allow Select" ON public.games FOR SELECT USING (true);
CREATE POLICY "Allow Admin All" ON public.games FOR ALL USING (true); -- TEMPORARY: Relaxed for testing

DROP POLICY IF EXISTS "Purchases User" ON public.purchases;
CREATE POLICY "Purchases User" ON public.purchases FOR SELECT USING (true);
CREATE POLICY "Purchases Insert" ON public.purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Purchases Admin" ON public.purchases FOR UPDATE USING (true);

-- 4. AUTH TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (new.id, new.email, false)
  ON CONFLICT (id) DO UPDATE SET email = excluded.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. ADMIN GENERATION
UPDATE public.profiles SET is_admin = true WHERE email = 'grapherkidd0@gmail.com';
UPDATE public.profiles SET is_admin = true WHERE email = 'tzngondi1699@gmail.com';
UPDATE public.profiles SET is_admin = true WHERE email = 'Andrewseba474@gmail.com';


