
-- If partner-assets storage bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public)
SELECT 'partner-assets', 'partner-assets', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'partner-assets'
);

-- Set up storage policies for partner logos
-- Policy for public read access
CREATE POLICY "Public can view partner assets" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'partner-assets');

-- Policy for authenticated users to upload
CREATE POLICY "Authenticated users can upload partner assets" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'partner-assets');

-- Update indexes for partner_applications
CREATE INDEX IF NOT EXISTS partner_applications_user_id_idx ON partner_applications(user_id);
CREATE INDEX IF NOT EXISTS partner_applications_status_idx ON partner_applications(status);
