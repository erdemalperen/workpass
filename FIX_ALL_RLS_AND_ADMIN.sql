-- =====================================================
-- FIX ALL RLS POLICIES AND CREATE ADMIN USER
-- =====================================================
-- This script fixes ALL permission issues and creates admin user
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dpnlyvgqdbagbrjxuvgw/sql/new
-- =====================================================

-- =====================================================
-- PART 1: FIX RLS POLICIES
-- =====================================================

-- Drop and recreate policies for PASSES table
DROP POLICY IF EXISTS "Public can view active passes" ON passes;
DROP POLICY IF EXISTS "Admins can manage passes" ON passes;

CREATE POLICY "Public can view active passes"
  ON passes FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Admins can manage passes"
  ON passes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

-- Drop and recreate policies for PASS_BUSINESSES table
DROP POLICY IF EXISTS "Public can view pass businesses" ON pass_businesses;
DROP POLICY IF EXISTS "Admins can manage pass businesses" ON pass_businesses;

CREATE POLICY "Public can view pass businesses"
  ON pass_businesses FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM passes p
      WHERE p.id = pass_businesses.pass_id
        AND p.status = 'active'
    )
  );

CREATE POLICY "Admins can manage pass businesses"
  ON pass_businesses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

-- Drop and recreate policies for BUSINESSES table
DROP POLICY IF EXISTS "Public can view active businesses" ON businesses;
DROP POLICY IF EXISTS "Admins can manage businesses" ON businesses;

CREATE POLICY "Public can view active businesses"
  ON businesses FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Admins can manage businesses"
  ON businesses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

-- Drop and recreate policies for PASS_PRICING table
DROP POLICY IF EXISTS "Public can view pass pricing" ON pass_pricing;
DROP POLICY IF EXISTS "Admins can manage pass pricing" ON pass_pricing;

CREATE POLICY "Public can view pass pricing"
  ON pass_pricing FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM passes p
      WHERE p.id = pass_pricing.pass_id
        AND p.status = 'active'
    )
  );

CREATE POLICY "Admins can manage pass pricing"
  ON pass_pricing FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

-- Drop and recreate policies for SETTINGS table
DROP POLICY IF EXISTS "Public can view public settings" ON settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON settings;

CREATE POLICY "Public can view public settings"
  ON settings FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "Admins can manage settings"
  ON settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
    )
  );

-- Grant necessary permissions
GRANT SELECT ON passes TO anon, authenticated;
GRANT SELECT ON pass_businesses TO anon, authenticated;
GRANT SELECT ON businesses TO anon, authenticated;
GRANT SELECT ON pass_pricing TO anon, authenticated;
GRANT SELECT ON settings TO anon, authenticated;

-- =====================================================
-- PART 2: CREATE ADMIN USER
-- =====================================================

DO $$
DECLARE
  admin_user_id UUID := 'a0000000-0000-0000-0000-000000000001';
BEGIN
  -- Clean up existing admin user
  DELETE FROM admin_profiles WHERE email = 'admin@turistpass.com';
  DELETE FROM auth.identities WHERE user_id = admin_user_id OR provider_id = admin_user_id::text;
  DELETE FROM auth.users WHERE email = 'admin@turistpass.com' OR id = admin_user_id;

  RAISE NOTICE 'Cleaned up existing admin user';

  -- Create user in auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
  ) VALUES (
    admin_user_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@turistpass.com',
    crypt('Admin123!@#', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Admin User","full_name":"Admin User"}',
    false,
    'authenticated',
    'authenticated'
  );

  RAISE NOTICE 'Created auth.users entry';

  -- Create admin profile
  INSERT INTO admin_profiles (
    id,
    email,
    name,
    role,
    permissions,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'admin@turistpass.com',
    'Admin User',
    'super_admin',
    '{
      "customers": true,
      "businesses": true,
      "passes": true,
      "orders": true,
      "support": true,
      "settings": true,
      "analytics": true
    }'::jsonb,
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Created admin_profiles entry';

  -- Create identity
  INSERT INTO auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id::text,
    admin_user_id,
    jsonb_build_object(
      'sub', admin_user_id::text,
      'email', 'admin@turistpass.com',
      'email_verified', true,
      'provider', 'email'
    ),
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Created auth.identities entry';

  RAISE NOTICE '========================================';
  RAISE NOTICE 'SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Admin Login:';
  RAISE NOTICE '  Email: admin@turistpass.com';
  RAISE NOTICE '  Password: Admin123!@#';
  RAISE NOTICE '  Role: super_admin';
  RAISE NOTICE '========================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error occurred: %', SQLERRM;
    RAISE;
END $$;

-- =====================================================
-- PART 3: VERIFICATION
-- =====================================================

-- Test RLS policies
SELECT 'Testing RLS policies...' as status;

-- Should return active passes (public access)
SELECT COUNT(*) as active_passes_count FROM passes WHERE status = 'active';

-- Should return pass businesses for active passes
SELECT COUNT(*) as pass_businesses_count
FROM pass_businesses pb
JOIN passes p ON p.id = pb.pass_id
WHERE p.status = 'active';

-- Check admin user
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  u.role,
  ap.name,
  ap.role as admin_role,
  ap.permissions
FROM auth.users u
LEFT JOIN admin_profiles ap ON ap.id = u.id
WHERE u.email = 'admin@turistpass.com';

-- =====================================================
-- EXPECTED RESULTS
-- =====================================================
-- ✅ All RLS policies recreated
-- ✅ Public can view active passes and related data
-- ✅ Admin user created with full permissions
-- ✅ Login: admin@turistpass.com / Admin123!@#
-- =====================================================
