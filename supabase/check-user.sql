-- ============================================
-- KULLANICI KONTROL SCRIPTI
-- ============================================

-- 1. Kullanıcı auth.users tablosunda var mı?
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email = 'altintasbulut28@gmail.com';

-- 2. Kullanıcı profiles tablosunda var mı?
SELECT id, email, is_admin, subscription_tier 
FROM public.profiles 
WHERE email = 'altintasbulut28@gmail.com';

-- SONUÇ YORUMLAMA:
-- Eğer 1. sorgu boş dönerse: Kullanıcı HİÇ KAYIT OLMAMIŞTIR. Uygulamadan "Kayıt Ol" yapmanız gerekir.
-- Eğer 1. sorgu dolu ama email_confirmed_at NULL ise: E-posta doğrulanmamış. (fix-admin-login.sql çalıştırın)
-- Eğer 1. sorgu dolu ama 2. sorgu boşsa: Profil oluşmamış. (fix-admin-login.sql çalıştırın)
