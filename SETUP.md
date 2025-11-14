# TuristPass Backend Setup Guide

Bu rehber, TuristPass projesinin backend altyapısını kurmak için adım adım talimatlar içerir.

## 📋 Önkoşullar

- Node.js 20+ kurulu olmalı
- npm veya yarn package manager
- Bir Supabase hesabı (ücretsiz plan yeterli)

## 🚀 Kurulum Adımları

### 1. Supabase Projesi Oluşturma

1. [Supabase Dashboard](https://supabase.com/dashboard)'a gidin
2. "New Project" butonuna tıklayın
3. Proje detaylarını doldurun:
   - **Name**: turistpass (veya istediğiniz isim)
   - **Database Password**: Güçlü bir şifre oluşturun (kaydedin!)
   - **Region**: Europe (Frankfurt) - Türkiye'ye en yakın
   - **Pricing Plan**: Free (başlangıç için yeterli)
4. "Create new project" butonuna tıklayın
5. Proje oluşturulması ~2 dakika sürecek

### 2. API Keys'leri Kopyalama

Proje hazır olduğunda:

1. Sol menüden **Settings** > **API** sayfasına gidin
2. Aşağıdaki değerleri kopyalayın:
   - `Project URL` (URL kısmından)
   - `anon public` key (API Keys kısmından)
   - `service_role` key (API Keys kısmından - ⚠️ GİZLİ TUTUN!)

### 3. Environment Variables Ayarlama

`frontend/.env.local` dosyasını açın ve değerleri doldurun:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...uzun_anonKey
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...uzun_serviceRoleKey
```

**⚠️ ÖNEMLİ:**
- `SUPABASE_SERVICE_ROLE_KEY` asla git'e commit edilmemeli
- Bu key tüm güvenlik kurallarını bypass eder
- Sadece server-side kodda kullanın

### 4. Projeyi Başlatma

```bash
cd frontend
npm install  # Eğer henüz yapmadıysanız
npm run dev
```

Proje http://localhost:3000 adresinde çalışacak.

---

## 🗄️ Database Migration Adımları

Şu anda database boş. Her FAZ'da gerekli tabloları oluşturacağız.

### FAZ 1: Admin Auth (Şu Anda Burası)

Admin authentication için gerekli tablolar:

1. Supabase Dashboard'da **SQL Editor** sayfasına gidin
2. Aşağıdaki SQL'i çalıştırın:

```sql
-- Admin profiles table (FAZ 1'de oluşturulacak)
-- Coming soon...
```

### Type Generation

Database şeması oluşturulduktan sonra TypeScript tiplerini generate edin:

```bash
# Önce SUPABASE_PROJECT_ID environment variable'ını set edin
export SUPABASE_PROJECT_ID=your-project-id  # Mac/Linux
# veya
set SUPABASE_PROJECT_ID=your-project-id     # Windows CMD
# veya
$env:SUPABASE_PROJECT_ID="your-project-id"  # Windows PowerShell

# Sonra tipleri generate edin
npm run generate-types
```

**Not**: Project ID'nizi Supabase Dashboard URL'inden alabilirsiniz:
`https://supabase.com/dashboard/project/[PROJECT_ID]/...`

---

## 📊 Seed Data (Mock Data Migration)

Database tabloları oluşturulduktan sonra test verilerini yüklemek için:

```bash
# Tüm seed scriptlerini çalıştır
npm run seed

# Veya tek tek:
npm run seed:admin
npm run seed:customers
npm run seed:businesses
npm run seed:passes
npm run seed:orders
npm run seed:support
```

**Not**: Seed scriptleri her FAZ'da ilgili tablolar oluşturulunca implement edilecek.

---

## 🔍 Proje Yapısı

```
frontend/
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Client-side Supabase client
│   │   ├── server.ts        # Server-side Supabase client
│   │   └── middleware.ts    # Middleware helper
│   └── types/
│       └── database.types.ts # Auto-generated Supabase types
├── middleware.ts             # Next.js middleware (route protection)
├── scripts/
│   ├── seed-all.ts
│   ├── seed-admin.ts
│   ├── seed-customers.ts
│   ├── seed-businesses.ts
│   ├── seed-passes.ts
│   ├── seed-orders.ts
│   └── seed-support.ts
├── .env.local               # Environment variables (GİT'E EKLEME!)
└── .env.example             # Environment variables template
```

---

## 🛠️ Geliştirme Workflow

### 1. Her FAZ için Workflow

1. **Database Migration**: SQL Editor'de tablo oluşturma
2. **RLS Policies**: Row Level Security politikalarını aktif etme
3. **Type Generation**: `npm run generate-types` ile tipleri güncelleme
4. **API Routes**: `app/api/` altında endpoint'ler oluşturma
5. **Frontend Integration**: Component'leri API'ye bağlama
6. **Seed Data**: Mock data migration script'ini implement etme
7. **Test**: Manuel test yapma

### 2. Type Generation Workflow

Database şemasında değişiklik yaptığınızda:

```bash
npm run generate-types
```

Bu komut `lib/types/database.types.ts` dosyasını otomatik günceller.

### 3. Migration Files (Opsiyonel)

İleride migrations'ları versiyonlamak için:

```bash
# Supabase CLI ile migration oluşturma
npx supabase migration new create_admin_profiles

# Migrations'ları apply etme
npx supabase db push
```

---

## 🔐 Güvenlik Notları

### Row Level Security (RLS)

Her tablo için RLS mutlaka aktif edilmeli:

```sql
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Örnek policy:
CREATE POLICY "Admins can view all records"
  ON your_table FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  ));
```

### Environment Variables

- `NEXT_PUBLIC_*` prefix'li değerler browser'a expose edilir (güvenli olmalı)
- `SUPABASE_SERVICE_ROLE_KEY` asla browser'a gitmemeli
- Production'da environment variable'ları Vercel/hosting platform'dan set edin

### Admin Client Kullanımı

`createAdminClient()` fonksiyonunu sadece şu durumlarda kullanın:
- Server-side kod (API routes, Server Actions)
- Admin işlemleri (user oluşturma, bulk operations)
- RLS bypass gerekli durumlarda

---

## 📚 Kaynaklar

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase + Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

## 🐛 Troubleshooting

### Build Error: "Module not found @/lib/types/database.types"

**Çözüm**: Geçici types dosyası zaten oluşturuldu. Supabase projesi oluşturulduktan sonra `npm run generate-types` çalıştırın.

### Middleware Error: "Cannot read cookies"

**Çözüm**: Next.js 15'te `cookies()` artık async. Server.ts dosyasında `await cookies()` kullanılıyor.

### RLS Policy Error: "Row level security violated"

**Çözüm**:
1. Supabase Dashboard > Authentication > Policies sayfasına gidin
2. İlgili tablo için policy'ler kontrol edin
3. Policy'nin doğru kullanıcı için çalıştığından emin olun

### Type Generation Hatası

**Çözüm**:
```bash
# Project ID'yi doğrudan komuta geçirin (Mac/Linux):
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.types.ts

# Windows PowerShell:
npx supabase gen types typescript --project-id YOUR_PROJECT_ID | Out-File -FilePath lib/types/database.types.ts
```

---

## ✅ Sonraki Adımlar

FAZ 0 tamamlandı! ✅

**FAZ 1'e geçmeden önce kontrol edin:**
- [ ] Supabase projesi oluşturuldu
- [ ] `.env.local` dosyası dolduruldu
- [ ] `npm run dev` çalışıyor
- [ ] http://localhost:3000 açılıyor

**Şimdi FAZ 1'e geçebiliriz:**
- Admin authentication
- `admin_profiles` tablosu
- Login sayfası entegrasyonu
- SSR auth kontrolü

---

*Son güncelleme: 2025-10-29*
