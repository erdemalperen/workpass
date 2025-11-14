-- Check passes in database
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

-- Check stats function
SELECT * FROM get_admin_passes_stats();

-- Count passes by status
SELECT
  status,
  COUNT(*) as count
FROM passes
GROUP BY status;
