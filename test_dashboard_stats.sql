  -- ============================================
  -- Test Dashboard Stats - Manuel Kontrol
  -- ============================================
  -- Bu SQL dosyasını Supabase Dashboard > SQL Editor'da çalıştır

  -- 1. Total businesses count
  SELECT
    COUNT(*) as total_businesses,
    COUNT(*) FILTER (WHERE status = 'active') as active_businesses,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_businesses,
    COUNT(*) FILTER (WHERE status = 'suspended') as suspended_businesses
  FROM businesses;

  -- 2. List all businesses
  SELECT id, name, status, category, created_at
  FROM businesses
  ORDER BY created_at DESC;

  -- 3. Test get_dashboard_stats() function
  SELECT * FROM get_dashboard_stats();

  -- 4. Check if function exists
  SELECT
    proname as function_name,
    prokind as kind,
    prorettype::regtype as return_type
  FROM pg_proc
  WHERE proname = 'get_dashboard_stats';

  -- 5. Orders statistics
  SELECT
    COUNT(*) as total_orders,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
    SUM(total_amount) FILTER (WHERE status = 'completed') as total_revenue
  FROM orders;
