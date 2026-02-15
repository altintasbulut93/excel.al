"use client";

import { useFinancialStore } from "@/lib/store";
import { GTMInput } from "@/lib/engine/types";
import { calculateGTM, GTMResult } from "@/lib/engine/gtm";
import { MarketingMix } from "./MarketingMix";
import { FunnelVisualizer } from "./FunnelDashboard";
import { GTMUnitEconomics } from "./GTMUnitEconomics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Users, DollarSign, TrendingUp, BarChart as BarChartIcon } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n-context";
import { useFormat } from "@/hooks/use-format";

export function GrowthTab() {
    const { data, setData } = useFinancialStore();
    const { t } = useLanguage();
    const { format } = useFormat();

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Initialize GTM data if missing
    useEffect(() => {
        if (!data.gtm) {
            const defaultGTM: GTMInput = {
                channels: [
                    { id: '1', name: 'Google Ads', monthlyBudget: 15000, cpc: 5.0, conversionVisitorToLead: 0.08 },
                    { id: '2', name: 'Meta / Instagram', monthlyBudget: 10000, cpc: 3.5, conversionVisitorToLead: 0.05 },
                    { id: '3', name: 'SEO / İçerik', monthlyBudget: 5000, cpc: 0.5, conversionVisitorToLead: 0.15 }
                ],
                funnel: {
                    leadToSQL: 0.20,
                    sqlToDeal: 0.15,
                    salesCycleDays: 30
                },
                capacity: {
                    leadsPerRep: 150,
                    sdrSalary: 25000 // Gross cost
                }
            };
            setData({ gtm: defaultGTM });
        }
    }, [data.gtm, setData]);

    const gtmData = data.gtm;

    // Calculate Engine Results - Always call hook, handle null inside
    const results = useMemo(() => {
        if (!data.gtm) return [];
        return calculateGTM(data);
    }, [data.gtm, data.pricing]);

    // Don't render anything until mounted to prevent hydration errors
    if (!mounted) return null;

    // Don't render if data is still initializing
    if (!gtmData) return null;

    // Aggregates for Unit Economics
    const totalCAC = results.length > 0 ? results.reduce((sum, r) => sum + r.cac, 0) / results.length : 0;

    // Estimate LTV
    const arpu = data.pricing.amount;
    const monthlyChurn = data.growth?.churnRate || 0.05;
    const ltv = monthlyChurn > 0 ? arpu / monthlyChurn : 0;

    const paybackMonths = (arpu * 0.8) > 0 ? totalCAC / (arpu * 0.8) : 0;

    const handleGTMChange = (newGTM: GTMInput) => {
        setData({ gtm: newGTM });
    };

    const sdrCount = Math.max(...results.map(r => r.sdrCount));
    const totalSdrCost = results.reduce((s, r) => s + r.salesStaffCost, 0);

    const isB2C = ['ecommerce', 'e-ticaret', 'retail', 'perakende', 'paryakende', 'production', 'üretim', 'marketplace'].includes((data.sector || '').toLowerCase()) || data.businessModel === 'B2C' || data.businessModel === 'B2B2C';

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('dashboard.growth_tab.title')}</h2>
                    <p className="text-muted-foreground mt-1">
                        {t('dashboard.growth_tab.desc')}
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-4">
                    <Card className="px-4 py-2 bg-blue-50 border-blue-100 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                            <Users className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-xs text-blue-600 font-medium uppercase">{t('dashboard.growth_tab.annual_leads')}</div>
                            <div className="text-xl font-bold text-blue-900">
                                {results.reduce((sum, r) => sum + r.leads, 0).toLocaleString()}
                            </div>
                        </div>
                    </Card>
                    <Card className="px-4 py-2 bg-green-50 border-green-100 flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full text-green-600">
                            <DollarSign className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-xs text-green-600 font-medium uppercase">{t('dashboard.growth_tab.potential_revenue')}</div>
                            <div className="text-xl font-bold text-green-900">
                                {format(results.reduce((sum, r) => sum + r.newRevenue, 0))}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Strategic Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Inputs (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <MarketingMix
                        channels={gtmData.channels}
                        onChange={(channels) => handleGTMChange({ ...gtmData, channels })}
                    />

                    <FunnelVisualizer
                        funnel={gtmData.funnel}
                        visits={results.reduce((acc, curr) => acc + curr.visits, 0)}
                        leads={results.reduce((acc, curr) => acc + curr.leads, 0)}
                        onChange={(funnel) => handleGTMChange({ ...gtmData, funnel })}
                        isB2C={isB2C}
                    />
                </div>

                {/* Right Column: Visualization & Unit Economics (8 cols) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Unit Economics Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <GTMUnitEconomics
                            cac={totalCAC}
                            ltv={ltv}
                            paybackMonths={paybackMonths}
                        />
                    </div>

                    {/* Main Chart: Growth vs Spend */}
                    <Card className="h-[400px]">
                        <CardHeader>
                            <CardTitle>{t('dashboard.growth_tab.growth_projection_spend')}</CardTitle>
                            <CardDescription>
                                {t('dashboard.growth_tab.growth_projection_desc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={results} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" tickFormatter={(v) => `${v}. ${t('dashboard.growth_tab.ay')}`} />
                                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" unit={
                                        data.pricing.currency === 'TRY' ? ' ₺' :
                                            data.pricing.currency === 'USD' ? ' $' :
                                                data.pricing.currency === 'EUR' ? ' €' :
                                                    data.pricing.currency === 'GBP' ? ' £' : ' $'
                                    } tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                                    <Tooltip
                                        formatter={(value: any, name: any) => {
                                            if (name === t('dashboard.growth_tab.monthly_budget')) return format(value);
                                            return value;
                                        }}
                                        labelFormatter={(label) => `${label}. ${t('dashboard.growth_tab.ay')}`}
                                    />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="deals" name={t('dashboard.growth_tab.deals_count')} fill="#8884d8" radius={[4, 4, 0, 0]} />
                                    <Bar yAxisId="right" dataKey="marketingSpend" name={t('dashboard.growth_tab.monthly_budget')} fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Capacity Planning Alert/Info */}
                    <Alert className="bg-amber-50 border-amber-200">
                        <Info className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-800">{t('dashboard.growth_tab.auto_capacity_planning')}</AlertTitle>
                        <AlertDescription className="text-amber-700">
                            {t('dashboard.growth_tab.sdr_recommendation').replace('{count}', sdrCount.toString())}
                            {" "}{t('dashboard.growth_tab.sdr_included_in_unit').replace('{amount}', format(totalSdrCost))}
                        </AlertDescription>
                    </Alert>

                </div>
            </div>
        </div>
    );
}
