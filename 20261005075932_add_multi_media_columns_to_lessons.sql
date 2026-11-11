/*
# Add multi-media columns to lessons table

## Purpose
The lessons table previously stored a single `content_url` field that could only hold one media type (video OR pdf OR image). This prevented lessons from displaying multiple media types simultaneously. This migration adds three dedicated columns so a single lesson can have video, image, AND document attachments all at once.

## Changes
1. New columns on `lessons`:
   - `video_url` (text, nullable, default '') — stores the video URL (YouTube, Vimeo, direct MP4, etc.)
   - `image_url` (text, nullable, default '') — stores the image attachment URL (uploaded to Supabase storage)
   - `document_url` (text, nullable, default '') — stores the PDF/document attachment URL (uploaded to Supabase storage)
2. Data migration: existing rows that have `content_url` populated will have their data copied to the appropriate new column based on `content_type`:
   - If content_type = 'video' → video_url = content_url
   - If content_type = 'pdf' → document_url = content_url
   - Image-type URLs in content_url → image_url = content_url
3. The existing `content_url` and `content_type` columns are preserved for backward compatibility — no data loss.

## Security
- No RLS policy changes. Existing policies remain in effect.
- No new tables created.
*/

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS video_url text DEFAULT '';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS image_url text DEFAULT '';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS document_url text DEFAULT '';

-- Migrate existing content_url data into the appropriate new column
UPDATE lessons SET video_url = content_url WHERE content_type = 'video' AND content_url != '' AND COALESCE(video_url, '') = '';
UPDATE lessons SET document_url = content_url WHERE content_type = 'pdf' AND content_url != '' AND COALESCE(document_url, '') = '';
UPDATE lessons SET image_url = content_url WHERE content_url ~* '\.(jpg|jpeg|png|gif|webp)' AND content_url != '' AND COALESCE(image_url, '') = '';
