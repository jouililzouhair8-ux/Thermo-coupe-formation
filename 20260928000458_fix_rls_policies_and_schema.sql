-- 1. Fix is_admin() search_path security issue (ALTER instead of DROP)
ALTER FUNCTION public.is_admin() SET search_path = public;

-- 2. Seed app_settings row with id=1 if not exists
INSERT INTO public.app_settings (id, logo_url, updated_at)
SELECT 1, '', now()
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings WHERE id = 1);

-- 3. Add cover_url to sections for section cover images
ALTER TABLE public.sections ADD COLUMN IF NOT EXISTS cover_url text DEFAULT '';

-- 4. Add published column to lessons if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'lessons' AND column_name = 'published'
  ) THEN
    ALTER TABLE public.lessons ADD COLUMN published boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- 5. Add quiz_data column to lessons if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'lessons' AND column_name = 'quiz_data'
  ) THEN
    ALTER TABLE public.lessons ADD COLUMN quiz_data jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- 6. Re-verify all RLS policies are correct (drop & recreate to be safe)
-- sections
DROP POLICY IF EXISTS "sections_select_all" ON public.sections;
CREATE POLICY "sections_select_all" ON public.sections FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "sections_admin_insert" ON public.sections;
CREATE POLICY "sections_admin_insert" ON public.sections FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "sections_admin_update" ON public.sections;
CREATE POLICY "sections_admin_update" ON public.sections FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "sections_admin_delete" ON public.sections;
CREATE POLICY "sections_admin_delete" ON public.sections FOR DELETE
  TO authenticated USING (public.is_admin());

-- lessons
DROP POLICY IF EXISTS "lessons_select_all" ON public.lessons;
CREATE POLICY "lessons_select_all" ON public.lessons FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "lessons_admin_insert" ON public.lessons;
CREATE POLICY "lessons_admin_insert" ON public.lessons FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "lessons_admin_update" ON public.lessons;
CREATE POLICY "lessons_admin_update" ON public.lessons FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "lessons_admin_delete" ON public.lessons;
CREATE POLICY "lessons_admin_delete" ON public.lessons FOR DELETE
  TO authenticated USING (public.is_admin());

-- slider_images
DROP POLICY IF EXISTS "slider_select_all" ON public.slider_images;
CREATE POLICY "slider_select_all" ON public.slider_images FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "slider_admin_insert" ON public.slider_images;
CREATE POLICY "slider_admin_insert" ON public.slider_images FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "slider_admin_update" ON public.slider_images;
CREATE POLICY "slider_admin_update" ON public.slider_images FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "slider_admin_delete" ON public.slider_images;
CREATE POLICY "slider_admin_delete" ON public.slider_images FOR DELETE
  TO authenticated USING (public.is_admin());

-- app_settings
DROP POLICY IF EXISTS "settings_select_all" ON public.app_settings;
CREATE POLICY "settings_select_all" ON public.app_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "settings_admin_insert" ON public.app_settings;
CREATE POLICY "settings_admin_insert" ON public.app_settings FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "settings_admin_update" ON public.app_settings;
CREATE POLICY "settings_admin_update" ON public.app_settings FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- profiles: admin can insert (for creating trainee profiles)
DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;
CREATE POLICY "profiles_admin_insert" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());