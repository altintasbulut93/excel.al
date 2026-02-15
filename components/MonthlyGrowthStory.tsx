"use client";

import { useFinancialStore } from "@/lib/store";
import { generateFinancialModel } from "@/lib/engine/financials";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useFormat } from "@/hooks/use-format";
import { useState, useMemo, useEffect } from "react";
import { CheckCircle, AlertTriangle, ArrowUpRight, ArrowDownRight, Share2, Copy, Download, Building2, Calendar, FileText, Linkedin, MessageSquare, Save, RefreshCw } from "lucide-react";
import { generateMonthlyNarrative, NarrativeTone } from "@/lib/ai/narrativeGenerator";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from "@/lib/i18n-context";
import { Textarea } from "@/components/ui/textarea";

export function MonthlyGrowthStory() {
    const { data, setData } = useFinancialStore();
    const { t } = useLanguage();
    const { format } = useFormat();
    const [selectedMonth, setSelectedMonth] = useState<string>("1");
    const [narrativeTone, setNarrativeTone] = useState<NarrativeTone>('investor');
    const [story, setStory] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Generate model to get results
    const results = useMemo(() => generateFinancialModel(data), [data]);
    const monthlyData = results.monthly;

    // Get selected month data
    const currentMonthIndex = parseInt(selectedMonth) - 1;
    const currentMonth = monthlyData[currentMonthIndex];
    const prevMonth = currentMonthIndex > 0 ? monthlyData[currentMonthIndex - 1] : undefined;
    const healthScore = results.healthScore;

    const savedStory = data.monthlyHighlights?.[selectedMonth];

    // Load or Generate Story
    useEffect(() => {
        if (!currentMonth) return;

        // Check if we have a saved highlight for this month
        // We use the selectedMonth (string "1", "2") as key
        const savedStory = data.monthlyHighlights?.[selectedMonth];

        if (savedStory) {
            setStory(savedStory);
        } else {
            // Generate fresh
            const generated = generateMonthlyNarrative(currentMonth, prevMonth, healthScore, narrativeTone, data.businessName, t, format);
            setStory(generated);
        }
    }, [selectedMonth, currentMonth, prevMonth, healthScore, narrativeTone, data.monthlyHighlights, data.businessName, t, format]);

    const handleRegenerate = () => {
        if (!currentMonth) return;
        const generated = generateMonthlyNarrative(currentMonth, prevMonth, healthScore, narrativeTone, data.businessName, t, format);
        setStory(generated);
    };

    const handleSave = () => {
        setIsSaving(true);
        try {
            const newHighlights = { ...data.monthlyHighlights, [selectedMonth]: story };
            setData({ monthlyHighlights: newHighlights });
            // Optional: Show toast or alert
            // alert(t('dashboard.saved')); 
        } finally {
            setTimeout(() => setIsSaving(false), 500);
        }
    };

    if (!currentMonth) return null;

    // Calculations for UI
    const revenueGrowth = prevMonth && prevMonth.revenue > 0
        ? ((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100
        : 0;

    const burnRate = currentMonth.metrics.burnRate;

    // Copy Handler
    const handleCopy = () => {
        navigator.clipboard.writeText(story);
        alert(t('dashboard.monthly_story.text_copied'));
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg">
                    <Building2 className="mr-2 h-4 w-4" />
                    {t('dashboard.monthly_story.title')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                🚀 {t('dashboard.monthly_story.title')}
                                <Badge variant="outline" className="ml-2 border-purple-500 text-purple-600">{t('dashboard.monthly_story.premium')}</Badge>
                            </DialogTitle>
                            <DialogDescription>
                                {t('dashboard.monthly_story.desc')}
                            </DialogDescription>
                        </div>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t('dashboard.monthly_story.select_month')} />
                            </SelectTrigger>
                            <SelectContent>
                                {monthlyData.slice(0, 12).map(m => (
                                    <SelectItem key={m.month} value={m.month.toString()}>
                                        {m.month}. {t('dashboard.monthly_story.ay')} ({format(m.revenue)})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* 1. HEALTH SCORE & KEY METRICS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Health Score Card */}
                        <Card className={`border-l-4 ${getGradeColor(healthScore?.grade)} bg-muted/20`}>
                            <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('dashboard.monthly_story.startup_health')}</span>
                                <div className="text-5xl font-extrabold mt-2 mb-1">{healthScore?.score}</div>
                                <Badge className={`text-lg px-3 py-1 ${getGradeBadgeColor(healthScore?.grade)}`}>
                                    {t('dashboard.monthly_story.grade')}: {healthScore?.grade}
                                </Badge>
                            </CardContent>
                        </Card>

                        {/* Revenue Growth Card */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.monthly_story.monthly_growth_mom')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold flex items-center">
                                    {revenueGrowth.toFixed(1)}%
                                    {revenueGrowth >= 0 ?
                                        <ArrowUpRight className="ml-2 text-green-500 w-6 h-6" /> :
                                        <ArrowDownRight className="ml-2 text-red-500 w-6 h-6" />
                                    }
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{t('dashboard.monthly_story.change_vs_prev')}</p>
                            </CardContent>
                        </Card>

                        {/* Runway / Burn Card */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.monthly_story.runway_months')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold flex items-center text-orange-600">
                                    {currentMonth.metrics.runway.toFixed(1)} <span className="text-lg ml-1 font-normal text-muted-foreground">{t('dashboard.monthly_story.ay')}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Burn Rate: {format(burnRate)} / {t('dashboard.monthly_story.ay').toLowerCase()}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 2. FINANCIAL SUMMARY TABLE */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('dashboard.monthly_story.financial_summary')} - {currentMonth.month}. {t('dashboard.monthly_story.ay')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <div className="text-sm text-muted-foreground">{t('dashboard.revenue')}</div>
                                    <div className="text-xl font-bold mt-1 text-blue-600">{format(currentMonth.revenue)}</div>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <div className="text-sm text-muted-foreground">{t('dashboard.monthly_story.gross_margin')}</div>
                                    <div className="text-xl font-bold mt-1 text-green-600">{(currentMonth.metrics.grossMargin * 100).toFixed(1)}%</div>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <div className="text-sm text-muted-foreground">{t('dashboard.monthly_story.net_profit')}</div>
                                    <div className={`text-xl font-bold mt-1 ${currentMonth.netIncome >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {format(currentMonth.netIncome)}
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <div className="text-sm text-muted-foreground">{t('dashboard.monthly_story.cash_balance')}</div>
                                    <div className="text-xl font-bold mt-1 text-purple-600">{format(currentMonth.cashFlow.endingBalance)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. AI GROWTH NARRATIVE GENERATOR */}
                    <Card className="border-indigo-200 shadow-md">
                        <CardHeader className="bg-indigo-50/50 dark:bg-indigo-950/20 pb-3">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                                        <MessageSquare className="w-5 h-5" />
                                        {t('dashboard.monthly_story.ai_generator')}
                                    </CardTitle>
                                    <CardDescription>{t('dashboard.monthly_story.ai_generator_desc')}</CardDescription>
                                </div>
                                <Tabs value={narrativeTone} onValueChange={(v) => setNarrativeTone(v as NarrativeTone)} className="w-auto">
                                    <TabsList>
                                        <TabsTrigger value="investor" className="flex gap-1"><FileText className="w-3 h-3" /> Investor</TabsTrigger>
                                        <TabsTrigger value="linkedin" className="flex gap-1"><Linkedin className="w-3 h-3" /> LinkedIn</TabsTrigger>
                                        <TabsTrigger value="internal" className="flex gap-1"><Building2 className="w-3 h-3" /> Internal</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="relative">
                                <Textarea
                                    value={story}
                                    onChange={(e) => setStory(e.target.value)}
                                    className="min-h-[200px] font-mono text-sm leading-relaxed p-4 bg-muted/50 resize-y"
                                    placeholder={t('dashboard.monthly_story.placeholder') || "Write your monthly story here..."}
                                />
                                <div className="absolute top-2 right-2 flex gap-1 opacity-100">
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCopy} title={t('dashboard.monthly_story.copy')}>
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs text-muted-foreground italic">
                                    {savedStory ? t('dashboard.monthly_story.last_saved') : t('dashboard.monthly_story.unsaved')}
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleRegenerate} title="Regenerate with AI">
                                        <RefreshCw className="w-3.5 h-3.5 mr-2" />
                                        {t('dashboard.monthly_story.regenerate')}
                                    </Button>
                                    <Button onClick={handleSave} disabled={isSaving} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                        <Save className="w-3.5 h-3.5 mr-2" />
                                        {isSaving ? t('common.saving') : t('common.save')}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 4. HEALTH CHECK DETAILS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">{t('dashboard.monthly_story.health_details')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <HealthItem label={t('dashboard.monthly_story.profitability')} score={healthScore?.details.profitability ?? 0} max={20} />
                                    <HealthItem label={t('dashboard.monthly_story.runway_months')} score={healthScore?.details.runway ?? 0} max={20} />
                                    <HealthItem label={t('dashboard.monthly_story.growth_rate')} score={healthScore?.details.growth ?? 0} max={20} />
                                    <HealthItem label={t('dashboard.monthly_story.unit_economics_ltvcac')} score={healthScore?.details.unitEconomics ?? 0} max={20} />
                                    <HealthItem label={t('dashboard.monthly_story.churn_rate_label')} score={healthScore?.details.churn ?? 0} max={20} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">{t('dashboard.monthly_story.improvement_tips')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {healthScore?.feedback.map((fb: string, i: number) => (
                                        <li key={i} className="text-sm flex items-start gap-2">
                                            <span>{t(fb)}</span>
                                        </li>
                                    ))}
                                    {healthScore?.feedback.length === 0 && (
                                        <li className="text-sm text-muted-foreground flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            {t('dashboard.monthly_story.great_job')}
                                        </li>
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Helpers
function HealthItem({ label, score, max }: { label: string, score: number, max: number }) {
    const percentage = (score / max) * 100;
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span>{label}</span>
                <span className="font-medium text-muted-foreground">{score}/{max}</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${getScoreColor(percentage)}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

function getGradeColor(grade: string | undefined) {
    if (!grade) return 'border-l-gray-300';
    if (grade.startsWith('A')) return 'border-l-green-500';
    if (grade === 'B') return 'border-l-blue-500';
    if (grade === 'C') return 'border-l-yellow-500';
    return 'border-l-red-500';
}

function getGradeBadgeColor(grade: string | undefined) {
    if (!grade) return 'bg-gray-100 text-gray-800';
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800 border-green-200';
    if (grade === 'B') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (grade === 'C') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
}

function getScoreColor(percentage: number) {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
}
