
-- Add logo_url to partner_applications table
ALTER TABLE partner_applications ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create storage bucket for partner logos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'partner-assets', 'partner-assets', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'partner-assets'
);

-- Set up storage policy for partner logos
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'partner-assets');

CREATE POLICY "Authenticated users can upload partner assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'partner-assets');
