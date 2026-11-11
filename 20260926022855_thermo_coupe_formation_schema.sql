/*
# THERMO-COUPE FORMATION — Initial Schema

1. New Tables
- `profiles`: links to auth.users, holds role (admin/trainee), full_name, created_at.
- `sections`: training categories (title, description, display_order, created_at).
- `lessons`: lessons within sections (title, description, content_type, content_url, content_text, display_order, created_at).
- `slider_images`: home carousel images (image_url, display_order).
- `lesson_progress`: tracks trainee completion of lessons (trainee_id, lesson_id, completed, updated_at).

2. Security
- RLS enabled on all tables.
- Content tables (sections, lessons, slider_images): public SELECT (anon+authenticated), admin-only writes via is_admin() helper.
- profiles: each user reads/updates own profile; admin can read all profiles.
- lesson_progress: trainee reads/updates own progress; admin reads all.
- is_admin() SECURITY DEFINER helper checks profiles.role = 'admin'.

3. Notes
- Admin email: jouililzouhair8@gmail.com (seeded as admin profile on first login via frontend).
- Content supports external URLs (YouTube/Vimeo/PDF) and direct upload URLs.
*/

-- profiles (must exist before is_admin() function)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  role text NOT NULL DEFAULT 'trainee' CHECK (role IN ('admin','trainee')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper: is_admin() — created after profiles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  );
$$;

-- profiles policies
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- sections
CREATE TABLE IF NOT EXISTS public.sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

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
CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  content_type text NOT NULL DEFAULT 'text' CHECK (content_type IN ('video','pdf','text')),
  content_url text DEFAULT '',
  content_text text DEFAULT '',
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

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

CREATE INDEX IF NOT EXISTS idx_lessons_section_id ON public.lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_lessons_created_at ON public.lessons(created_at DESC);

-- slider_images
CREATE TABLE IF NOT EXISTS public.slider_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.slider_images ENABLE ROW LEVEL SECURITY;

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

-- lesson_progress
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (trainee_id, lesson_id)
);
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "progress_select_own_or_admin" ON public.lesson_progress;
CREATE POLICY "progress_select_own_or_admin" ON public.lesson_progress FOR SELECT
  TO authenticated USING (auth.uid() = trainee_id OR public.is_admin());

DROP POLICY IF EXISTS "progress_insert_own" ON public.lesson_progress;
CREATE POLICY "progress_insert_own" ON public.lesson_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = trainee_id);

DROP POLICY IF EXISTS "progress_update_own" ON public.lesson_progress;
CREATE POLICY "progress_update_own" ON public.lesson_progress FOR UPDATE
  TO authenticated USING (auth.uid() = trainee_id) WITH CHECK (auth.uid() = trainee_id);

DROP POLICY IF EXISTS "progress_delete_own" ON public.lesson_progress;
CREATE POLICY "progress_delete_own" ON public.lesson_progress FOR DELETE
  TO authenticated USING (auth.uid() = trainee_id);

CREATE INDEX IF NOT EXISTS idx_progress_trainee ON public.lesson_progress(trainee_id);

-- Seed initial sections
INSERT INTO public.sections (title, description, display_order)
SELECT 'السلامة في ورشة الإنتاج', 'إجراءات السلامة والوقاية في بيئة التصنيع', 1
WHERE NOT EXISTS (SELECT 1 FROM public.sections);

INSERT INTO public.sections (title, description, display_order)
SELECT 'تقنيات القطع الحراري', 'أساسيات ومتقدمات القطع الحراري للأكياس البلاستيكية', 2
WHERE NOT EXISTS (SELECT 1 FROM public.sections WHERE title = 'تقنيات القطع الحراري');

INSERT INTO public.sections (title, description, display_order)
SELECT 'تشغيل وصيانة الآلات', 'تشغيل آلات الإنتاج وصيانتها الدورية', 3
WHERE NOT EXISTS (SELECT 1 FROM public.sections WHERE title = 'تشغيل وصيانة الآلات');

-- Seed a few lessons into the first section
INSERT INTO public.lessons (section_id, title, description, content_type, content_text, display_order)
SELECT s.id, 'مقدمة في السلامة الصناعية', 'نظرة عامة على قواعد السلامة في الورشة', 'text',
'السلامة الصناعية هي مجموعة من الإجراءات والتدابير التي تهدف إلى حماية العاملين في بيئة العمل من المخاطر المحتملة. في صناعة الأكياس البلاستيكية، تشمل المخاطر: الحرارة العالية من آلات القطع الحراري، الأجزاء المتحركة في الآلات، والمواد الكيميائية. يجب على كل عامل ارتداء معدات الوقاية الشخصية مثل القفازات والنظارات الواقية.', 1
FROM public.sections s
WHERE s.title = 'السلامة في ورشة الإنتاج'
AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.section_id = s.id AND l.title = 'مقدمة في السلامة الصناعية');

INSERT INTO public.lessons (section_id, title, description, content_type, content_text, display_order)
SELECT s.id, 'إجراءات الطوارئ', 'كيفية التصرف في حالات الطوارئ بالورشة', 'text',
'في حالة حدوث طارئ مثل حريق أو إصابة، يجب: 1) الإبلاغ فوراً للمشرف المسؤول. 2) استخدام طفاية الحريق الموجودة في الورشة. 3) إخلاء المنطقة إذا لزم الأمر. 4) الاتصال بخدمات الطوارئ. يجب أن يكون كل عامل على دراية بمواقع طفايات الحيران ومخارج الطوارئ.', 2
FROM public.sections s
WHERE s.title = 'السلامة في ورشة الإنتاج'
AND NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.section_id = s.id AND l.title = 'إجراءات الطوارئ');