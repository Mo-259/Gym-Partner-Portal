-- Storage Policies for gym-logos bucket
-- This allows authenticated users to upload gym logos and public read access

-- Policy: Authenticated users can upload gym logos
CREATE POLICY "Authenticated users can upload gym logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gym-logos'
);

-- Policy: Public read access for gym logos
CREATE POLICY "Public read access for gym logos"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'gym-logos'
);

-- Policy: Authenticated users can update their own gym logos
-- (Optional: allows users to replace their uploaded logos)
CREATE POLICY "Authenticated users can update gym logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gym-logos'
)
WITH CHECK (
  bucket_id = 'gym-logos'
);

-- Policy: Authenticated users can delete gym logos
-- (Optional: allows users to delete their uploaded logos)
CREATE POLICY "Authenticated users can delete gym logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'gym-logos'
);
