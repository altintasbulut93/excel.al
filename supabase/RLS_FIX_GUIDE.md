# 🔒 RLS ACCESS FIX - Kullanım Kılavuzu

## 📋 Sorun
`altintasbulut93@gmail.com` kullanıcısı giriş yapabiliyor ancak `financial_models` tablosundaki verilerini göremiyor.

## 🎯 Çözüm
RLS (Row Level Security) politikalarını düzeltip kullanıcıya admin yetkisi vereceğiz.

---

## 🚀 HIZLI ÇÖZÜM (3 Adım)

### Adım 1: Supabase Dashboard'a Git
1. https://supabase.com/dashboard adresine git
2. Projenizi seçin
3. Sol menüden **SQL Editor**'ı aç

### Adım 2: Auto Profile Trigger'ı Çalıştır
1. `supabase/auto-profile-trigger.sql` dosyasını aç
2. Tüm içeriği kopyala
3. Supabase SQL Editor'a yapıştır
4. **RUN** butonuna bas
5. ✅ "Success. No rows returned" mesajını gör

### Adım 3: Test Et
1. `supabase/test-rls-access.sql` dosyasını aç
2. **TEST 1-8** sorgularını sırayla çalıştır
3. Her testin beklenen sonucu dosyada yazıyor

---

## 📝 DETAYLI ÇÖZÜM (Sorun Devam Ederse)

### Seçenek A: Manuel Profil Oluşturma

1. **Kullanıcı ID'sini Bul:**
```sql
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'altintasbulut93@gmail.com';
```

2. **Profil Oluştur/Güncelle:**
```sql
-- ID'yi yukarıdaki sorguda bulduğun UUID ile değiştir
INSERT INTO public.profiles (id, email, full_name, is_admin, subscription_tier)
VALUES (
  'BURAYA_USER_ID_YAZ',
  'altintasbulut93@gmail.com',
  'Bulut Altıntaş',
  TRUE,
  'enterprise'
)
ON CONFLICT (id) 
DO UPDATE SET
  is_admin = TRUE,
  subscription_tier = 'enterprise',
  updated_at = NOW();
```

3. **Doğrula:**
```sql
SELECT id, email, is_admin, subscription_tier
FROM public.profiles
WHERE email = 'altintasbulut93@gmail.com';
```

### Seçenek B: RLS Politikalarını Yeniden Oluştur

1. `supabase/fix-rls-access.sql` dosyasını aç
2. **Step 5-6** bölümlerini çalıştır (DROP ve CREATE POLICY)
3. Politikaların oluşturulduğunu doğrula:
```sql
SELECT tablename, policyname
FROM pg_policies
WHERE tablename = 'financial_models';
```

---

## 🧪 TEST SENARYOLARI

### Test 1: Profil Kontrolü
```sql
SELECT * FROM public.profiles 
WHERE email = 'altintasbulut93@gmail.com';
```

**Beklenen:** 
- ✅ `is_admin = TRUE`
- ✅ `subscription_tier = 'enterprise'`

### Test 2: Model Görüntüleme
```sql
SELECT id, business_name, user_id, created_at
FROM public.financial_models
ORDER BY created_at DESC
LIMIT 5;
```

**Beklenen:** 
- ✅ Tüm modelleri görebilmeli (admin olduğu için)

### Test 3: Yeni Model Oluşturma
Uygulamada yeni bir finansal model oluştur ve kaydet.

**Beklenen:** 
- ✅ Model başarıyla kaydedilmeli
- ✅ Dashboard'da görünmeli

---

## ⚠️ SORUN GİDERME

### Sorun: "No rows returned" hatası
**Çözüm:**
```sql
-- RLS'i geçici olarak devre dışı bırak (TESTİNG ONLY!)
ALTER TABLE public.financial_models DISABLE ROW LEVEL SECURITY;

-- Verileri kontrol et
SELECT * FROM public.financial_models;

-- RLS'i tekrar aç
ALTER TABLE public.financial_models ENABLE ROW LEVEL SECURITY;
```

### Sorun: Profil oluşturulamıyor
**Çözüm:**
```sql
-- Mevcut profili sil
DELETE FROM public.profiles 
WHERE email = 'altintasbulut93@gmail.com';

-- Trigger'ı tekrar çalıştır
-- (auto-profile-trigger.sql dosyasından)
```

### Sorun: Admin yetkisi çalışmıyor
**Çözüm:**
```sql
-- Profili güncelle
UPDATE public.profiles
SET 
  is_admin = TRUE,
  subscription_tier = 'enterprise',
  updated_at = NOW()
WHERE email = 'altintasbulut93@gmail.com';

-- Uygulamadan çıkış yap ve tekrar giriş yap
```

---

## 📊 KONTROL LİSTESİ

- [ ] Kullanıcı `auth.users` tablosunda var mı?
- [ ] Kullanıcı `profiles` tablosunda var mı?
- [ ] `is_admin = TRUE` mı?
- [ ] `subscription_tier = 'enterprise'` mı?
- [ ] RLS politikaları aktif mi?
- [ ] Trigger oluşturuldu mu?
- [ ] Test sorguları başarılı mı?
- [ ] Uygulamadan çıkış yapıp tekrar giriş yapıldı mı?

---

## 🔍 DEBUG SORULARI

```sql
-- 1. Mevcut kullanıcı kimliği
SELECT auth.uid(), auth.email();

-- 2. Profil durumu
SELECT * FROM public.profiles WHERE id = auth.uid();

-- 3. Model sayısı
SELECT COUNT(*) FROM public.financial_models;

-- 4. Kullanıcıya ait model sayısı
SELECT COUNT(*) FROM public.financial_models WHERE user_id = auth.uid();

-- 5. RLS durumu
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'financial_models';

-- 6. Aktif politikalar
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'financial_models';
```

---

## 📞 DESTEK

Sorun devam ederse:
1. Yukarıdaki debug sorgularının çıktılarını kaydet
2. Supabase Dashboard > Logs bölümünü kontrol et
3. Browser Console'da hata var mı bak (F12)

---

## ✅ BAŞARILI KURULUM SONRASI

Başarılı kurulum sonrası şunları görebilmelisin:

1. **Dashboard'da:**
   - ✅ Tüm finansal modellerin listesi
   - ✅ "👑 Admin Mode" badge'i
   - ✅ Yeni model oluşturabilme

2. **Supabase'de:**
   - ✅ Profile kaydın var
   - ✅ `is_admin = TRUE`
   - ✅ RLS politikaları aktif
   - ✅ Trigger çalışıyor

---

## 🎉 SONUÇ

Bu adımları takip ettikten sonra:
- ✅ Tüm verilerinizi görebileceksiniz
- ✅ Admin yetkilerine sahip olacaksınız
- ✅ Yeni modeller oluşturabileceksiniz
- ✅ Diğer kullanıcıların modellerini görebileceksiniz (admin olarak)
