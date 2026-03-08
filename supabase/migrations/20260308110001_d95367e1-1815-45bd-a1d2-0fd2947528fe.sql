
-- Allow anyone to upload to flow-attachments bucket
CREATE POLICY "Allow public uploads to flow-attachments"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'flow-attachments');

-- Allow anyone to read from flow-attachments bucket
CREATE POLICY "Allow public reads from flow-attachments"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'flow-attachments');

-- Allow anyone to delete from flow-attachments bucket
CREATE POLICY "Allow public deletes from flow-attachments"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'flow-attachments');
