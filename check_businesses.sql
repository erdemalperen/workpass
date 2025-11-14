-- Check businesses in database
SELECT
  id,
  name,
  status,
  category,
  created_at
FROM businesses
ORDER BY created_at DESC;

-- Count by status
SELECT
  status,
  COUNT(*) as count
FROM businesses
GROUP BY status;

-- Total count
SELECT COUNT(*) as total_businesses FROM businesses;
SELECT COUNT(*) as active_businesses FROM businesses WHERE status = 'active';
