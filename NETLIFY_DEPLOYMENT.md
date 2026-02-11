# Netlify Deployment Guide

## 🚀 Netlify'da Environment Variables Nasıl Eklenir?

### Adım 1: Netlify Dashboard'a Giriş Yapın
1. [Netlify](https://app.netlify.com/) adresine gidin
2. Projenizi seçin (excel-al)

### Adım 2: Environment Variables Sayfasına Gidin
1. **Site settings** butonuna tıklayın
2. Sol menüden **Build & deploy** seçin
3. **Environment** sekmesine tıklayın
4. **Environment variables** bölümüne gidin

### Adım 3: Değişkenleri Ekleyin

Aşağıdaki değişkenleri **TAM OLARAK** bu isimlerle ekleyin:

#### ✅ ZORUNLU DEĞIŞKENLER (Supabase - Auth için)

```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://nytrkhlaywcgtjmqsdxv.supabase.co
```

```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55dHJraGxheXdjZ3RqbXFzZHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTE3MDEsImV4cCI6MjA4NjIyNzcwMX0.oaESTKYHgS3YuYAH8qMaAvrqEo0YX35mcSnV9c4qyag
```

#### ⚠️ ÖNEMLİ NOTLAR:
- ❌ **NEXT_PUBLIC_SUPABASE_ANON_KEY_** (sonunda alt tire) YANLIŞ!
- ✅ **NEXT_PUBLIC_SUPABASE_ANON_KEY** (alt tire yok) DOĞRU!
- Değerleri kopyalarken **tırnak işareti KULLANMAYIN**
- Değerlerin başında/sonunda **boşluk OLMASIN**

---

#### 🎯 OPSİYONEL DEĞIŞKENLER (Özellikler için)

Bu değişkenler olmadan da site çalışır, ancak ilgili özellikler devre dışı olur:

##### AI Analiz Özelliği (Step 1 - "AI ile Analiz Et" butonu)
```
Key: OPENAI_API_KEY
Value: sk-proj-... (OpenAI API key'iniz)
```

##### Ödeme Sistemi (Premium Unlock)
```
Key: STRIPE_SECRET_KEY
Value: sk_test_... (Stripe secret key)
```

```
Key: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_test_... (Stripe publishable key)
```

##### Email Gönderimi (Excel email ile gönder)
```
Key: RESEND_API_KEY
Value: re_... (Resend API key)
```

---

### Adım 4: Deploy Tetikleyin

1. **Deploys** sekmesine gidin
2. **Trigger deploy** butonuna tıklayın
3. **Clear cache and deploy** seçeneğini seçin
4. Deploy tamamlanana kadar bekleyin (~2-3 dakika)

---

## 🔍 Deploy Sonrası Kontrol Listesi

### ✅ Build Başarılı mı?
Deploy loglarında şunları arayın:
```
✓ Compiled successfully
✓ Generating static pages (10/10)
✅ Supabase client created successfully
```

### ✅ Site Açılıyor mu?
1. Netlify'ın verdiği URL'i açın (örn: `https://excel-al.netlify.app`)
2. Ana sayfa yüklenmeli
3. "excel.al" logosu görünmeli

### ✅ Supabase Çalışıyor mu?
1. Sağ üstte **"Giriş & Kaydet"** butonu olmalı
2. Butona tıklayın
3. Giriş/Kayıt modal'ı açılmalı
4. ❌ "Supabase client not available" hatası OLMAMALI

### ✅ Temel Akış Çalışıyor mu?
1. **Step 1:** İş fikri girin → "Devam Et"
2. **Step 2:** Fiyat ve müşteri sayısı girin → "Devam Et"
3. **Step 3:** Ekip ve giderler girin → "Devam Et"
4. **Step 4:** Dashboard görünmeli
   - Grafikler render olmalı
   - Metrikler görünmeli
   - "Excel İndir" ve "PDF İndir" butonları olmalı

---

## 🐛 Sorun Giderme

### Hata: "Supabase client not available"
**Çözüm:**
1. Netlify'da environment variables'ları kontrol edin
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` isminde **ALT TİRE (_) YOK**
3. Deploy'u yeniden tetikleyin: "Clear cache and deploy"

### Hata: "AI Analizi sırasında bir hata oluştu"
**Çözüm:**
- `OPENAI_API_KEY` ekleyin veya
- AI analiz butonunu kullanmayın, manuel devam edin

### Hata: "Excel indirme başarısız"
**Çözüm:**
- Normal, bu Pro özellik
- Önce "Upgrade to Pro" ile ödeme yapılmalı

### Build Hatası: "exit code: 2"
**Çözüm:**
1. Deploy loglarını okuyun
2. Hangi environment variable eksik göreceksiniz
3. Ekleyin ve yeniden deploy edin

---

## 📞 Destek

Sorun devam ederse:
1. Netlify deploy loglarını kontrol edin
2. Browser console'u açın (F12)
3. Hata mesajlarını okuyun
4. Environment variables'ları tekrar kontrol edin

---

## ✅ Başarılı Deploy Örneği

Deploy loglarında şunları görmelisiniz:

```
▲ Next.js 16.1.6 (Turbopack)
- Environments: .env.local

Creating an optimized production build ...
✓ Compiled successfully in 20.3s
✓ Collecting page data using 7 workers
✅ Supabase client created successfully
✓ Generating static pages (10/10)
✓ Finalizing page optimization

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/analyze
├ ƒ /api/checkout
├ ƒ /api/generate-excel
├ ƒ /api/generate-pdf
├ ƒ /api/send-email
└ ○ /success

Deploy successful! 🎉
```

---

## 🎯 Minimum Çalışır Konfigürasyon

Sadece şu 2 değişken ile bile site çalışır:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Diğer özellikler (AI, Stripe, Email) opsiyoneldir.
