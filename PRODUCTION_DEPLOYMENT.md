# 🚀 Production Deployment Rehberi

## Localhost'tan Production'a Geçiş

### 📋 Genel Bakış

TuristPass projesi şu anda localhost'ta çalışıyor. Production'a (canlı domain) geçerken environment variables otomatik olarak güncellenir.

---

## 🔧 Environment Variables Yapısı

### Mevcut Yapı (Localhost)

```env
# .env.local (Development)
NEXT_PUBLIC_SUPABASE_URL=https://dpnlyvgqdbagbrjxuvgw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Production Yapısı (Vercel/Netlify/Custom)

Aynı değerler kullanılır! Supabase URL'i değişmez çünkü:
- ✅ Supabase projesi cloud'da host ediliyor
- ✅ Database URL sabit kalır
- ✅ Sadece frontend URL'i değişir

---

## 🌐 Domain Değişimi Senaryoları

### Senaryo 1: Vercel Deployment (Önerilen)

**1. Vercel'e Deploy**
```bash
# Vercel CLI kur
npm i -g vercel

# Deploy
cd frontend
vercel
```

**2. Environment Variables Ekle**

Vercel Dashboard > Project > Settings > Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://dpnlyvgqdbagbrjxuvgw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [key]
SUPABASE_SERVICE_ROLE_KEY = [key]
```

**3. Domain Ekle**

Vercel Dashboard > Domains > Add Domain:
- `yourdomain.com` ekle
- DNS ayarlarını güncelle
- SSL otomatik aktif olur

**4. Supabase URL Whitelist**

Supabase Dashboard > Authentication > URL Configuration:
- Site URL: `https://yourdomain.com`
- Redirect URLs:
  - `https://yourdomain.com/**`
  - `https://yourdomain.com/admin/login`

✅ **Kod değişikliği gerekmez!**

---

### Senaryo 2: Custom Server (VPS/Cloud)

**1. Environment Variables Dosyası**

Production sunucuda `.env.production`:

```env
NODE_ENV=production

# Supabase (aynı)
NEXT_PUBLIC_SUPABASE_URL=https://dpnlyvgqdbagbrjxuvgw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Domain (optional, Next.js otomatik algılar)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

**2. Build & Start**

```bash
# Build
npm run build

# Start (PM2 ile)
pm2 start npm --name "turistpass" -- start

# Veya direkt:
npm start
```

**3. Nginx Reverse Proxy**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**4. SSL (Let's Encrypt)**

```bash
sudo certbot --nginx -d yourdomain.com
```

---

### Senaryo 3: Subdomain (staging.yourdomain.com)

**Staging Environment:**

```env
# .env.staging
NEXT_PUBLIC_SUPABASE_URL=https://dpnlyvgqdbagbrjxuvgw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=https://staging.yourdomain.com
```

Supabase'de staging URL'i de whitelist'e ekle:
- `https://staging.yourdomain.com/**`

---

## 🔐 Güvenlik Kontrol Listesi

### ✅ Pre-Deployment Checklist

- [ ] `.env.local` dosyası `.gitignore`'da mı? ✅ (zaten var)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` asla client'a expose edilmiyor mu? ✅
- [ ] RLS policies aktif mi? ✅
- [ ] CORS ayarları doğru mu? (Supabase otomatik)
- [ ] Rate limiting var mı? (Supabase built-in)

### ⚠️ Production'da Yapılacaklar

**1. Supabase Production Mode**

