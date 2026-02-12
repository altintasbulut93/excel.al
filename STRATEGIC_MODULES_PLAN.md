# 🏗️ STRATEGIC FINANCIAL MODULES - IMPLEMENTATION PLAN

## 📋 GENEL BAKIŞ

Excel.al uygulamasına profesyonel startup finansal yönetim özellikleri ekleniyor:

1. **Çoklu Senaryo Yönetimi** - İyi/Orta/Kötü senaryolar
2. **Dinamik Parametreler** - Dolar kuru, enflasyon, maaş artışı
3. **Birim Ekonomisi** - CAC, ARPU, LTV, Payback Period
4. **Gider Kırılımı** - Sabit vs Değişken giderler
5. **Ölüm Vadisi Grafiği** - Kümülatif kar/zarar görselleştirme

---

## ✅ TAMAMLANAN ADIMLAR

### 1. Type System ✅
**Dosya:** `lib/engine/types.ts`

**Yeni Tipler:**
- `FinancialParameters` - Dolar kuru, enflasyon, vergi oranları
- `ScenarioInput` - Senaryo tanımları (best/base/worst)
- `UnitEconomics` - CAC, ARPU, LTV metrikleri
- `ScenarioResult` - Senaryo sonuçları
- `DeathValleyChartData` - Ölüm vadisi grafik verisi

**Güncellenmiş Tipler:**
- `FinancialInput` - parameters, scenarios, enableUnitEconomics eklendi
- `MonthlyFinancialResult` - customers, newCustomers, churnedCustomers, CAC/ARPU/LTV eklendi
- `FinancialModelResult` - scenarios, scenarioAnalysis, costStructure eklendi

### 2. Unit Economics Module ✅
**Dosya:** `lib/engine/unit-economics.ts`

**Fonksiyonlar:**
- `calculateCAC()` - Müşteri kazanma maliyeti
- `calculateARPU()` - Kullanıcı başına gelir
- `calculateLTV()` - Yaşam boyu değer
- `calculateLTVCACRatio()` - LTV/CAC oranı
- `calculatePaybackPeriod()` - Geri ödeme süresi
- `calculateUnitEconomics()` - Tüm metrikleri hesapla

### 3. Scenario Management Module ✅
**Dosya:** `lib/engine/scenarios.ts`

**Fonksiyonlar:**
- `DEFAULT_SCENARIOS` - Varsayılan 3 senaryo
- `generateScenarioModel()` - Tek senaryo hesapla
- `generateAllScenarios()` - Tüm senaryoları hesapla
- `calculateScenarioAnalysis()` - Senaryo analizi özeti
- `compareScenarios()` - Senaryoları karşılaştır

### 4. Supabase Schema ✅
**Dosya:** `supabase/schema.sql`

**Yeni Kolonlar (financial_models):**
- `unit_economics` JSONB - Birim ekonomisi metrikleri
- `scenarios` JSONB - Senaryo sonuçları
- `parameters` JSONB - Finansal parametreler
- `cost_structure` JSONB - Gider yapısı
- `cac`, `ltv`, `ltv_cac_ratio`, `churn_rate` NUMERIC - Hızlı sorgular için

**Yeni Tablo:**
- `scenario_templates` - Senaryo şablonları

---

## 🚧 YAPILACAKLAR

### 5. Enhanced Financial Engine 🔄
**Dosya:** `lib/engine/financials.ts`

**Yapılacak Değişiklikler:**
- [ ] Churn hesaplaması ekle
- [ ] Yeni/kaybedilen müşteri tracking
- [ ] Sabit vs değişken gider ayrımı
- [ ] Parametrelere göre dinamik hesaplama (dolar kuru, enflasyon)
- [ ] Unit economics entegrasyonu
- [ ] Cost structure hesaplama

### 6. Death Valley Chart Component 🔄
**Yeni Dosya:** `components/DeathValleyChart.tsx`

**Özellikler:**
- [ ] Kümülatif kar/zarar grafiği
- [ ] Payback period göstergesi
- [ ] En derin nokta (death valley depth) işaretleme
- [ ] Recharts ile görselleştirme

### 7. Parameters Panel Component 🔄
**Yeni Dosya:** `components/ParametersPanel.tsx`

**Özellikler:**
- [ ] Dolar kuru input
- [ ] Enflasyon oranı input
- [ ] Maaş artış oranı input
- [ ] Vergi oranı input
- [ ] Real-time hesaplama tetikleme

### 8. Scenario Manager Component 🔄
**Yeni Dosya:** `components/ScenarioManager.tsx`

**Özellikler:**
- [ ] 3 senaryo kartı (İyi/Orta/Kötü)
- [ ] Senaryo parametreleri düzenleme
- [ ] Senaryo karşılaştırma tablosu
- [ ] Analiz özeti (ortalama, risk skoru)

### 9. Unit Economics Dashboard 🔄
**Yeni Dosya:** `components/UnitEconomicsDashboard.tsx`

**Özellikler:**
- [ ] CAC göstergesi
- [ ] ARPU göstergesi
- [ ] LTV göstergesi
- [ ] LTV/CAC ratio (>3 olmalı uyarısı)
- [ ] Payback period

### 10. Cost Structure Breakdown 🔄
**Yeni Dosya:** `components/CostStructureChart.tsx`

**Özellikler:**
- [ ] Sabit giderler pie chart
- [ ] Değişken giderler pie chart
- [ ] Sabit/Değişken oranı
- [ ] Gider detay tablosu

### 11. Enhanced Excel Generator 🔄
**Dosya:** `lib/excel-generator.ts`

