-- Add status column to profiles for trainee block/unblock
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
  CHECK (status = ANY (ARRAY['active'::text, 'blocked'::text]));

-- Allow admins to update profiles (for blocking/unblocking trainees)
-- The existing policies already allow users to read their own profile;
-- we need a policy for admins to read all profiles and update them.

DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;
CREATE POLICY "profiles_admin_select_all" ON public.profiles FOR SELECT
  TO authenticated USING (public.is_admin() OR auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Keep the self-update policy for users updating their own profile (e.g. full_name)
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);