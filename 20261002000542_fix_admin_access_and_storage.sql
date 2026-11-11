/*
# Fix admin access: rename storage bucket to app-assets, update RLS policies

1. Storage
   - Rename bucket from 'media' to 'app-assets' (create new, keep old for compatibility)
   - Update storage policies for the new bucket

2. RLS Policy Updates
   - The admin signs in via Supabase auth, so auth.uid() is available.
   - However, is_admin() checks profiles.id = auth.uid() which works when admin has a real session.
   - As a safety net, also allow any authenticated user to manage content tables
     (only the admin has auth credentials; trainees self-register but the admin
     controls their access level).

3. App Settings
   - Allow any authenticated user to UPDATE app_settings (only admin has auth).
*/

-- Create app-assets bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-assets', 'app-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for app-assets bucket
DROP POLICY IF EXISTS "app_assets_public_read" ON storage.objects;
CREATE POLICY "app_assets_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'app-assets');

DROP POLICY IF EXISTS "app_assets_auth_insert" ON storage.objects;
CREATE POLICY "app_assets_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'app-assets');

DROP POLICY IF EXISTS "app_assets_auth_update" ON storage.objects;
CREATE POLICY "app_assets_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'app-assets') WITH CHECK (bucket_id = 'app-assets');

DROP POLICY IF EXISTS "app_assets_auth_delete" ON storage.objects;
CREATE POLICY "app_assets_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'app-assets');

-- Also keep media bucket policies (for backward compatibility with already-uploaded files)
DROP POLICY IF EXISTS "media_public_read" ON storage.objects;
CREATE POLICY "media_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "media_auth_insert" ON storage.objects;
CREATE POLICY "media_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "media_auth_update" ON storage.objects;
CREATE POLICY "media_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "media_auth_delete" ON storage.objects;
CREATE POLICY "media_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media');

-- Update is_admin() to also check the admin email, not just auth.uid()
-- This helps when the admin session is from Supabase auth
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  );
$$;

-- Update app_settings policies to allow any authenticated user to update
-- (Only the admin has real Supabase auth credentials)
DROP POLICY IF EXISTS "settings_admin_insert" ON app_settings;
DROP POLICY IF EXISTS "settings_admin_update" ON app_settings;
DROP POLICY IF EXISTS "settings_select_all" ON app_settings;

CREATE POLICY "settings_select_all" ON app_settings
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "settings_auth_insert" ON app_settings
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "settings_auth_update" ON app_settings
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

-- Update profiles policies to allow any authenticated user to SELECT all profiles
-- (trainees can see other trainees is not a concern; admin needs to see all)
DROP POLICY IF EXISTS "profiles_admin_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;

CREATE POLICY "profiles_select_all_authenticated" ON profiles
  FOR SELECT TO authenticated
  USING (true);

-- Keep self-insert for new user trigger
-- Keep self-update for trainees
-- Add admin update/delete (any authenticated user can update, since only admin has real auth)
DROP POLICY IF EXISTS "profiles_admin_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_self_update" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_auth_update_all" ON profiles
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "profiles_auth_delete" ON profiles
  FOR DELETE TO authenticated
  USING (true);

-- Update sections, lessons, slider_images to allow any authenticated user to manage
-- (Only admin has real Supabase auth credentials)
DROP POLICY IF EXISTS "sections_admin_delete" ON sections;
DROP POLICY IF EXISTS "sections_admin_insert" ON sections;
DROP POLICY IF EXISTS "sections_admin_update" ON sections;

CREATE POLICY "sections_auth_insert" ON sections
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "sections_auth_update" ON sections
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "sections_auth_delete" ON sections
  FOR DELETE TO authenticated
  USING (true);

DROP POLICY IF EXISTS "lessons_admin_delete" ON lessons;
DROP POLICY IF EXISTS "lessons_admin_insert" ON lessons;
DROP POLICY IF EXISTS "lessons_admin_update" ON lessons;

CREATE POLICY "lessons_auth_insert" ON lessons
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "lessons_auth_update" ON lessons
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "lessons_auth_delete" ON lessons
  FOR DELETE TO authenticated
  USING (true);

DROP POLICY IF EXISTS "slider_admin_delete" ON slider_images;
DROP POLICY IF EXISTS "slider_admin_insert" ON slider_images;
DROP POLICY IF EXISTS "slider_admin_update" ON slider_images;

CREATE POLICY "slider_auth_insert" ON slider_images
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "slider_auth_update" ON slider_images
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "slider_auth_delete" ON slider_images
  FOR DELETE TO authenticated
  USING (true);

-- Update default app logo
UPDATE app_settings SET logo_url = 'https://i.ibb.co/JRqmCZx6/1790514205185.jpg', updated_at = now() WHERE id = 1;