-- =====================================================
-- RESET DATABASE SCRIPT
-- UYARI: Bu script tüm veritabanını sıfırlar!
-- Sadece ilk kurulumda veya tamamen sıfırlamak istediğinizde kullanın!
-- =====================================================

-- 1. Tüm public schema'yı sil ve yeniden oluştur
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- 2. İzinleri geri ver
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO anon;

-- 3. Auth schema'daki custom user tablosunu temizle (opsiyonel)
-- TRUNCATE auth.users CASCADE;

-- Artık tüm migration dosyalarını sıfırdan çalıştırabilirsiniz
-- npx supabase db push
