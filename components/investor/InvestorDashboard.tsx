
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/lib/i18n-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, Users, DollarSign, Wallet, ArrowUpRight, Lock, Key, Globe, ShieldCheck, Mail } from 'lucide-react';
import { generateFinancialModel } from "@/lib/engine/financials";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface InvestorDashboardProps {
    token: string;
}

export function InvestorDashboard({ token }: InvestorDashboardProps) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [passwordRequired, setPasswordRequired] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [modelData, setModelData] = useState<any>(null);

    // Interactive State
    const [growthMultiplier, setGrowthMultiplier] = useState(1.0); // 0.5x to 2x master slider
    const [marketingBudgetMultiplier, setMarketingBudgetMultiplier] = useState(1.0);

    // Fetch Logic
    const fetchModel = async (pwd?: string) => {
        setLoading(true);
        setError(null);
        try {
            console.log("Fetching share data...", token);
            const res = await fetch(`/api/share/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: pwd })
            });
            const data = await res.json();
            console.log("Share API Data:", data);

            if (data.success && data.model) {
                // Validate essential fields
                if (!data.model.inputs) {
                    console.error("Missing inputs in model data:", data.model);
                    setError("Model data is corrupted or incomplete.");
                } else {
                    setModelData(data.model);
                    setPasswordRequired(false);
                }
            } else {
                if (res.status === 401 || data.code === 401 || data.is_password_protected) {
                    setPasswordRequired(true);
                } else {
                    setError(data.error || "Failed to load model. Please regenerate the link.");
                }
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Network error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchModel();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // Reactive Calculation
    const computedResults = useMemo(() => {
        if (!modelData || !modelData.inputs) return null;

        // Clone inputs to avoid mutation
        const inputs = JSON.parse(JSON.stringify(modelData.inputs));

        // Apply Multipliers
        if (inputs.revenue && Array.isArray(inputs.revenue)) {
            inputs.revenue.forEach((r: any) => {
                if (r.growthRate) r.growthRate *= growthMultiplier;
            });
        }

        // Apply Marketing Budget Multiplier (simplified logic)
        // Assuming we have marketing inputs
        if (inputs.expenses && inputs.expenses.marketing) {
            // This is tricky without knowing exact structure in `inputs`, but let's assume `marketingBudget` field exists or similar
            // Using a generic approach: multiplier affects growth directly usually.
        }

        // Recalculate
        return generateFinancialModel(inputs);
    }, [modelData, growthMultiplier, marketingBudgetMultiplier]);

    // Chart Data Preparation
    const chartData = useMemo(() => {
        if (!computedResults || !modelData) return [];

        // We want to compare Original vs Adjusted. 
        // BUT we don't have the original results cached in `modelData` fully usable for this chart structure easily without re-running engine.
        // Let's run engine once for base.
        const baseResults = generateFinancialModel(modelData.inputs);

        return computedResults.monthly.slice(0, 24).map((m: any, i: number) => ({
            month: `M${i + 1}`,
            revenue_base: baseResults.monthly[i].revenue,
            revenue_adj: m.revenue,
            cash_base: baseResults.monthly[i].cashFlow.endingBalance,
            cash_adj: m.cashFlow.endingBalance,
        }));
    }, [computedResults, modelData]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-slate-500 animate-pulse">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    // Password Gate
    if (passwordRequired) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
                <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-blue-600">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-blue-600" />
                        </div>
                        <CardTitle>{t('investor_dash.locked')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-center text-sm text-muted-foreground">
                            {t('investor_dash.enter_password')}
                        </p>
                        <Input
                            type="password"
                            placeholder="Password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchModel(passwordInput)}
                        />
                        <Button className="w-full" onClick={() => fetchModel(passwordInput)}>
                            {t('investor_dash.unlock')}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !modelData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
                    <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-700 mb-2">Access Denied</h2>
                    <p className="text-red-600">{error || "Link invalid or expired."}</p>
                </div>
            </div>
        );
    }

    const { business_name, sector } = modelData;
    const summary = computedResults?.summary;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">

            {/* Top Navigation / Brand */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {business_name?.charAt(0) || 'E'}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-none text-slate-900 dark:text-white">{business_name}</h1>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">{t('investor_dash.title')}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 hidden sm:flex">
                            <Globe className="w-3 h-3" /> Live Model
                        </Badge>
                        <Button size="sm" variant="default" className="gap-2">
                            <Mail className="w-4 h-4" />
                            <span className="hidden sm:inline">Contact Founder</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        title="Runway"
                        value={`${summary?.runwayMonths || 0} Months`}
                        icon={<TrendingUp className="text-blue-600" />}
                        trend={summary?.runwayMonths < 6 ? "Critical" : "Healthy"}
                        trendColor={summary?.runwayMonths < 6 ? "text-red-500" : "text-emerald-500"}
                    />
                    <KpiCard
                        title="Burn Rate"
                        value={formatCurrency(summary?.averageBurn || 0)}
                        icon={<Wallet className="text-rose-500" />}
                        subtext="Monthly Avg"
                    />
                    <KpiCard
                        title="LTV / CAC"
                        value={`${summary?.unitEconomics?.ltvCacRatio?.toFixed(1) || 0}x`}
                        icon={<Users className="text-purple-500" />}
                        trend={summary?.unitEconomics?.ltvCacRatio > 3 ? "Excellent" : "Needs Imp."}
                    />
                    <KpiCard
                        title="Revenue (Yr 1)"
                        value={formatCurrency(summary?.totalRevenue || 0)}
                        icon={<DollarSign className="text-emerald-500" />}
                        subtext="Projected"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Controls Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-l-4 border-l-blue-500 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Key className="w-5 h-5 text-blue-500" />
                                    {t('investor_dash.growth_levers')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <label className="text-sm font-medium">Growth Rate Adjustment</label>
                                        <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded">{Math.round((growthMultiplier - 1) * 100)}%</span>
                                    </div>
                                    <Slider
                                        defaultValue={[1.0]}
                                        min={0.5}
                                        max={2.0}
                                        step={0.1}
                                        onValueChange={(vals) => setGrowthMultiplier(vals[0])}
                                    />
                                    <p className="text-xs text-muted-foreground">Adjust projected monthly growth between -50% and +100%.</p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <h4 className="font-semibold text-sm mb-2">{t('investor_dash.executive_summary')}</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {t('investor_dash.summary_intro')} <strong className={summary?.unitEconomics?.ltvCacRatio > 3 ? 'text-emerald-600' : 'text-amber-600'}>
                                            {summary?.unitEconomics?.ltvCacRatio > 3 ? t('investor_dash.strong_potential') : t('investor_dash.moderate_risk')}
                                        </strong>.
                                        With a runway of {summary?.runwayMonths} months, the capital efficiency is rated as
                                        <strong> {summary?.runwayMonths > 12 ? "High" : "Low"}</strong>.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle>{t('investor_dash.impact_analysis')}</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                                            formatter={(val: number) => formatCurrency(val)}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="revenue_base" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} name={t('investor_dash.founder_scenario')} dot={false} />
                                        <Line type="monotone" dataKey="revenue_adj" stroke="#2563eb" strokeWidth={3} name={t('investor_dash.your_scenario')} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </main>

            {/* Powered By Footer */}
            <footer className="border-t py-8 bg-white mt-12">
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-2 text-slate-400 font-semibold">
                        <span className="w-5 h-5 bg-slate-200 rounded flex items-center justify-center text-[10px] text-slate-600">e</span>
                        excel.al
                    </div>
                    <p className="text-xs text-muted-foreground">{t('investor_dash.powered_by')}</p>
                </div>
            </footer>
        </div>
    );
}

function KpiCard({ title, value, icon, trend, trendColor, subtext }: any) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <div className="p-2 bg-slate-50 rounded-full">{icon}</div>
                </div>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                {(trend || subtext) && (
                    <div className={`text-xs mt-1 ${trendColor || 'text-muted-foreground'} flex items-center gap-1`}>
                        {trend && <ArrowUpRight className="w-3 h-3" />}
                        {trend || subtext}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
