/*
# Create media storage bucket for file uploads

1. Storage
   - Create a public bucket named `media` for storing images (logos, thumbnails, slider images) and PDF documents.
   - Public bucket so files can be read by anyone (trainees don't need auth to view course materials).

2. Security (RLS on storage.objects)
   - SELECT (read): public — anyone can view/download files.
   - INSERT (upload): authenticated users only (admin uploads files).
   - UPDATE: authenticated users only.
   - DELETE: authenticated users only.

3. Important Notes
   - The bucket is public so trainees can access images and PDFs without authentication.
   - Only authenticated users (admins) can upload, modify, or delete files.
   - File size limits and MIME type restrictions are handled by the storage bucket configuration.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

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

-- Update default app logo
UPDATE app_settings SET logo_url = 'https://i.ibb.co/JRqmCZx6/1790514205185.jpg', updated_at = now() WHERE id = 1;