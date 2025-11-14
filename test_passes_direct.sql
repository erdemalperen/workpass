-- Test passes directly in Supabase SQL Editor
-- Copy-paste this to Supabase Dashboard > SQL Editor

-- 1. Count all passes
SELECT
  'Total Passes' as label,
  COUNT(*) as count
FROM passes;

-- 2. Count by status
SELECT
  'Passes by Status' as section,
  status,
  COUNT(*) as count
FROM passes
GROUP BY status;

-- 3. List all passes
SELECT
  id,
  name,
  status,
  featured,
  popular,
  total_sold,
  total_revenue,
  created_at
FROM passes
ORDER BY created_at DESC;

-- 4. Test stats function
SELECT 'Stats Function Result' as section, * FROM get_admin_passes_stats();

-- 5. Check if function exists
SELECT
  'Function Info' as section,
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'get_admin_passes_stats';
