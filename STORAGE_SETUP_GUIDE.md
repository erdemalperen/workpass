# Supabase Storage Setup Guide

## Adım 1: Buckets'ı Manuel Oluşturun

Supabase Dashboard'a gidin: **Storage** > **Create a new bucket**

Her bucket için aşağıdaki ayarlarla oluşturun:

### 1. logos
- **Name:** `logos`
- **Public bucket:** ✅ (Checked)
- **File size limit:** `5 MB`
- **Allowed MIME types:** `image/jpeg, image/png, image/webp, image/svg+xml`

### 2. banners
- **Name:** `banners`
- **Public bucket:** ✅ (Checked)
- **File size limit:** `10 MB`
- **Allowed MIME types:** `image/jpeg, image/png, image/webp`

### 3. avatars
- **Name:** `avatars`
- **Public bucket:** ✅ (Checked)
- **File size limit:** `2 MB`
- **Allowed MIME types:** `image/jpeg, image/png, image/webp`

### 4. business-images
- **Name:** `business-images`
- **Public bucket:** ✅ (Checked)
- **File size limit:** `10 MB`
- **Allowed MIME types:** `image/jpeg, image/png, image/webp`

## Adım 2: RLS Policies Uygulayın

Tüm buckets'lar oluşturulduktan sonra:

1. **Supabase Dashboard** > **SQL Editor**
2. `frontend/supabase/migrations/005_create_storage_policies.sql` dosyasını açın
3. İçeriği kopyalayıp SQL Editor'e yapıştırın
4. **Run** butonuna tıklayın

## Doğrulama

Storage ayarlarını kontrol edin:
- 4 bucket oluşturuldu mu? ✅
- Her bucket public mu? ✅
- RLS policies uygulandı mı? ✅

Tamamlandığında bana "storage tamamlandı" yazın!
