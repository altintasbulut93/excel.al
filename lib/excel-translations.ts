export const getExcelTranslations = (lang: string = 'en') => {
    const translations: any = {
        en: {
            sheets: {
                params: 'Parameters',
                marketing: 'Marketing',
                hr: 'Human Resources',
                revenue: 'Revenue Scenarios',
                pl: 'P&L',
                unit: 'Unit Economics',
                investor: 'Investor Analysis'
            },
            cols: {
                category: 'Category',
                variable: 'Variable',
                value: 'Value',
                unit: 'Unit',
                desc: 'Description',
                metric: 'Metric',
                total: 'TOTAL',
                month: 'Month'
            },
            params: {
                financial: 'Financial',
                growth: 'Growth',
                marketing: 'Marketing',
                scenario: 'Scenario',
                valuation: 'Valuation',
                initial_investment: 'Initial Investment',
                tax_rate: 'Corporate Tax',
                optimistic: 'Optimistic',
                base: 'Base',
                pessimistic: 'Pessimistic'
            },
            marketing: {
                budget: 'Monthly Ad Budget',
                cpl: 'Cost Per Lead (CPL)',
                leads: 'Targeted Lead Count',
                conversion: 'Conversion Rate (Lead → Customer)',
                new_customers: 'New Customer Count',
                cac: 'CAC (Customer Acquisition Cost)',
                sdr_need: 'Required SDR Count'
            },
            hr: {
                title: 'Role/Position',
                count: 'Headcount',
                salary: 'Gross Salary (Per Person)',
                cost: 'Total Cost (Incl. Benefits)',
                total: 'TOTAL PERSONNEL COST',
                founders: 'Founders',
                developers: 'Engineering Team (Senior)',
                sales: 'Sales (SDR)',
                marketing_mgr: 'Marketing Manager',
                product_mgr: 'Product Manager'
            },
            revenue: {
                optimistic: 'OPTIMISTIC SCENARIO (Above Target)',
                base: 'BASE SCENARIO (Expected)',
                pessimistic: 'PESSIMISTIC SCENARIO (Risk)',
                unit_price: 'Unit Price',
                starter: 'Starter',
                pro: 'Pro',
                enterprise: 'Enterprise',
                setup: 'Setup',
                training: 'Training',
                total_count: 'Total Count',
                total_revenue: 'Total Revenue'
            },
            pl: {
                revenue: 'TOTAL REVENUE',
                expenses: 'EXPENSES',
                marketing_exp: 'Marketing Expenses',
                personnel_exp: 'Personnel Expenses',
                infra_exp: 'Infrastructure & Hosting (10%)',
                gen_admin: 'General Admin',
                ebitda: 'EBITDA',
                interest: 'Loan Interest',
                tax: 'Tax',
                net_income: 'NET INCOME'
            },
            unit: {
                cac: 'CAC (Customer Acquisition)',
                ltv: 'LTV (Lifetime Value)',
                ratio: 'LTV / CAC Ratio',
                roi: 'Marketing ROI (%)'
            },
            investor: {
                title: 'INVESTOR VALUATION REPORT',
                arr: 'Year 1 ARR (Annual Recurring Revenue)',
                valuation: 'Pre-Money Valuation',
                investment_ask: 'Investment Ask',
                exit_title: 'EXIT SCENARIO (5 YEARS)',
                year5_revenue: 'Year 5 Projected Revenue',
                exit_valuation: 'Exit Valuation',
                investor_share: 'Investor Equity Share (%)',
                investor_return: 'Investor Exit Return',
                moic: 'Investor Multiple (MOIC)',
                irr: 'Investor IRR (Annual Return)',
                vc_check: 'Meets VC Expectations?'
            }
        },
        tr: {
            sheets: {
                params: 'Parametreler',
                marketing: 'Pazarlama',
                hr: 'İnsan Kaynakları',
                revenue: 'Gelir Senaryoları',
                pl: 'Gelir Tablosu',
                unit: 'Birim Ekonomisi',
                investor: 'Yatırımcı Analizi'
            },
            cols: {
                category: 'Kategori',
                variable: 'Değişken',
                value: 'Değer',
                unit: 'Birim',
                desc: 'Açıklama',
                metric: 'Metrik',
                total: 'TOPLAM',
                month: 'Ay'
            },
            params: {
                financial: 'Finansal',
                growth: 'Büyüme',
                marketing: 'Pazarlama',
                scenario: 'Senaryo',
                valuation: 'Değerleme',
                initial_investment: 'Başlangıç Yatırımı',
                tax_rate: 'Kurumlar Vergisi',
                optimistic: 'İyimser',
                base: 'Orta',
                pessimistic: 'Kötümser'
            },
            marketing: {
                budget: 'Aylık Reklam Bütçesi',
                cpl: 'CPL (Lead Başına Maliyet)',
                leads: 'Hedeflenen Lead Sayısı',
                conversion: 'Dönüşüm Oranı (Lead → Müşteri)',
                new_customers: 'Yeni Müşteri Sayısı',
                cac: 'CAC (Müşteri Edinme Maliyeti)',
                sdr_need: 'Gerekli SDR Sayısı'
            },
            hr: {
                title: 'Rol/Pozisyon',
                count: 'Kişi Sayısı',
                salary: 'Brüt Maaş (Kişi Başı)',
                cost: 'Toplam Maliyet (SGK Dahil)',
                total: 'TOPLAM PERSONEL MALİYETİ',
                founders: 'Kurucu Ortaklar',
                developers: 'Yazılım Ekibi (Senior)',
                sales: 'Satış (SDR)',
                marketing_mgr: 'Marketing Manager',
                product_mgr: 'Product Manager'
            },
            revenue: {
                optimistic: 'İYİMSER SENARYO (Hedef Üstü)',
                base: 'ORTA SENARYO (Beklenen)',
                pessimistic: 'KÖTÜMSER SENARYO (Risk)',
                unit_price: 'Birim Fiyat',
                starter: 'Starter',
                pro: 'Pro',
                enterprise: 'Enterprise',
                setup: 'Kurulum',
                training: 'Eğitim',
                total_count: 'Toplam Adet',
                total_revenue: 'Toplam Gelir'
            },
            pl: {
                revenue: 'TOPLAM GELİR',
                expenses: 'GİDERLER',
                marketing_exp: 'Pazarlama Giderleri',
                personnel_exp: 'Personel Giderleri',
                infra_exp: 'Sunucu & Altyapı (%10)',
                gen_admin: 'Genel Yönetim',
                ebitda: 'EBITDA',
                interest: 'Kredi Faizi',
                tax: 'Vergi',
                net_income: 'NET KÂR'
            },
            unit: {
                cac: 'CAC (Müşteri Edinme)',
                ltv: 'LTV (Ömür Boyu Değer)',
                ratio: 'LTV / CAC Oranı',
                roi: 'Pazarlama ROI (%)'
            },
            investor: {
                title: 'YATIRIMCI DEĞERLEME RAPORU',
                arr: '12. Ay Sonu Yıllık Gelir (ARR)',
                valuation: 'Şirket Değerlemesi (Giriş)',
                investment_ask: 'İstenen Yatırım',
                exit_title: 'EXIT SENARYOSU (5 YIL)',
                year5_revenue: '5. Yıl Tahmini Gelir',
                exit_valuation: 'Exit Değerlemesi',
                investor_share: 'Yatırımcı Hissesi (%)',
                investor_return: 'Yatırımcı Exit Getirisi',
                moic: 'Yatırımcı Çarpanı (MOIC)',
                irr: 'Yatırımcı IRR (Yıllık Getiri)',
                vc_check: 'VC Beklentisi Karşılanıyor mu?'
            }
        },
        // Adding simplified fallbacks for other languages to English or partial translation
        // For production, these should be fully translated. I'll provide English as fallback for now and some native sheet names.
        de: {
            sheets: { params: 'Parameter', marketing: 'Marketing', hr: 'Personalwesen', revenue: 'Einnahmeszenarien', pl: 'GuV', unit: 'Einheitsökonomie', investor: 'Investorenanalyse' },
            cols: { category: 'Kategorie', variable: 'Variable', value: 'Wert', unit: 'Einheit', desc: 'Beschreibung', metric: 'Metrik', total: 'GESAMT' },
            // Fallback content to English for deeper keys to save space/time, or just mapping main structure
            params: { financial: 'Finanziell', growth: 'Wachstum' },
            marketing: { budget: 'Monatliches Werbebudget' },
            pl: { revenue: 'GESAMTEINNAHMEN', net_income: 'NETTOGEWINN' }
        },
        es: {
            sheets: { params: 'Parámetros', marketing: 'Marketing', hr: 'Recursos Humanos', revenue: 'Escenarios de Ingresos', pl: 'P&G', unit: 'Economía Unitaria', investor: 'Análisis de Inversores' },
            cols: { category: 'Categoría', variable: 'Variable', value: 'Valor', unit: 'Unidad', desc: 'Descripción', metric: 'Métrica', total: 'TOTAL' },
            pl: { revenue: 'INGRESOS TOTALES', net_income: 'INGRESO NETO' }
        },
        fr: {
            sheets: { params: 'Paramètres', marketing: 'Marketing', hr: 'Ressources Humaines', revenue: 'Scénarios de Revenus', pl: 'P&L', unit: 'Économie Unitaire', investor: 'Analyse des Investisseurs' },
            cols: { category: 'Catégorie', variable: 'Variable', value: 'Valeur', unit: 'Unité', desc: 'Description', metric: 'Métrique', total: 'TOTAL' },
            pl: { revenue: 'REVENU TOTAL', net_income: 'RÉSULTAT NET' }
        },
        ar: {
            sheets: {
                params: 'المعلمات',
                marketing: 'التسويق',
                hr: 'الموارد البشرية',
                revenue: 'سيناريوهات الإيرادات',
                pl: 'الأرباح والخسائر',
                unit: 'اقتصاديات الوحدة',
                investor: 'تحليل المستثمر'
            },
            cols: {
                category: 'الفئة',
                variable: 'المتغير',
                value: 'القيمة',
                unit: 'الوحدة',
                desc: 'الوصف',
                metric: 'المقياس',
                total: 'المجموع',
                month: 'شهر'
            },
            params: {
                financial: 'مالي',
                growth: 'نمو',
                marketing: 'تسويق',
                scenario: 'سيناريو',
                valuation: 'تقييم',
                initial_investment: 'الاستثمار الأولي',
                tax_rate: 'ضريبة الشركات',
                optimistic: 'متفائل',
                base: 'أساسي',
                pessimistic: 'متشائم'
            },
            marketing: {
                budget: 'ميزانية الإعلانات الشهرية',
                cpl: 'تكلفة العميل المحتمل (CPL)',
                leads: 'عدد العملاء المحتملين المستهدف',
                conversion: 'معدل التحويل (Lead → Customer)',
                new_customers: 'عدد العملاء الجدد',
                cac: 'تكلفة استحواذ العميل (CAC)',
                sdr_need: 'عدد مندوبي المبيعات المطلوب'
            },
            hr: {
                title: 'الدور/المنصب',
                count: 'عدد الموظفين',
                salary: 'الراتب الإجمالي (للشخص)',
                cost: 'التكلفة الإجمالية (بما في ذلك المزايا)',
                total: 'إجمالي تكلفة الموظفين',
                founders: 'المؤسسون',
                developers: 'فريق الهندسة',
                sales: 'المبيعات',
                marketing_mgr: 'مدير التسويق',
                product_mgr: 'مدير المنتج'
            },
            revenue: {
                optimistic: 'سيناريو متفائل',
                base: 'سيناريو أساسي',
                pessimistic: 'سيناريو متشائم',
                unit_price: 'سعر الوحدة',
                total_count: 'إجمالي العدد',
                total_revenue: 'إجمالي الإيرادات'
            },
            pl: {
                revenue: 'إجمالي الإيرادات',
                expenses: 'المصاريف',
                marketing_exp: 'مصاريف التسويق',
                personnel_exp: 'مصاريف الموظفين',
                infra_exp: 'البنية التحتية والاستضافة (10%)',
                gen_admin: 'الإدارة العامة',
                ebitda: 'الأرباح قبل الفوائد والضرائب (EBITDA)',
                tax: 'ضريبة',
                net_income: 'صافي الدخل'
            },
            unit: {
                cac: 'تكلفة استحواذ العميل',
                ltv: 'القيمة الدائمة للعميل',
                ratio: 'نسبة LTV / CAC',
                roi: 'عائد الاستثمار التسويقي (%)'
            },
            investor: {
                title: 'تقرير تقييم المستثمر',
                arr: 'الإيرادات السنوية المتكررة (ARR)',
                valuation: 'التقييم المسبق للمال',
                investment_ask: 'طلب الاستثمار',
                exit_title: 'سيناريو الخروج (5 سنوات)',
                year5_revenue: 'الإيرادات المتوقعة للعام الخامس',
                exit_valuation: 'تقييم الخروج',
                investor_share: 'حصة المستثمر (%)',
                investor_return: 'عائد خروج المستثمر',
                moic: 'مضاعف المستثمر (MOIC)',
                irr: 'معدل العائد الداخلي (IRR)',
                vc_check: 'هل يلبي توقعات رأس المال المغامر؟'
            }
        },
        pt: {
            sheets: { params: 'Parâmetros', marketing: 'Marketing', hr: 'Recursos Humanos', revenue: 'Cenários de Receita', pl: 'DRE', unit: 'Economia Unitária', investor: 'Análise de Investidores' },
            cols: { category: 'Categoria', variable: 'Variável', value: 'Valor', unit: 'Unidade', desc: 'Descrição', metric: 'Métrica', total: 'TOTAL', month: 'Mês' },
            pl: { revenue: 'RECEITA TOTAL', net_income: 'LUCRO LÍQUIDO' }
        }
    };

    // Merge with English for missing keys
    const target = translations[lang] || translations['en'];

    // Deep merge helper (simplified) - referencing English for missing keys
    const merge = (base: any, fallback: any) => {
        const result = { ...fallback, ...base };
        for (const key in fallback) {
            if (typeof fallback[key] === 'object' && fallback[key] !== null) {
                result[key] = merge(base[key] || {}, fallback[key]);
            }
        }
        return result;
    }

    return merge(target, translations['en']);
};
