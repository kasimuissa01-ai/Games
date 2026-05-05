# Production Deployment Guide (Vercel + Supabase)

## 1. Fix Vercel 500 Error (Function Invocation Failed)
This error happens because Vercel is trying to run a Python backend.
**ACTION: DELETE THESE FILES FROM GITHUB**: 
`main.py`, `requirements.txt`, `runtime.txt`, `render.yaml`. 
Your app is **REACT**, not Python.

## 2. Supabase Setup
1. **Tables**: Run the SQL in `supabase-schema.sql` in the Supabase SQL Editor.
2. **Storage**: 
   - Go to Supabase Storage.
   - Click `...` on `game-assets` bucket -> **"Make Public"**.
   - Run Section 4 of `supabase-schema.sql` to apply policies.

## 3. Vercel Project Settings
1. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
2. **Environment Variables**:
   - Add `VITE_SUPABASE_URL`: Your Supabase Project URL.
   - Add `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.

## 4. Creating Admin
- Sign up in your app, then run this SQL in Supabase:
  ```sql
  UPDATE profiles SET is_admin = true WHERE email = 'YOUR_EMAIL@gmail.com';
  ```
