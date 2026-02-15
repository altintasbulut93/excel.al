"use client";

import { useState, useMemo } from "react";
import { useFinancialStore } from "@/lib/store";
import { generateFinancialModel } from "@/lib/engine/financials";
import { analyzeFinancials, DecisionAnalysis } from "@/lib/engine/analysis";
import { FinancialInput } from "@/lib/engine/types";
import { useLanguage } from "@/lib/i18n-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BrainCircuit, Play, RotateCcw, TrendingUp, AlertTriangle, CheckCircle2, Lock, LayoutDashboard, LineChart } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ScrollArea } from "@/components/ui/scroll-area";
import { UpgradeModal } from "@/components/UpgradeModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RunwayChart } from "./RunwayChart";
import { RiskScoreCard } from "./RiskScoreCard";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface SimulationParams {
    priceMultiplier: number;
    marketingMultiplier: number;
    churnMultiplier: number;
    hiringCount: number;
}

const DEFAULT_PARAMS: SimulationParams = {
    priceMultiplier: 1.0,
    marketingMultiplier: 1.0,
    churnMultiplier: 1.0,
    hiringCount: 0
};

export function DecisionCenter() {
    const { data: baseData, subscriptionTier, isAdmin } = useFinancialStore();
    const { t, language } = useLanguage();
    const [open, setOpen] = useState(false);
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [mode, setMode] = useState<'dashboard' | 'lab'>('lab');

    const isPro = isAdmin || subscriptionTier === 'pro' || subscriptionTier === 'enterprise';

    // Helper functions (defined safely inside component to access hooks/store)
    const formatMoney = (val: number) => {
        return new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
            style: 'currency',
            currency: baseData.pricing?.currency || 'USD',
            maximumFractionDigits: 0
        }).format(val);
    };

    const getDiffPercent = (base: number, sim: number) => {
        const diff = sim - base;
        if (base === 0) return 0;
        return (diff / Math.abs(base)) * 100;
    };

    const renderDiff = (base: number, sim: number, inverse = false) => {
        const diff = sim - base;
        const percent = getDiffPercent(base, sim);
        if (Math.abs(percent) < 0.1) return <span className="text-slate-400">-</span>;

        const isPositiveGood = !inverse;
        const isGood = isPositiveGood ? diff > 0 : diff < 0;
        const color = isGood ? "text-emerald-600" : "text-rose-600";

        return (
            <div className={`flex items-center gap-1 text-xs font-bold ${color}`}>
                {diff > 0 ? "+" : ""}{percent.toFixed(1)}%
            </div>
        );
    };

    const baseResult = useMemo(() => {
        return generateFinancialModel({ ...baseData });
    }, [baseData]);

    const simulatedResult = useMemo(() => {
        const simInput: FinancialInput = JSON.parse(JSON.stringify(baseData));

        if (simInput.revenueItems) {
            simInput.revenueItems.forEach(item => {
                item.price = item.price * params.priceMultiplier;
            });
        }
        if (simInput.pricing) {
            simInput.pricing.amount = simInput.pricing.amount * params.priceMultiplier;
        }

        if (simInput.marketing.type === 'fixed') {
            simInput.marketing.value = simInput.marketing.value * params.marketingMultiplier;
        } else {
            simInput.marketing.value = Math.min(simInput.marketing.value * params.marketingMultiplier, 1.0);
        }

        if (simInput.growth.churnRate) {
            simInput.growth.churnRate = Math.min(simInput.growth.churnRate * params.churnMultiplier, 1.0);
        }

        if (params.hiringCount > 0) {
            simInput.team.push({
                id: 'sim-hire',
                role: 'New Hires (Sim)',
                salary: 2000,
                count: params.hiringCount,
                isNetSalary: true
            });
        }

        return generateFinancialModel(simInput);
    }, [baseData, params]);

    const analysis = useMemo(() => {
        return analyzeFinancials(simulatedResult);
    }, [simulatedResult]);

    const chartData = useMemo(() => {
        return baseResult.monthly.slice(0, 12).map((m, i) => {
            const sim = simulatedResult.monthly[i];
            return {
                name: `${m.month}`,
                Base: m.cashFlow.endingBalance,
                Simulated: sim.cashFlow.endingBalance,
                BaseProfit: m.netIncome,
                SimProfit: sim.netIncome
            };
        });
    }, [baseResult, simulatedResult]);

    // Strategic Presets
    const applyStrategy = (strategy: 'conservative' | 'balanced' | 'aggressive') => {
        switch (strategy) {
            case 'conservative':
                setParams({ priceMultiplier: 1.05, marketingMultiplier: 0.8, churnMultiplier: 0.9, hiringCount: 0 });
                break;
            case 'balanced':
                setParams({ priceMultiplier: 1.0, marketingMultiplier: 1.2, churnMultiplier: 1.0, hiringCount: 1 });
                break;
            case 'aggressive':
                setParams({ priceMultiplier: 0.9, marketingMultiplier: 1.5, churnMultiplier: 1.1, hiringCount: 3 });
                break;
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-4 px-4 bg-slate-50 hover:bg-slate-100 border-none shadow-sm dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                    <div className="flex items-start gap-4 text-left">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <BrainCircuit className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                AI CEO Assistant
                                {isPro && <Badge variant="secondary" className="text-[10px] bg-indigo-100 text-indigo-700">PRO LAB</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                {t('aicfo.description')}
                            </p>
                        </div>
                    </div>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[100vw] sm:max-w-[100vw] h-[100vh] p-0 border-none" side="right">
                <div className="h-full flex flex-col overflow-hidden">
                    <SheetHeader className="p-6 flex-shrink-0 flex flex-row items-center justify-between border-b bg-white dark:bg-slate-950">
                        <div>
                            <SheetTitle className="text-2xl flex items-center gap-2">
                                <BrainCircuit className="w-6 h-6 text-indigo-600" />
                                AI CEO Decision Lab
                            </SheetTitle>
                            <SheetDescription>
                                Advanced financial simulation & risk analysis engine.
                            </SheetDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`cursor-pointer ${mode === 'dashboard' ? 'bg-slate-100' : ''}`} onClick={() => setMode('dashboard')}>
                                <LayoutDashboard className="w-3 h-3 mr-1" /> Dashboard
                            </Badge>
                            <Badge variant="outline" className={`cursor-pointer ${mode === 'lab' ? 'bg-indigo-50 border-indigo-200' : ''}`} onClick={() => setMode('lab')}>
                                <LineChart className="w-3 h-3 mr-1" /> Decision Lab
                            </Badge>
                        </div>
                    </SheetHeader>

                    <ScrollArea className="flex-1 p-6 bg-slate-50/50 dark:bg-slate-900/50">
                        {!isPro ? (
                            <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-6">
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
                                    <Lock className="w-12 h-12 text-indigo-400" />
                                </div>
                                <div className="max-w-md space-y-2">
                                    <h3 className="text-xl font-bold">Unlock Decision Lab</h3>
                                    <p className="text-muted-foreground">
                                        Get access to advanced risk analysis, runway projections, and AI-powered strategy simulation.
                                    </p>
                                </div>
                                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600" onClick={() => setShowUpgrade(true)}>
                                    Upgrade to PRO
                                </Button>
                                <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
                            </div>
                        ) : (
                            <div className="space-y-6 max-w-[1600px] mx-auto">

                                {/* CONTROLS - VISIBLE IN BOTH MODES BUT DIFFERENT LAYOUT? NO, LET'S REUSE */}
                                <div className="grid grid-cols-12 gap-6">

                                    {/* LEFT: CONTROLS */}
                                    <div className="col-span-12 lg:col-span-3 space-y-4">

                                        {mode === 'lab' && (
                                            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4">
                                                <Button variant="ghost" className="text-xs px-1" onClick={() => applyStrategy('conservative')}>🛡️ Defensive</Button>
                                                <Button variant="ghost" className="text-xs px-1" onClick={() => applyStrategy('balanced')}>⚖️ Balanced</Button>
                                                <Button variant="ghost" className="text-xs px-1" onClick={() => applyStrategy('aggressive')}>🚀 Aggressive</Button>
                                            </div>
                                        )}

                                        <Card className="border-slate-200 dark:border-slate-800 sticky top-0">
                                            <CardHeader className="pb-2 pt-4 px-4">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-sm font-bold flex gap-2 items-center">
                                                        <Play className="w-4 h-4 text-indigo-600" /> Variables
                                                    </CardTitle>
                                                    <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setParams(DEFAULT_PARAMS)}>
                                                        <RotateCcw className="w-3 h-3 mr-1" /> Reset
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-6 pt-2 px-4 pb-6">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <Label className="text-xs font-semibold flex items-center gap-2">
                                                                Price Elasticity
                                                                <Badge variant="outline" className="text-[10px]">{Math.round((params.priceMultiplier - 1) * 100)}%</Badge>
                                                            </Label>
                                                        </div>
                                                        <Slider
                                                            value={[params.priceMultiplier]}
                                                            min={0.5} max={2.0} step={0.05}
                                                            onValueChange={([val]) => setParams(p => ({ ...p, priceMultiplier: val }))}
                                                            className="py-2"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <Label className="text-xs font-semibold flex items-center gap-2">
                                                                Marketing Boost
                                                                <Badge variant="outline" className="text-[10px]">{Math.round((params.marketingMultiplier - 1) * 100)}%</Badge>
                                                            </Label>
                                                        </div>
                                                        <Slider
                                                            value={[params.marketingMultiplier]}
                                                            min={0.5} max={3.0} step={0.1}
                                                            onValueChange={([val]) => setParams(p => ({ ...p, marketingMultiplier: val }))}
                                                            className="py-2"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <Label className="text-xs font-semibold flex items-center gap-2">
                                                                Churn Impact
                                                                <Badge variant="outline" className="text-[10px]">{Math.round((params.churnMultiplier - 1) * 100)}%</Badge>
                                                            </Label>
                                                        </div>
                                                        <Slider
                                                            value={[params.churnMultiplier]}
                                                            min={0.5} max={2.0} step={0.05}
                                                            onValueChange={([val]) => setParams(p => ({ ...p, churnMultiplier: val }))}
                                                            className="py-2"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <Label className="text-xs font-semibold flex items-center gap-2">
                                                                Strategic Hires
                                                                <Badge variant="outline" className="text-[10px]">+{params.hiringCount}</Badge>
                                                            </Label>
                                                        </div>
                                                        <Slider
                                                            value={[params.hiringCount]}
                                                            min={0} max={10} step={1}
                                                            onValueChange={([val]) => setParams(p => ({ ...p, hiringCount: val }))}
                                                            className="py-2"
                                                        />
                                                    </div>
                                                </div>

                                                {/* IMPACT SUMMARY (Small) - Only in Dashboard mode or always? */}
                                                {mode === 'dashboard' && (
                                                    <div className="pt-4 border-t space-y-2">
                                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.aicfo.ai_analysis')}</h5>
                                                        {simulatedResult.monthly[11].metrics.runway < 6 ? (
                                                            <div className="p-2 bg-red-50 border border-red-100 rounded text-xs text-red-800 flex gap-2 items-center">
                                                                <AlertTriangle className="w-3 h-3 shrink-0" /> Critical Runway
                                                            </div>
                                                        ) : (
                                                            <div className="p-2 bg-emerald-50 border border-emerald-100 rounded text-xs text-emerald-800 flex gap-2 items-center">
                                                                <CheckCircle2 className="w-3 h-3 shrink-0" /> Healthy Runway
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* RIGHT: CONTENT AREA */}
                                    <div className="col-span-12 lg:col-span-9 space-y-6">

                                        {mode === 'lab' ? (
                                            /* LAB MODE CONTENT */
                                            <div className="space-y-6 animate-in fade-in duration-300">
                                                {/* KPIS & RISK */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <RiskScoreCard score={analysis.riskScore.total} metrics={analysis.riskScore} />
                                                    <div className="space-y-4">
                                                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-lg">
                                                            <h4 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2 mb-2 text-sm">
                                                                <BrainCircuit className="w-4 h-4" /> AI Decision Summary
                                                            </h4>
                                                            <p className="text-sm text-blue-800 dark:text-blue-400">
                                                                Based on these settings, your runway is projected to be <strong>{analysis.runwayMonths >= 18 ? "18+" : analysis.runwayMonths} months</strong>.
                                                                The risk score is <strong>{analysis.riskScore.total}/100</strong>.
                                                                {analysis.burnRate.trend === 'worsening' ? "Caution: Burn rate is increasing." : "Burn rate is stable."}
                                                                {analysis.breakevenPoint ? ` Break-even is expected in Month ${analysis.breakevenPoint}.` : " Break-even point not reached within 12 months."}
                                                            </p>
                                                        </div>
                                                        <RunwayChart data={simulatedResult.monthly} runwayMonths={analysis.runwayMonths} />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* DASHBOARD MODE CONTENT (Legacy Table & Chart) */
                                            <div className="space-y-6 animate-in fade-in duration-300">
                                                {/* Chart */}
                                                <Card className="shadow-sm border-0">
                                                    <CardContent className="p-6">
                                                        <div className="h-64">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                                    <defs>
                                                                        <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                                                                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                                                                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                                                        </linearGradient>
                                                                        <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                                        </linearGradient>
                                                                    </defs>
                                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                                                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(value: any) => formatMoney(value)} />
                                                                    <Area type="monotone" dataKey="Base" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} fill="url(#colorBase)" />
                                                                    <Area type="monotone" dataKey="Simulated" stroke="#6366f1" strokeWidth={3} fill="url(#colorSim)" />
                                                                </AreaChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Comparison Table */}
                                                <Card className="shadow-lg border-0 overflow-hidden">
                                                    <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                                                        <h3 className="font-bold text-slate-700">{t('dashboard.aicfo.comparison_table')}</h3>
                                                        <div className="flex gap-4 text-xs">
                                                            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-slate-400 opacity-50"></div> {t('dashboard.aicfo.base_model')}</div>
                                                            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-indigo-500"></div> {t('dashboard.aicfo.simulation_label')}</div>
                                                        </div>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                                                    <TableHead className="w-[100px]">{t('dashboard.agreement.ay', 'Month')}</TableHead>
                                                                    <TableHead className="text-right">{t('dashboard.aicfo.revenue_sim')}</TableHead>
                                                                    <TableHead className="text-right text-xs text-muted-foreground">{t('dashboard.aicfo.vs_base')}</TableHead>
                                                                    <TableHead className="text-right border-l">{t('dashboard.aicfo.profit_sim')}</TableHead>
                                                                    <TableHead className="text-right text-xs text-muted-foreground">{t('dashboard.aicfo.vs_base')}</TableHead>
                                                                    <TableHead className="text-right border-l">{t('dashboard.aicfo.cash_sim')}</TableHead>
                                                                    <TableHead className="text-right text-xs text-muted-foreground">{t('dashboard.aicfo.vs_base')}</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {simulatedResult.monthly.slice(0, 12).map((simMonth, i) => {
                                                                    const baseMonth = baseResult.monthly[i];
                                                                    return (
                                                                        <TableRow key={i} className="hover:bg-indigo-50/30 transition-colors">
                                                                            <TableCell className="font-medium">{simMonth.month}. Month</TableCell>
                                                                            <TableCell className="text-right font-mono">{formatMoney(simMonth.revenue)}</TableCell>
                                                                            <TableCell className="text-right"><div className="flex justify-end">{renderDiff(baseMonth.revenue, simMonth.revenue)}</div></TableCell>
                                                                            <TableCell className="text-right font-mono border-l">{formatMoney(simMonth.netIncome)}</TableCell>
                                                                            <TableCell className="text-right"><div className="flex justify-end">{renderDiff(baseMonth.netIncome, simMonth.netIncome)}</div></TableCell>
                                                                            <TableCell className="text-right font-mono font-bold text-slate-700 border-l">{formatMoney(simMonth.cashFlow.endingBalance)}</TableCell>
                                                                            <TableCell className="text-right"><div className="flex justify-end">{renderDiff(baseMonth.cashFlow.endingBalance, simMonth.cashFlow.endingBalance)}</div></TableCell>
                                                                        </TableRow>
                                                                    );
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </Card>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        )}
                    </ScrollArea>
                </div>
            </SheetContent>
            <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
        </Sheet>
    );
}
