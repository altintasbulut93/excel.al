import { useFinancialStore } from "@/lib/store";
import { useLanguage } from "@/lib/i18n-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Plus, Trash2, Users, Wand2, CalendarClock, Briefcase } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { useFormat } from "@/hooks/use-format";

const SECTOR_EXPENSES: Record<string, Array<{ name: string, amount: number, currency: 'TRY' | 'USD' | 'EUR' | 'GBP' }>> = {
    'saas': [
        { name: 'Cloud Hosting (AWS/Azure)', amount: 500, currency: 'USD' },
        { name: 'SaaS Tools (Jira, Slack)', amount: 200, currency: 'USD' },
        { name: 'Legal & Compliance', amount: 10000, currency: 'TRY' }
    ],
    'e-ticaret': [
        { name: 'Depo & Lojistik (3PL)', amount: 5000, currency: 'TRY' },
        { name: 'Ambalaj & Paketleme', amount: 2000, currency: 'TRY' },
        { name: 'Ürün Fotoğrafçılığı', amount: 3000, currency: 'TRY' }
    ],
    'ecommerce': [
        { name: 'Warehousing / 3PL', amount: 500, currency: 'USD' },
        { name: 'Packaging', amount: 200, currency: 'USD' },
        { name: 'Photography', amount: 300, currency: 'USD' }
    ],
    'mobil uygulama': [
        { name: 'App Store Fees (Annual)', amount: 99, currency: 'USD' },
        { name: 'Server & Backend', amount: 200, currency: 'USD' }
    ],
    'hizmet': [
        { name: 'Ofis Kirası / Coworking', amount: 10000, currency: 'TRY' },
        { name: 'Ulaşım & Yemek', amount: 5000, currency: 'TRY' }
    ],
    'paryakende': [
        { name: 'Mağaza Kirası', amount: 25000, currency: 'TRY' },
        { name: 'Elektrik & Su', amount: 3000, currency: 'TRY' },
        { name: 'POS Komisyonları', amount: 1000, currency: 'TRY' }
    ],
    'üretim': [
        { name: 'Fabrika Kirası', amount: 50000, currency: 'TRY' },
        { name: 'Makine Bakım', amount: 5000, currency: 'TRY' },
        { name: 'Elektrik (Sanayi)', amount: 10000, currency: 'TRY' }
    ]
};

