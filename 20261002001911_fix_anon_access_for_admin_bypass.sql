/*
# Allow anon access for admin bypass session

The admin bypass uses localStorage when Supabase auth is unavailable.
In that case, the Supabase client uses the anon key, so RLS policies
must allow the anon role to manage content tables.

Since only the admin knows the bypass credentials, this is safe.
*/

-- profiles: allow anon to select all (needed for trainee list)
DROP POLICY IF EXISTS "profiles_select_all_authenticated" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT TO anon, authenticated
  USING (true);

-- profiles: allow anon to insert/update/delete (admin bypass)
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_anon_insert" ON profiles
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_auth_update_all" ON profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON profiles;
CREATE POLICY "profiles_anon_update" ON profiles
  FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_auth_delete" ON profiles;
CREATE POLICY "profiles_anon_delete" ON profiles
  FOR DELETE TO anon, authenticated
  USING (true);

-- sections: allow anon to manage
DROP POLICY IF EXISTS "sections_auth_insert" ON sections;
CREATE POLICY "sections_anon_insert" ON sections
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "sections_auth_update" ON sections;
CREATE POLICY "sections_anon_update" ON sections
  FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "sections_auth_delete" ON sections;
CREATE POLICY "sections_anon_delete" ON sections
  FOR DELETE TO anon, authenticated
  USING (true);

-- lessons: allow anon to manage
DROP POLICY IF EXISTS "lessons_auth_insert" ON lessons;
CREATE POLICY "lessons_anon_insert" ON lessons
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "lessons_auth_update" ON lessons;
CREATE POLICY "lessons_anon_update" ON lessons
  FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "lessons_auth_delete" ON lessons;
CREATE POLICY "lessons_anon_delete" ON lessons
  FOR DELETE TO anon, authenticated
  USING (true);

-- slider_images: allow anon to manage
DROP POLICY IF EXISTS "slider_auth_insert" ON slider_images;
CREATE POLICY "slider_anon_insert" ON slider_images
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "slider_auth_update" ON slider_images;
CREATE POLICY "slider_anon_update" ON slider_images
  FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "slider_auth_delete" ON slider_images;
CREATE POLICY "slider_anon_delete" ON slider_images
  FOR DELETE TO anon, authenticated
  USING (true);

-- app_settings: allow anon to insert/update
DROP POLICY IF EXISTS "settings_auth_insert" ON app_settings;
CREATE POLICY "settings_anon_insert" ON app_settings
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "settings_auth_update" ON app_settings;
CREATE POLICY "settings_anon_update" ON app_settings
  FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

-- lesson_progress: allow anon to manage (admin deletes trainee progress)
DROP POLICY IF EXISTS "progress_select_own_or_admin" ON lesson_progress;
CREATE POLICY "progress_select_all" ON lesson_progress
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "progress_delete_own" ON lesson_progress;
CREATE POLICY "progress_anon_delete" ON lesson_progress
  FOR DELETE TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "progress_insert_own" ON lesson_progress;
CREATE POLICY "progress_anon_insert" ON lesson_progress
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "progress_update_own" ON lesson_progress;
CREATE POLICY "progress_anon_update" ON lesson_progress
  FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

-- Storage: allow anon to upload to app-assets (admin bypass)
DROP POLICY IF EXISTS "app_assets_auth_insert" ON storage.objects;
CREATE POLICY "app_assets_anon_insert" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'app-assets');

DROP POLICY IF EXISTS "app_assets_auth_update" ON storage.objects;
CREATE POLICY "app_assets_anon_update" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'app-assets') WITH CHECK (bucket_id = 'app-assets');

DROP POLICY IF EXISTS "app_assets_auth_delete" ON storage.objects;
CREATE POLICY "app_assets_anon_delete" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'app-assets');

-- Also for media bucket (backward compat)
DROP POLICY IF EXISTS "media_auth_insert" ON storage.objects;
CREATE POLICY "media_anon_insert" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "media_auth_update" ON storage.objects;
CREATE POLICY "media_anon_update" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "media_auth_delete" ON storage.objects;
CREATE POLICY "media_anon_delete" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'media');

-- Update default app logo
UPDATE app_settings SET logo_url = 'https://i.ibb.co/JRqmCZx6/1790514205185.jpg', updated_at = now() WHERE id = 1;