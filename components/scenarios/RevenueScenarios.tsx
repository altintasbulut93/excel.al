import React, { useState, useMemo } from 'react';
import { Layers, TrendingUp, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FinancialInput, RevenueItem } from '@/lib/engine/types';
import { useLanguage } from "@/lib/i18n-context";
import { useFormat } from "@/hooks/use-format";

interface RevenueScenariosProps {
    input: FinancialInput;
}

// Helper to project a single scenario
const projectScenario = (
    items: RevenueItem[],
    durationMonths: number,
    growthMultiplier: number,
    churnMultiplier: number
) => {
    // We strictly follow 12 months for this view as requested
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return months.map(month => {
        let totalRevenue = 0;
        let totalCount = 0;
        const products: { [key: string]: { count: number, revenue: number } } = {};

        items.forEach(item => {
            const effectiveGrowth = (item.monthlyGrowthRate || 0) * growthMultiplier;
            const effectiveChurn = (item.churnRate || 0) * churnMultiplier;
            const netGrowth = effectiveGrowth - effectiveChurn;

            const count = Math.round(item.initialCustomers * Math.pow(1 + netGrowth, month - 1));
            const revenue = count * item.price;

            products[item.name] = { count, revenue };
            totalRevenue += revenue;
            totalCount += count;
        });

        return {
            month,
            products,
            totalRevenue,
            totalCount
        };
    });
};

