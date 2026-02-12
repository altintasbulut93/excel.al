# 🔐 Supabase RLS & Admin Setup Guide

## 📋 ADIM ADIM KURULUM

### 1️⃣ Supabase Dashboard'a Giriş Yapın

1. [Supabase Dashboard](https://app.supabase.com/) adresine gidin
2. Projenizi seçin (nytrkhlaywcgtjmqsdxv)

---

### 2️⃣ Eski Tabloları Silin (Eğer Varsa)

**⚠️ DİKKAT:** Bu işlem mevcut verileri silecektir!

```sql
-- SQL Editor'da çalıştırın:
DROP TABLE IF EXISTS public.financial_models CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
```

---

### 3️⃣ Yeni Schema'yı Yükleyin

1. Supabase Dashboard → **SQL Editor** (sol menü)
2. **New Query** butonuna tıklayın
3. `supabase/schema.sql` dosyasının **TÜM İÇERİĞİNİ** kopyalayın
4. SQL Editor'a yapıştırın
5. **RUN** butonuna tıklayın (veya Ctrl+Enter)

**Beklenen Çıktı:**
```
Success. No rows returned
```

---

### 4️⃣ Admin Yetkisi Verin

#### Seçenek A: Email ile (Önerilen)

```sql
-- SQL Editor'da çalıştırın:
UPDATE public.profiles 
SET 
  is_admin = true,
  subscription_tier = 'enterprise',
  updated_at = now()
WHERE email = 'altintasbulut93@gmail.com';
```

#### Seçenek B: User ID ile

Önce user ID'nizi bulun:
```sql
SELECT id, email FROM auth.users WHERE email = 'altintasbulut93@gmail.com';
```

Sonra admin yapın:
```sql
UPDATE public.profiles 
SET is_admin = true, subscription_tier = 'enterprise'
WHERE id = 'YOUR_USER_ID_HERE'::uuid;
```

---

### 5️⃣ Doğrulama

#### Profil Kontrolü:
```sql
SELECT 
  id,
  email,
  is_admin,
  subscription_tier,
  created_at
FROM public.profiles
WHERE email = 'altintasbulut93@gmail.com';
```

**Beklenen Sonuç:**
```
is_admin: true
subscription_tier: enterprise
```

#### RLS Politikaları Kontrolü:
```sql
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'financial_models';
```

**Beklenen Sonuç:** 4 politika görmelisiniz:
- Users can view own models (SELECT)
- Authenticated users can create models (INSERT)
- Users can update own models (UPDATE)
- Users can delete own models (DELETE)

---

## 🎯 ADMIN ÖZELLİKLERİ

Admin olarak şunları yapabilirsiniz:

### ✅ Tüm Modelleri Görme
```sql
-- Admin tüm kullanıcıların modellerini görebilir
SELECT 
  fm.id,
  fm.business_name,
  fm.sector,
  p.email as owner_email,
  fm.created_at
FROM public.financial_models fm
LEFT JOIN public.profiles p ON fm.user_id = p.id
ORDER BY fm.created_at DESC;
```

### ✅ Pro Özelliklere Erişim
- Excel indirme (sınırsız)
- PDF indirme (sınırsız)
- 36 aylık projeksiyon
- Tüm benchmark verileri

### ✅ UI'da Admin Badge
Ana sayfada "👑 Admin Mode" badge'i görünecek

---

## 🐛 SORUN GİDERME

### Sorun: "Modellerimi göremiyorum"

**Çözüm 1:** Profil oluşturuldu mu?
```sql
SELECT * FROM public.profiles WHERE email = 'altintasbulut93@gmail.com';
```

Eğer boş dönerse, manuel oluşturun:
```sql
INSERT INTO public.profiles (id, email, is_admin, subscription_tier)
SELECT 
  id,
  email,
  true,
  'enterprise'
FROM auth.users
WHERE email = 'altintasbulut93@gmail.com'
ON CONFLICT (id) DO UPDATE
SET is_admin = true, subscription_tier = 'enterprise';
```

**Çözüm 2:** RLS kapalı mı?
```sql
-- RLS'yi aktif et
ALTER TABLE public.financial_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

**Çözüm 3:** Politikalar eksik mi?
`supabase/schema.sql` dosyasını tekrar çalıştırın.

---

### Sorun: "Admin badge görünmüyor"

**Kontrol 1:** Browser console'u açın (F12)
```javascript
// Console'da çalıştırın:
localStorage.clear();
location.reload();
```

**Kontrol 2:** Profil verisini kontrol edin
```sql
SELECT is_admin, subscription_tier 
FROM public.profiles 
WHERE email = 'altintasbulut93@gmail.com';
```

**Kontrol 3:** Çıkış yapıp tekrar giriş yapın

---

### Sorun: "Excel/PDF indiremiyorum"

**Çözüm:** Admin yetkisini kontrol edin
```sql
-- Admin mi?
SELECT is_admin FROM public.profiles WHERE email = 'altintasbulut93@gmail.com';

-- Değilse, admin yapın:
UPDATE public.profiles SET is_admin = true WHERE email = 'altintasbulut93@gmail.com';
```

Sonra sayfayı yenileyin (Ctrl+F5)

---

## 📊 KULLANICI YÖNETİMİ

### Başka Kullanıcıya Admin Yetkisi Verme
```sql
UPDATE public.profiles 
SET is_admin = true, subscription_tier = 'enterprise'
WHERE email = 'kullanici@example.com';
```

### Kullanıcıyı Pro Yapma (Admin değil)
```sql
UPDATE public.profiles 
SET subscription_tier = 'pro'
WHERE email = 'kullanici@example.com';
```

### Admin Yetkisini Kaldırma
```sql
UPDATE public.profiles 
SET is_admin = false, subscription_tier = 'free'
WHERE email = 'kullanici@example.com';
```

### Tüm Adminleri Listeleme
```sql
SELECT email, subscription_tier, created_at
FROM public.profiles
WHERE is_admin = true
ORDER BY created_at;
```

---

## 🔒 GÜVENLİK NOTLARI

1. **Admin yetkisi çok güçlüdür** - Sadece güvendiğiniz kişilere verin
2. **RLS politikaları** - Asla devre dışı bırakmayın
3. **Service Role Key** - Asla frontend'de kullanmayın
4. **Anon Key** - Public olabilir, sadece RLS ile korunan verilere erişir

---

## ✅ BAŞARILI KURULUM KONTROL LİSTESİ

```
✅ Schema.sql çalıştırıldı
✅ profiles tablosu oluşturuldu
✅ financial_models tablosu oluşturuldu
✅ RLS politikaları aktif
✅ Admin yetkisi verildi (altintasbulut93@gmail.com)
✅ Profil doğrulandı (is_admin = true)
✅ UI'da admin badge görünüyor
✅ Excel/PDF indirme çalışıyor
✅ Tüm modeller görünüyor
```

---

## 📝 HIZLI REFERANS

### Admin Yapma (Tek Satır)
```sql
UPDATE public.profiles SET is_admin = true, subscription_tier = 'enterprise' WHERE email = 'altintasbulut93@gmail.com';
```

### Tüm Modelleri Görme (Admin)
```sql
SELECT * FROM public.financial_models ORDER BY created_at DESC;
```

### Profil Durumu Kontrol
```sql
SELECT email, is_admin, subscription_tier FROM public.profiles WHERE email = 'altintasbulut93@gmail.com';
```

---

**Kurulum tamamlandıktan sonra uygulamaya giriş yapın ve admin özelliklerinin aktif olduğunu görün!** 🎉
