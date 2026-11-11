/*
# Add phone_number column and handle_new_user trigger

1. Schema Changes
   - Add `phone_number` column (TEXT, UNIQUE) to `public.profiles` table.
   - The column is nullable initially to avoid breaking existing rows, then we set it from email prefix for existing rows.
   - Existing `email` and `status` columns are preserved (already present from prior migrations).

2. New Functions
   - `public.handle_new_user()` — SECURITY DEFINER trigger function that fires AFTER INSERT on `auth.users`.
   - Inserts a profile row for every new auth user, deriving `full_name`, `phone_number`, and `role` from `raw_user_meta_data`.
   - If `raw_user_meta_data->>'role'` is `'admin'`, the profile gets `role = 'admin'`; otherwise `role = 'trainee'`.
   - Falls back to email username part for `phone_number` if not provided in metadata.
   - Uses `ON CONFLICT (id) DO UPDATE` to be idempotent.

3. New Trigger
   - `on_auth_user_created` on `auth.users` AFTER INSERT, calls `handle_new_user()`.

4. Security
   - RLS already enabled on `profiles` with existing policies preserved.
   - No policy changes — existing ownership-scoped policies remain in effect.
   - `handle_new_user` is SECURITY DEFINER so it can write to `profiles` regardless of caller role.

5. Important Notes
   - The existing admin user (jouililzouhair8@gmail.com) is NOT modified.
   - The `phone_number` column is added as nullable to avoid breaking existing rows, then populated from email prefix.
   - A UNIQUE constraint is added after backfilling existing rows.
*/

-- Step 1: Add phone_number column (nullable initially)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Step 2: Backfill phone_number from email prefix for existing rows
UPDATE public.profiles
SET phone_number = split_part(email, '@', 1)
WHERE phone_number IS NULL;

-- Step 3: Add UNIQUE constraint on phone_number
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_phone_number_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_number_key UNIQUE (phone_number);
  END IF;
END $$;

-- Step 4: Create handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone_number, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'متدرب جديد'),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'
      ELSE 'trainee'
    END,
    'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET role = EXCLUDED.role,
      full_name = EXCLUDED.full_name,
      phone_number = EXCLUDED.phone_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();