export function RevenueScenarios({ input }: RevenueScenariosProps) {
    const { t } = useLanguage();
    const { format } = useFormat();
    const [goodMultiplier, setGoodMultiplier] = useState(1.5);
    const [badMultiplier, setBadMultiplier] = useState(0.5);
    const [activeTab, setActiveTab] = useState("comparison");

    const revenueItems = input.revenueItems || [];

    // --- CALCULATIONS ---
    const scenarios = useMemo(() => {
        // Base (Orta)
        const medium = projectScenario(revenueItems, 12, 1.0, 1.0);

        // Good (İyi) -> Higher Growth, Same Churn 
        const good = projectScenario(revenueItems, 12, goodMultiplier, 0.8);

        // Bad (Kötü) -> Lower Growth, Higher Churn
        const bad = projectScenario(revenueItems, 12, badMultiplier, 1.2);

        return { good, medium, bad };
    }, [revenueItems, goodMultiplier, badMultiplier]);

    // Handle empty data
    if (revenueItems.length === 0) {
        return (
            <Card className="bg-slate-50 border-dashed">
                <CardContent className="p-8 text-center text-muted-foreground">
                    <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('revenue.no_items')}</p>
                </CardContent>
            </Card>
        );
    }

    // --- RENDER HELPERS ---

    // Scenario Explanation Generator
    const getExplanation = () => {
        const totalGood = scenarios.good.reduce((a, b) => a + b.totalRevenue, 0);
        const totalBad = scenarios.bad.reduce((a, b) => a + b.totalRevenue, 0);
        const totalMedium = scenarios.medium.reduce((a, b) => a + b.totalRevenue, 0);

        const ups = ((totalGood - totalMedium) / totalMedium * 100).toFixed(0);
        const downs = ((totalMedium - totalBad) / totalMedium * 100).toFixed(0);

        return (
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <p>
                    <strong className="text-emerald-600">{t('revenue.optimistic')}:</strong> {t('revenue.good_desc_1')} <strong>{goodMultiplier}x</strong> {t('revenue.good_desc_2')} <strong>%{ups}</strong> {t('revenue.increase_desc')}.
                </p>
                <p>
                    <strong className="text-blue-600">{t('revenue.base')}:</strong> {t('revenue.base_desc')}
                </p>
                <p>
                    <strong className="text-rose-600">{t('revenue.pessimistic')}:</strong> {t('revenue.bad_desc_1')} <strong>{badMultiplier}x</strong> {t('revenue.bad_desc_2')} <strong>%{downs}</strong> {t('revenue.risk_desc')}.
                </p>
            </div>
        );
    };

    /**
     * Reusable Detailed Table Component
     */
    const ScenarioDetailTable = ({ data, colorClass, title }: { data: any[], colorClass: string, title: string }) => (
        <div className="rounded-md border overflow-hidden">
            <div className={`p-3 font-bold text-center ${colorClass} bg-opacity-10 border-b`}>
                {title} {t('revenue.detailed_breakdown')}
            </div>
            <Table>
                <TableHeader>
                    <TableRow className={`${colorClass} bg-opacity-5`}>
                        <TableHead className="w-[80px]">{t('common.month')}</TableHead>
                        {revenueItems.map(item => (
                            <TableHead key={item.id} className="text-right min-w-[100px]">{item.name} ({t('revenue.unit')})</TableHead>
                        ))}
                        <TableHead className="text-right font-bold bg-slate-100/50">{t('revenue.total_count')}</TableHead>
                        <TableHead className="text-right font-bold bg-slate-100/50">{t('revenue.total_revenue')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row, i) => (
                        <TableRow key={i}>
                            <TableCell className="font-medium">{row.month}. {t('common.month')}</TableCell>
                            {revenueItems.map(item => (
                                <TableCell key={item.id} className="text-right text-slate-600">
                                    {row.products[item.name]?.count || 0}
                                </TableCell>
                            ))}
                            <TableCell className="text-right font-bold bg-slate-50">{row.totalCount}</TableCell>
                            <TableCell className="text-right font-bold bg-slate-50 text-slate-900 font-mono">
                                {format(row.totalRevenue)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <Card className="border-t-4 border-t-purple-600 shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="w-6 h-6 text-purple-600" />
                            {t('revenue.advanced_title')}
                        </CardTitle>
                        <CardDescription>
                            {t('revenue.advanced_desc')}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">{t('revenue.optimistic')}: {goodMultiplier}x</Badge>
                        <Badge variant="outline" className="text-rose-600 bg-rose-50 border-rose-200">{t('revenue.pessimistic')}: {badMultiplier}x</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Controls */}
                    <div className="lg:col-span-1 space-y-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border">
                        <h4 className="font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <TrendingUp className="w-4 h-4" /> {t('revenue.scenario_builder')}
                        </h4>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex justify-between">
                                    <span>{t('revenue.good_multiplier')}</span>
                                    <span>x{goodMultiplier}</span>
                                </label>
                                <Slider
                                    value={[goodMultiplier]}
                                    min={1.1}
                                    max={3.0}
                                    step={0.1}
                                    onValueChange={([v]) => setGoodMultiplier(v)}
                                    className="py-2"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-rose-700 dark:text-rose-400 flex justify-between">
                                    <span>{t('revenue.bad_multiplier')}</span>
                                    <span>x{badMultiplier}</span>
                                </label>
                                <Slider
                                    value={[badMultiplier]}
                                    min={0.1}
                                    max={0.9}
                                    step={0.1}
                                    onValueChange={([v]) => setBadMultiplier(v)}
                                    className="py-2"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <h4 className="font-semibold text-sm mb-2">{t('revenue.analysis_comment')}</h4>
                            {getExplanation()}
                        </div>
                    </div>

                    {/* Summary Comparison Chart/Table */}
                    <div className="lg:col-span-2">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                            {t('revenue.comparison_summary')}
                        </h4>

                        <div className="rounded-xl border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-100 dark:bg-slate-800">
                                    <TableRow>
                                        <TableHead className="w-[100px]">{t('common.month')}</TableHead>
                                        <TableHead className="text-center text-rose-700 dark:text-rose-400 font-bold bg-rose-50/50 dark:bg-rose-950/20 w-[20%]">{t('revenue.pessimistic')} (x{badMultiplier})</TableHead>
                                        <TableHead className="text-center text-blue-700 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/20 w-[20%]">{t('revenue.base')}</TableHead>
                                        <TableHead className="text-center text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/20 w-[20%]">{t('revenue.optimistic')} (x{goodMultiplier})</TableHead>
                                        <TableHead className="text-right">{t('revenue.potential_diff')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {scenarios.medium.map((m, i) => {
                                        const b = scenarios.bad[i];
                                        const g = scenarios.good[i];
                                        const diff = g.totalRevenue - b.totalRevenue;

                                        return (
                                            <TableRow key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                                                <TableCell className="font-medium text-xs text-slate-500">{m.month}. {t('common.month')}</TableCell>
                                                <TableCell className="text-center font-mono text-xs text-rose-600">
                                                    {format(b.totalRevenue)}
                                                </TableCell>
                                                <TableCell className="text-center font-mono text-xs font-bold text-blue-900 dark:text-blue-100 bg-blue-50/30 dark:bg-blue-900/10">
                                                    {format(m.totalRevenue)}
                                                </TableCell>
                                                <TableCell className="text-center font-mono text-xs text-emerald-600 font-medium">
                                                    {format(g.totalRevenue)}
                                                </TableCell>
                                                <TableCell className="text-right text-xs text-slate-400 font-mono">
                                                    +{format(diff)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {/* Annual Totals Row */}
                                    <TableRow className="bg-slate-900 hover:bg-slate-900 border-t-2 border-slate-300">
                                        <TableCell className="font-bold text-white">{t('common.total')} ({t('revenue.year')})</TableCell>
                                        <TableCell className="text-center font-bold text-rose-300 font-mono">
                                            {format(scenarios.bad.reduce((a, b) => a + b.totalRevenue, 0))}
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-blue-300 font-mono">
                                            {format(scenarios.medium.reduce((a, b) => a + b.totalRevenue, 0))}
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-emerald-300 font-mono">
                                            {format(scenarios.good.reduce((a, b) => a + b.totalRevenue, 0))}
                                        </TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {/* Specific Detailed Views */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="bad" className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-800">
                            {t('revenue.bad_details')}
                        </TabsTrigger>
                        <TabsTrigger value="comparison" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
                            {t('revenue.base_details')}
                        </TabsTrigger>
                        <TabsTrigger value="good" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800">
                            {t('revenue.good_details')}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="bad">
                        <ScenarioDetailTable data={scenarios.bad} colorClass="text-rose-700 bg-rose-50" title={t('revenue.pessimistic')} />
                    </TabsContent>

                    <TabsContent value="comparison">
                        <ScenarioDetailTable data={scenarios.medium} colorClass="text-blue-700 bg-blue-50" title={t('revenue.base')} />
                    </TabsContent>

                    <TabsContent value="good">
                        <ScenarioDetailTable data={scenarios.good} colorClass="text-emerald-700 bg-emerald-50" title={t('revenue.optimistic')} />
                    </TabsContent>
                </Tabs>

            </CardContent>
        </Card>
    );
}
