
CREATE POLICY "Anyone can view business media" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'business-media');
CREATE POLICY "Owners upload to own folder" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'business-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owners update own files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'business-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owners delete own files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'business-media' AND (storage.foldername(name))[1] = auth.uid()::text);