export function Step3Expenses() {
    const { data, setData, setStep } = useFinancialStore();
    const { t, language } = useLanguage();
    const { format, currency } = useFormat();

    const [team, setTeam] = useState(data.team);
    const [fixedExpenses, setFixedExpenses] = useState(data.fixedExpenses);
    const [marketingBudget, setMarketingBudget] = useState(data.marketing.value);
    const [marketingType, setMarketingType] = useState(data.marketing.type);

    // Add Team Member
    const addTeamMember = () => {
        setTeam([...team, { id: uuidv4(), role: t('wizard.new_role'), count: 1, salary: 20002.50, isNetSalary: false, startMonth: 1 }]);
    };

    const updateTeamMember = (id: string, field: string, value: any) => {
        setTeam(team.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const removeTeamMember = (id: string) => {
        setTeam(team.filter(t => t.id !== id));
    };

    // Add Expense
    const addExpense = () => {
        setFixedExpenses([...fixedExpenses, { id: uuidv4(), name: t('wizard.new_expense'), amount: 1000, currency: 'TRY' }]);
    };

    const updateExpense = (id: string, field: string, value: any) => {
        setFixedExpenses(fixedExpenses.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const removeExpense = (id: string) => {
        setFixedExpenses(fixedExpenses.filter(e => e.id !== id));
    };

    const handleAutoFill = () => {
        const sectorKey = (data.sector || '').toLowerCase();
        // Try exact match or find by inclusion
        const key = Object.keys(SECTOR_EXPENSES).find(k => sectorKey.includes(k) || k.includes(sectorKey));

        if (key && SECTOR_EXPENSES[key]) {
            const suggestions = SECTOR_EXPENSES[key].map(S => ({
                id: uuidv4(),
                name: S.name,
                amount: S.amount,
                currency: S.currency
            }));
            // Merge or append? Append logic.
            setFixedExpenses([...fixedExpenses, ...suggestions]);
        } else {
            // Fallback generic
            setFixedExpenses([...fixedExpenses, { id: uuidv4(), name: t('wizard.rent'), amount: 10000, currency: 'TRY' }]);
        }
    };

    const handleNext = () => {
        setData({
            team,
            fixedExpenses,
            marketing: { type: marketingType, value: marketingBudget }
        });
        setStep(3); // Result/Preview Step
    };

    const handleBack = () => setStep(1);

    return (
        <Card className="w-full max-w-3xl mx-auto shadow-lg border-primary/20">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">{t('wizard.step3_title')}</CardTitle>
                <CardDescription>{t('wizard.step3_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">

                {/* TEAM SECTION */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-lg flex items-center gap-2"><Users className="w-4 h-4" /> {t('wizard.team_plan')}</Label>
                        <Button size="sm" variant="secondary" onClick={addTeamMember}><Plus className="w-4 h-4 mr-1" /> {t('wizard.add')}</Button>
                    </div>

                    {team.length === 0 && <p className="text-sm text-muted-foreground italic">{t('wizard.no_team')}</p>}

                    <div className="grid gap-3">
                        {team.map((member) => (
                            <div key={member.id} className={`flex flex-col gap-3 p-4 rounded-lg border transition-all duration-300 ${(member.startMonth || 1) > 1
                                    ? "border-dashed border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-900/20"
                                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                                } hover:shadow-md group`}>
                                <div className="grid grid-cols-12 gap-3 items-start">
                                    <div className="col-span-5">
                                        <Label className="text-xs text-muted-foreground mb-1 block">{t('wizard.role') || "Rol / Pozisyon"}</Label>
                                        <Input
                                            value={member.role}
                                            onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                                            placeholder={t('wizard.role_placeholder')}
                                            className="h-9 font-medium"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-xs text-muted-foreground mb-1 block text-center">{t('wizard.count') || "Kişi"}</Label>
                                        <Input
                                            type="number"
                                            value={member.count}
                                            onChange={(e) => updateTeamMember(member.id, 'count', Number(e.target.value))}
                                            className="h-9 text-center"
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <Label className="text-xs text-muted-foreground mb-1 block">{t('wizard.monthly_salary') || "Aylık Maliyet"}</Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                value={member.salary}
                                                onChange={(e) => updateTeamMember(member.id, 'salary', Number(e.target.value))}
                                                placeholder={t('wizard.salary_placeholder')}
                                                className="h-9 pr-8"
                                            />
                                            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-bold">
                                                {currency === 'TRY' ? '₺' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₺'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-span-1 flex justify-end pt-6">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeTeamMember(member.id)}
                                            className="text-muted-foreground hover:text-red-500 hover:bg-red-50 h-8 w-8"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Strategic Hiring Calendar Slider */}
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/50 px-1">
                                    <div className="flex items-center justify-between mb-3">
                                        <Label className="text-xs font-semibold flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                            <CalendarClock className="w-3.5 h-3.5 text-indigo-500" />
                                            {(member.startMonth || 1) === 1
                                                ? (t('wizard.active_now') || "Şu an Aktif")
                                                : `${t('wizard.future_hire') || "Gelecek Planı"}: ${(member.startMonth || 1)}. ${t('common.month') || "Ay"}`}
                                        </Label>
                                        {(member.startMonth || 1) > 1 && (
                                            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                <Briefcase className="w-3 h-3" /> STRATEGIC HIRE
                                            </span>
                                        )}
                                    </div>
                                    <div className="px-1 pb-1">
                                        <Slider
                                            value={[member.startMonth || 1]}
                                            min={1}
                                            max={12}
                                            step={1}
                                            onValueChange={(val) => updateTeamMember(member.id, 'startMonth', val[0])}
                                            className="cursor-pointer py-1"
                                        />
                                        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                            <span className={(member.startMonth || 1) === 1 ? "text-indigo-600 font-bold" : ""}>Start Now</span>
                                            <span>Month 6</span>
                                            <span className={(member.startMonth || 1) === 12 ? "text-indigo-600 font-bold" : ""}>Year 1</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* EXPENSES SECTION */}
                <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <Label className="text-lg">{t('wizard.fixed_expenses')}</Label>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={handleAutoFill} className="border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50">
                                <Wand2 className="w-3 h-3 mr-1" />
                                {t('common.auto_suggest') || 'Auto-Fill'}
                            </Button>
                            <Button size="sm" variant="secondary" onClick={addExpense}><Plus className="w-4 h-4 mr-1" /> {t('wizard.add')}</Button>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        {fixedExpenses.map((expense) => (
                            <div key={expense.id} className="grid grid-cols-12 gap-2 items-center bg-muted/30 p-2 rounded-md">
                                <div className="col-span-7">
                                    <Input
                                        value={expense.name}
                                        onChange={(e) => updateExpense(expense.id, 'name', e.target.value)}
                                        placeholder={t('wizard.expense_name_placeholder')}
                                        className="h-8"
                                    />
                                </div>
                                <div className="col-span-4">
                                    <Input
                                        type="number"
                                        value={expense.amount}
                                        onChange={(e) => updateExpense(expense.id, 'amount', Number(e.target.value))}
                                        placeholder={t('wizard.amount_placeholder')}
                                        className="h-8"
                                    />
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeExpense(expense.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MARKETING */}
                <div className="space-y-4 pt-4 border-t">
                    <Label className="text-lg">{t('wizard.marketing_budget')}</Label>
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <Label className="text-xs mb-1 block">{t('wizard.type')}</Label>
                            <div className="flex gap-1 h-9 rounded-md bg-muted p-1">
                                <button
                                    className={`flex-1 text-sm rounded-sm ${marketingType === 'percentage' ? 'bg-background shadow-sm' : ''}`}
                                    onClick={() => setMarketingType('percentage')}
                                >
                                    {t('wizard.percent_revenue')}
                                </button>
                                <button
                                    className={`flex-1 text-sm rounded-sm ${marketingType === 'fixed' ? 'bg-background shadow-sm' : ''}`}
                                    onClick={() => setMarketingType('fixed')}
                                >
                                    {t('wizard.fixed_amount')}
                                </button>
                            </div>
                        </div>
                        <div className="flex-[2]">
                            <Label className="text-xs mb-1 block">{t('wizard.value')}</Label>
                            <Input
                                type="number"
                                value={marketingBudget}
                                onChange={(e) => setMarketingBudget(Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {marketingType === 'percentage'
                            ? (language === 'tr'
                                ? `Her ay cironun %${(marketingBudget * 100).toFixed(0)}'si pazarlamaya ayrılacak.`
                                : `${(marketingBudget * 100).toFixed(0)}% ${t('wizard.marketing_hint_percent')}`)
                            : (language === 'tr'
                                ? `Her ay sabit ${format(marketingBudget)} pazarlamaya harcanacak.`
                                : `${format(marketingBudget)} ${t('wizard.marketing_hint_fixed')}`)}
                    </p>
                </div>

            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={handleBack}>&larr; {t('common.back')}</Button>
                <Button onClick={handleNext} size="lg">{t('wizard.calculate')} &rarr;</Button>
            </CardFooter>
        </Card>
    );
}
