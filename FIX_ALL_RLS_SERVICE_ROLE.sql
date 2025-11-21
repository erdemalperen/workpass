-- =====================================================
-- FIX ALL RLS POLICIES - SERVICE ROLE BYPASS
-- =====================================================
-- Run this in: https://supabase.com/dashboard/project/lgwasljvccpaexvrnrcs/sql/new
-- This adds service_role bypass policies to ALL tables
-- =====================================================

-- =====================================================
-- CUSTOMER PROFILES
-- =====================================================
DROP POLICY IF EXISTS "Service role has full access" ON public.customer_profiles;
CREATE POLICY "Service role has full access"
ON public.customer_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own profile" ON public.customer_profiles;
CREATE POLICY "Users can read own profile"
ON public.customer_profiles
FOR SELECT
TO authenticated, anon
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.customer_profiles;
CREATE POLICY "Users can update own profile"
ON public.customer_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =====================================================
-- BUSINESS ACCOUNTS
-- =====================================================
DROP POLICY IF EXISTS "Service role has full access" ON public.business_accounts;
CREATE POLICY "Service role has full access"
ON public.business_accounts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own business account" ON public.business_accounts;
CREATE POLICY "Users can read own business account"
ON public.business_accounts
FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own business account" ON public.business_accounts;
CREATE POLICY "Users can update own business account"
ON public.business_accounts
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =====================================================
-- ADMIN PROFILES
-- =====================================================
DROP POLICY IF EXISTS "Service role has full access" ON public.admin_profiles;
CREATE POLICY "Service role has full access"
ON public.admin_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read own profile" ON public.admin_profiles;
CREATE POLICY "Admins can read own profile"
ON public.admin_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR auth.uid()::text = user_id::text);

-- =====================================================
-- PASSES
-- =====================================================
DROP POLICY IF EXISTS "Service role has full access" ON public.passes;
CREATE POLICY "Service role has full access"
ON public.passes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read active passes" ON public.passes;
CREATE POLICY "Public can read active passes"
ON public.passes
FOR SELECT
TO anon, authenticated
USING (status = 'active');

-- =====================================================
-- PASS PRICING
-- =====================================================
DROP POLICY IF EXISTS "Service role has full access" ON public.pass_pricing;
CREATE POLICY "Service role has full access"
ON public.pass_pricing
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read pass pricing" ON public.pass_pricing;
CREATE POLICY "Public can read pass pricing"
ON public.pass_pricing
FOR SELECT
TO anon, authenticated
USING (true);

-- =====================================================
-- BUSINESSES
-- =====================================================
DROP POLICY IF EXISTS "Service role has full access" ON public.businesses;
CREATE POLICY "Service role has full access"
ON public.businesses
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read active businesses" ON public.businesses;
CREATE POLICY "Public can read active businesses"
ON public.businesses
FOR SELECT
TO anon, authenticated
USING (status = 'active');

-- =====================================================
-- PASS BUSINESSES
-- =====================================================
DROP POLICY IF EXISTS "Service role has full access" ON public.pass_businesses;
CREATE POLICY "Service role has full access"
ON public.pass_businesses
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read pass-business relationships" ON public.pass_businesses;
CREATE POLICY "Public can read pass-business relationships"
ON public.pass_businesses
FOR SELECT
TO anon, authenticated
USING (true);

-- =====================================================
-- SETTINGS
-- =====================================================
DROP POLICY IF EXISTS "Service role has full access" ON public.settings;
CREATE POLICY "Service role has full access"
ON public.settings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read public settings" ON public.settings;
CREATE POLICY "Public can read public settings"
ON public.settings
FOR SELECT
TO anon, authenticated
USING (is_public = true);

-- =====================================================
-- CREATE ORDERS TABLE IF NOT EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    pass_id UUID REFERENCES public.passes(id) ON DELETE SET NULL,
    pricing_id UUID REFERENCES public.pass_pricing(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending',
    total_amount DECIMAL(10, 2),
    currency TEXT DEFAULT 'TRY',
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders RLS policies
DROP POLICY IF EXISTS "Service role has full access" ON public.orders;
CREATE POLICY "Service role has full access"
ON public.orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
CREATE POLICY "Users can read own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
CREATE POLICY "Users can create own orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = customer_id);

-- =====================================================
-- CREATE PURCHASED PASSES TABLE IF NOT EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.purchased_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    pass_id UUID REFERENCES public.passes(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active',
    activation_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    pass_code TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on purchased_passes
ALTER TABLE public.purchased_passes ENABLE ROW LEVEL SECURITY;

-- Purchased passes RLS policies
DROP POLICY IF EXISTS "Service role has full access" ON public.purchased_passes;
CREATE POLICY "Service role has full access"
ON public.purchased_passes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own purchased passes" ON public.purchased_passes;
CREATE POLICY "Users can read own purchased passes"
ON public.purchased_passes
FOR SELECT
TO authenticated
USING (auth.uid() = customer_id);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON public.orders TO service_role;
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT SELECT ON public.orders TO anon;

GRANT ALL ON public.purchased_passes TO service_role;
GRANT SELECT ON public.purchased_passes TO authenticated;
GRANT SELECT ON public.purchased_passes TO anon;

-- =====================================================
-- VERIFY SETUP
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ALL RLS POLICIES FIXED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Service role now has full access to:';
  RAISE NOTICE '  - customer_profiles';
  RAISE NOTICE '  - business_accounts';
  RAISE NOTICE '  - admin_profiles';
  RAISE NOTICE '  - passes';
  RAISE NOTICE '  - pass_pricing';
  RAISE NOTICE '  - businesses';
  RAISE NOTICE '  - pass_businesses';
  RAISE NOTICE '  - settings';
  RAISE NOTICE '  - orders (created if missing)';
  RAISE NOTICE '  - purchased_passes (created if missing)';
  RAISE NOTICE '';
  RAISE NOTICE 'Public users can:';
  RAISE NOTICE '  - Read active passes and businesses';
  RAISE NOTICE '  - Read public settings';
  RAISE NOTICE '';
  RAISE NOTICE 'Authenticated users can:';
  RAISE NOTICE '  - Manage their own profiles';
  RAISE NOTICE '  - Create and read their own orders';
  RAISE NOTICE '  - Read their own purchased passes';
  RAISE NOTICE '========================================';
END $$;
