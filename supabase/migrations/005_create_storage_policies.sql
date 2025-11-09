-- Migration: Storage Policies (RLS)
-- Description: Apply RLS policies to storage buckets
-- Date: 2025-10-29
-- FAZ: 2
-- NOTE: Buckets must be created manually in Dashboard first!

-- ============================================
-- LOGOS BUCKET POLICIES
-- ============================================

CREATE POLICY "Public can view logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

CREATE POLICY "Admins can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'logos' AND
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'logos' AND
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'logos' AND
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

-- ============================================
-- BANNERS BUCKET POLICIES
-- ============================================

CREATE POLICY "Public can view banners"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

CREATE POLICY "Admins can upload banners"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'banners' AND
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update banners"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'banners' AND
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete banners"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'banners' AND
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

-- ============================================
-- AVATARS BUCKET POLICIES
-- ============================================

CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can manage all avatars"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'avatars' AND
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

-- ============================================
-- BUSINESS IMAGES BUCKET POLICIES
-- ============================================

CREATE POLICY "Public can view business images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'business-images');

CREATE POLICY "Admins can upload business images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'business-images' AND
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update business images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'business-images' AND
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete business images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'business-images' AND
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );
