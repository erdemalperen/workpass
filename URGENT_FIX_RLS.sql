-- =====================================================
-- URGENT: FIX ALL RLS POLICIES NOW
-- =====================================================
-- Copy this entire script and run it in Supabase SQL Editor
-- https://supabase.com/dashboard/project/dpnlyvgqdbagbrjxuvgw/sql/new
-- =====================================================

-- Enable RLS on all tables if not already enabled
ALTER TABLE passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pass_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pass_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASSES TABLE
-- =====================================================
DROP POLICY IF EXISTS "Public can view active passes" ON passes;
DROP POLICY IF EXISTS "Admins can manage passes" ON passes;
DROP POLICY IF EXISTS "Everyone can read active passes" ON passes;
DROP POLICY IF EXISTS "anon_read_active_passes" ON passes;

CREATE POLICY "anon_read_active_passes"
  ON passes FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "authenticated_manage_passes"
  ON passes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

-- =====================================================
-- PASS_BUSINESSES TABLE
-- =====================================================
DROP POLICY IF EXISTS "Public can view pass businesses" ON pass_businesses;
DROP POLICY IF EXISTS "Admins can manage pass businesses" ON pass_businesses;
DROP POLICY IF EXISTS "anon_read_pass_businesses" ON pass_businesses;

CREATE POLICY "anon_read_pass_businesses"
  ON pass_businesses FOR SELECT
  TO anon, authenticated
  USING (true);  -- Allow all reads

CREATE POLICY "authenticated_manage_pass_businesses"
  ON pass_businesses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

-- =====================================================
-- BUSINESSES TABLE
-- =====================================================
DROP POLICY IF EXISTS "Public can view active businesses" ON businesses;
DROP POLICY IF EXISTS "Admins can manage businesses" ON businesses;
DROP POLICY IF EXISTS "anon_read_businesses" ON businesses;

CREATE POLICY "anon_read_businesses"
  ON businesses FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "authenticated_manage_businesses"
  ON businesses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

-- =====================================================
-- PASS_PRICING TABLE
-- =====================================================
DROP POLICY IF EXISTS "Public can view pass pricing" ON pass_pricing;
DROP POLICY IF EXISTS "Admins can manage pass pricing" ON pass_pricing;
DROP POLICY IF EXISTS "anon_read_pass_pricing" ON pass_pricing;

CREATE POLICY "anon_read_pass_pricing"
  ON pass_pricing FOR SELECT
  TO anon, authenticated
  USING (true);  -- Allow all reads

CREATE POLICY "authenticated_manage_pass_pricing"
  ON pass_pricing FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

-- =====================================================
-- SETTINGS TABLE
-- =====================================================
DROP POLICY IF EXISTS "Public can view public settings" ON settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON settings;
DROP POLICY IF EXISTS "anon_read_public_settings" ON settings;

CREATE POLICY "anon_read_public_settings"
  ON settings FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "authenticated_manage_settings"
  ON settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

-- =====================================================
-- CUSTOMER_PROFILES TABLE
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON customer_profiles;
DROP POLICY IF EXISTS "authenticated_read_own_profile" ON customer_profiles;
DROP POLICY IF EXISTS "authenticated_update_own_profile" ON customer_profiles;

CREATE POLICY "authenticated_read_own_profile"
  ON customer_profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

CREATE POLICY "authenticated_update_own_profile"
  ON customer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "authenticated_insert_own_profile"
  ON customer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "admin_manage_all_profiles"
  ON customer_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON passes TO anon, authenticated;
GRANT SELECT ON pass_businesses TO anon, authenticated;
GRANT SELECT ON businesses TO anon, authenticated;
GRANT SELECT ON pass_pricing TO anon, authenticated;
GRANT SELECT ON settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON customer_profiles TO authenticated;

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS POLICIES FIXED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Testing queries...';

  -- Test passes query
  PERFORM COUNT(*) FROM passes WHERE status = 'active';
  RAISE NOTICE '✅ Passes query works';

  -- Test pass_businesses query
  PERFORM COUNT(*) FROM pass_businesses;
  RAISE NOTICE '✅ Pass businesses query works';

  -- Test businesses query
  PERFORM COUNT(*) FROM businesses WHERE status = 'active';
  RAISE NOTICE '✅ Businesses query works';

  RAISE NOTICE '========================================';
  RAISE NOTICE 'ALL RLS POLICIES ARE NOW ACTIVE!';
  RAISE NOTICE 'Please refresh your application';
  RAISE NOTICE '========================================';
END $$;