Supabase Dashboard > Settings:
- [ ] "Pause project" devre dışı
- [ ] Auto-pause ayarını kapat (Free plan'da 7 gün)
- [ ] Backup enable et

**2. Environment Variables Güvenliği**

```bash
# Local .env.local dosyasını production'a kopyalama!
# Her ortam için ayrı .env dosyası kullan

# Development
.env.local

# Staging
.env.staging

# Production
.env.production
```

**3. Database Backups**

Supabase Dashboard > Database > Backups:
- [ ] Daily backups aktif
- [ ] Point-in-time recovery (Pro plan)

**4. Monitoring**

- [ ] Supabase Dashboard > Logs
- [ ] Vercel Analytics (veya Google Analytics)
- [ ] Error tracking (Sentry önerilen)

---

## 🔄 Domain Değişimi (Sonradan)

### Mevcut: localhost:3000
### Yeni: yourdomain.com

**Gerekli Değişiklikler:**

### 1. Sadece Supabase URL Whitelist

```
Supabase Dashboard > Authentication > URL Configuration

Site URL: https://yourdomain.com

Redirect URLs:
  https://yourdomain.com/**
  https://yourdomain.com/admin/login
```

### 2. Kod Değişikliği: SIFIR! 🎉

Environment variables dinamik olduğu için:
- `NEXT_PUBLIC_SUPABASE_URL` → Her ortamda aynı
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Her ortamda aynı
- Frontend URL'i otomatik algılanır

### 3. Deployment Platform Environment Variables

**Vercel:**
- Dashboard > Settings > Environment Variables
- Existing values'ları kontrol et
- Değişiklik gerekmez

**Custom Server:**
- `.env.production` dosyasını kontrol et
- Supabase keys aynı kalır

---

## 📊 Multi-Environment Setup

### Development (Localhost)

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://dpnlyvgqdbagbrjxuvgw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Staging (staging.yourdomain.com)

```env
# .env.staging
# Aynı Supabase projesi VEYA ayrı staging projesi
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Production (yourdomain.com)

```env
# .env.production veya Vercel dashboard
NEXT_PUBLIC_SUPABASE_URL=https://dpnlyvgqdbagbrjxuvgw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 🧪 Test Senaryoları

### Local → Staging

1. `.env.staging` oluştur
2. Build: `npm run build`
3. Start: `NODE_ENV=staging npm start`
4. Test: https://staging.yourdomain.com

### Staging → Production

1. Staging'de test et
2. Production environment variables'ı set et
3. Deploy: `vercel --prod` veya `git push origin main`
4. Test: https://yourdomain.com

---

## 🚨 Troubleshooting

### Sorun: "Invalid login redirect URL"

**Çözüm:**
```
Supabase Dashboard > Auth > URL Configuration
Redirect URLs'e yeni domain'i ekle
```

### Sorun: "CORS error"

**Çözüm:**
Supabase otomatik handle eder. Eğer problem varsa:
```
Supabase Dashboard > API Settings
Allowed origins'e domain ekle
```

### Sorun: Environment variables çalışmıyor

**Çözüm:**
1. Vercel: Dashboard'da değerleri kontrol et
2. Custom: `.env.production` doğru yerde mi?
3. Restart gerekli: `vercel --prod` veya `pm2 restart turistpass`

---

## 📝 Deployment Checklist

### Pre-Deployment

- [ ] Tüm testler başarılı
- [ ] RLS policies aktif
- [ ] `.env.local` git'te değil
- [ ] Build başarılı: `npm run build`
- [ ] Type check: `npm run type-check` (eklenecek)
- [ ] Lint check: `npm run lint`

### Deployment

- [ ] Environment variables set edildi
- [ ] Domain DNS ayarları yapıldı
- [ ] SSL sertifikası aktif
- [ ] Supabase URL whitelist güncellendi

### Post-Deployment

- [ ] Login test
- [ ] Dashboard açılıyor mu
- [ ] API routes çalışıyor mu
- [ ] Error tracking aktif
- [ ] Monitoring dashboards kontrol

---

## 🎯 Önerilen Deployment Stack

### Frontend
- **Platform**: Vercel (önerilen) veya Netlify
- **Avantajlar**:
  - Otomatik SSL
  - Global CDN
  - Preview deployments
  - Environment variables UI
  - Zero-config Next.js support

### Database & Backend
- **Platform**: Supabase (zaten kullanılıyor)
- **Avantajlar**:
  - Managed Postgres
  - Built-in auth
  - Real-time subscriptions
  - Auto-generated APIs
  - File storage

### Monitoring
- **Frontend**: Vercel Analytics veya Plausible
- **Errors**: Sentry
- **Uptime**: UptimeRobot

### CI/CD
- **Git**: GitHub/GitLab
- **Auto Deploy**: Vercel GitHub integration
- **Preview**: Her PR için otomatik preview URL

---

## 💰 Cost Estimation

### Free Tier (Başlangıç)

**Vercel Free:**
- ✅ 100 GB bandwidth
- ✅ Serverless Functions
- ✅ SSL certificates
- ✅ Preview deployments

**Supabase Free:**
- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 50,000 monthly active users
- ⚠️ Pauses after 7 days inactivity

**Total: $0/month**

### Recommended (Production)

**Vercel Pro: $20/month**
- Unlimited bandwidth
- Advanced analytics
- Password protection

**Supabase Pro: $25/month**
- 8 GB database
- 100 GB file storage
- No pausing
- Daily backups
- Point-in-time recovery

**Total: $45/month**

---

## 📞 Support & Resources

### Dokümantasyon
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs

### Community
- Next.js Discord
- Supabase Discord
- GitHub Issues

---

**Son Güncelleme:** 2025-10-29
**Versiyon:** 1.0
**Durum:** ✅ Production Ready (FAZ 1 tamamlandı)
