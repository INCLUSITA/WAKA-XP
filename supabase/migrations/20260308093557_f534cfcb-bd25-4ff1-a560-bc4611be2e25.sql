
-- Create storage bucket for flow attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('flow-attachments', 'flow-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read files (public bucket)
CREATE POLICY "Public read access on flow-attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'flow-attachments');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated upload on flow-attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'flow-attachments');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated delete on flow-attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'flow-attachments');
