# Migration Instructions - FAZ 1

## Admin Profiles Table Oluşturma

### Adım 1: Supabase SQL Editor'ü Açın

1. Şu linke gidin: https://supabase.com/dashboard/project/dpnlyvgqdbagbrjxuvgw/sql/new
2. Veya Supabase Dashboard > SQL Editor > "New query"

### Adım 2: SQL'i Kopyalayın

`supabase/migrations/001_create_admin_profiles.sql` dosyasının tüm içeriğini kopyalayın.

### Adım 3: SQL'i Çalıştırın

1. SQL Editor'e yapıştırın
2. "Run" butonuna tıklayın (veya Ctrl/Cmd + Enter)
3. "Success. No rows returned" mesajını göreceksiniz

### Adım 4: Tabloyu Doğrulayın

1. Sol menüden "Table Editor" > "admin_profiles" tablosunu göreceksiniz
2. Kolonlar: id, email, name, role, permissions, created_at, last_login, updated_at

### Adım 5: İlk Admin Kullanıcısını Oluşturun

Şimdi ilk super admin kullanıcısını oluşturmanız gerekiyor:

1. Supabase Dashboard > Authentication > Users
2. "Add user" > "Create new user"
3. Email: `admin@turistpass.com`
4. Password: `Admin123!@#` (veya kendi güçlü şifreniz)
5. "Create user" butonuna tıklayın

### Adım 6: User ID'yi Alın

1. Oluşturduğunuz kullanıcıya tıklayın
2. User ID'yi (UUID) kopyalayın (örn: `a1b2c3d4-...`)

### Adım 7: Admin Profile'ı Ekleyin

SQL Editor'de şu SQL'i çalıştırın (USER_ID yerine kopyaladığınız ID'yi yapıştırın):

```sql
INSERT INTO admin_profiles (id, email, name, role, permissions)
VALUES (
  'YOUR_USER_ID_HERE',  -- Buraya user ID'yi yapıştırın
  'admin@turistpass.com',
  'Super Admin',
  'super_admin',
  '{
    "customers": true,
    "businesses": true,
    "passes": true,
    "orders": true,
    "support": true,
    "settings": true,
    "analytics": true
  }'::jsonb
);
```

### Adım 8: Doğrulama

SQL Editor'de kontrol edin:

```sql
SELECT * FROM admin_profiles;
```

1 satır görmelisiniz.

---

## Tamamlandı! ✅

Admin profiles tablosu oluşturuldu ve ilk super admin kullanıcısı eklendi.

Şimdi frontend kodunu bu tabloya bağlayacağız.