**Yeni Sayfalar:**
- [ ] "Parametreler" sheet - Dolar kuru, enflasyon vb.
- [ ] "Senaryolar" sheet - 3 senaryo karşılaştırması
- [ ] "Birim Ekonomisi" sheet - CAC, ARPU, LTV
- [ ] "Gider Kırılımı" sheet - Sabit vs Değişken
- [ ] "Ölüm Vadisi" sheet - Kümülatif kar/zarar

### 12. Database Integration 🔄
**Dosya:** `lib/db.ts`

**Güncellemeler:**
- [ ] Unit economics kaydetme
- [ ] Scenarios kaydetme
- [ ] Parameters kaydetme
- [ ] Cost structure kaydetme

### 13. Step4Dashboard Enhancement 🔄
**Dosya:** `components/wizard/Step4Dashboard.tsx`

**Yeni Bölümler:**
- [ ] Parameters panel (üstte)
- [ ] Scenario tabs (İyi/Orta/Kötü)
- [ ] Unit Economics kartları
- [ ] Death Valley chart
- [ ] Cost Structure breakdown

---

## 📊 ÖNCELIK SIRASI

### Faz 1: Core Calculations (1-2 saat)
1. ✅ Type system
2. ✅ Unit economics module
3. ✅ Scenario module
4. 🔄 Enhanced financial engine
5. 🔄 Database schema update

### Faz 2: UI Components (2-3 saat)
6. 🔄 Parameters Panel
7. 🔄 Unit Economics Dashboard
8. 🔄 Scenario Manager
9. 🔄 Death Valley Chart
10. 🔄 Cost Structure Chart

### Faz 3: Integration (1-2 saat)
11. 🔄 Step4Dashboard integration
12. 🔄 Excel generator enhancement
13. 🔄 Database save/load
14. 🔄 Testing & bug fixes

---

## 🎯 KULLANICI DENEYİMİ

### Yeni Akış:

1. **Step 1-3:** Mevcut wizard (değişiklik yok)

2. **Step 4 - Dashboard (Yeni):**
   ```
   ┌─────────────────────────────────────┐
   │ PARAMETRELER                        │
   │ Dolar: 34.50 | Enflasyon: %40      │
   │ Maaş Artışı: %25 | Vergi: %25      │
   └─────────────────────────────────────┘
   
   ┌─────────────────────────────────────┐
   │ SENARYOLAR                          │
   │ [İyi] [Orta ✓] [Kötü]              │
   └─────────────────────────────────────┘
   
   ┌─────────────────────────────────────┐
   │ BİRİM EKONOMİSİ                     │
   │ CAC: 500 TL | ARPU: 200 TL         │
   │ LTV: 4,000 TL | LTV/CAC: 8.0 ✅    │
   │ Payback: 2.5 ay                     │
   └─────────────────────────────────────┘
   
   ┌─────────────────────────────────────┐
   │ ÖLÜM VADİSİ                         │
   │ [Kümülatif Kar/Zarar Grafiği]      │
   │ Payback Period: 6. Ay ▼            │
   └─────────────────────────────────────┘
   
   ┌─────────────────────────────────────┐
   │ GİDER YAPISI                        │
   │ Sabit: 60% | Değişken: 40%         │
   │ [Pie Chart]                         │
   └─────────────────────────────────────┘
   ```

---

## 🔧 TEKNİK DETAYLAR

### Parametreler Nasıl Çalışır?

```typescript
// Kullanıcı dolar kurunu değiştirdiğinde:
parameters.usdRate = 35.00;

// Tüm USD cinsinden giderler otomatik güncellenir:
cloudCost = cloudCostUSD * parameters.usdRate;

// Enflasyon uygulanır:
month12Salary = month1Salary * (1 + parameters.inflationRate);
```

### Senaryo Hesaplaması:

```typescript
// Her senaryo için ayrı model çalıştırılır:
const bestCase = generateFinancialModel({
  ...baseInput,
  growth: { monthlyGrowthRate: 0.20, churnRate: 0.03 }
});

const worstCase = generateFinancialModel({
  ...baseInput,
  growth: { monthlyGrowthRate: 0.05, churnRate: 0.08 }
});

// Analiz özeti:
const average = (best + base + worst) / 3;
const risk = (best - worst) / best * 100;
```

### Unit Economics:

```typescript
// Her ay için hesaplanır:
const cac = marketingSpend / newCustomers;
const arpu = revenue / activeCustomers;
const ltv = (arpu * grossMargin) / churnRate;
const ratio = ltv / cac; // >3 olmalı
```

---

## 📝 SONRAKI ADIMLAR

1. **Finansal motoru güncelle** - Churn, parametreler, gider kırılımı
2. **UI componentlerini oluştur** - Parameters, Scenarios, Unit Economics
3. **Dashboard'ı yeniden düzenle** - Yeni bölümleri ekle
4. **Excel generator'ı güncelle** - Yeni sayfalar ekle
5. **Test et** - Tüm hesaplamaları doğrula
6. **Dokümantasyon** - Kullanım kılavuzu yaz

---

## ⚠️ DİKKAT EDİLMESİ GEREKENLER

1. **Geriye Uyumluluk:** Mevcut modeller çalışmaya devam etmeli
2. **Performance:** 3 senaryo = 3x hesaplama, optimize et
3. **Validation:** Parametreler mantıklı aralıklarda olmalı
4. **UX:** Çok fazla bilgi kullanıcıyı bunaltmamalı
5. **Mobile:** Responsive tasarım önemli

---

**Durum:** Faz 1 %60 tamamlandı. Finansal motor güncellemesi devam ediyor.
