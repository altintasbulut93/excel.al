
"use client";

import { useFinancialStore } from "@/lib/store";
import { generateFinancialModel } from "@/lib/engine/financials";
import { cn } from "@/lib/utils";
import { useFormat } from "@/hooks/use-format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertCircle, Download, CheckCircle, TrendingUp, DollarSign, CloudUpload, Lock, LogOut, FileSpreadsheet, FileText, Edit, UserPlus, Mail, Share2, Briefcase, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { saveModelToSupabase } from "@/lib/db";
import { useState, useEffect } from "react";
import { UpgradeModal } from "@/components/UpgradeModal";
import { AuthModal } from "@/components/AuthModal";
import { ShareModelModal } from "@/components/modals/ShareModelModal";
import { supabase } from "@/lib/supabase";
import { DEFAULT_SCENARIOS } from "@/lib/engine/scenarios";
import { useLanguage } from "@/lib/i18n-context";

// NEW: Strategic Module Components
import { ParametersPanel } from "@/components/ParametersPanel";
import { UnitEconomicsDashboard } from "@/components/UnitEconomicsDashboard";
import { DeathValleyChart } from "@/components/DeathValleyChart";
import { ScenarioManager } from "@/components/ScenarioManager";
import { CostStructureChart } from "@/components/CostStructureChart";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { FinancialParameters } from "@/lib/engine/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimelineEditor } from "@/components/TimelineEditor";
import { MonthlyChecklist } from "@/components/MonthlyChecklist";

import { ExcelPreviewModal } from "@/components/ExcelPreviewModal";

import { RevenueScenarios } from "@/components/scenarios/RevenueScenarios";
import { GrowthTab } from "@/components/growth/GrowthTab";
import { DecisionCenter } from "@/components/aicfo/DecisionCenter";
import { VarianceAnalysis } from "@/components/dashboard/VarianceAnalysis"; // NEW IMPORT
import { AICoachPanel } from "@/components/aicfo/AICoachPanel"; // NEW: Antigravity AI Coach
import { BenchmarkRadar } from "@/components/dashboard/BenchmarkRadar"; // NEW: Benchmark Radar

export function Step4Dashboard() {
    const { data, setData, setStep, user, isAdmin, subscriptionTier } = useFinancialStore();
    const [isSaving, setIsSaving] = useState(false);
    const [savedModelId, setSavedModelId] = useState<string | null>(null);
    const [authOpen, setAuthOpen] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);


    // Pro features: Admin OR enterprise/pro tier
    const isPro = isAdmin || subscriptionTier === 'pro' || subscriptionTier === 'enterprise';

    const { language, t } = useLanguage();
    const { format } = useFormat();

    // Welcome Admin
    useEffect(() => {
        if (isAdmin) {
            console.log("Admin access granted.");
        }
    }, [isAdmin]);

    // Parameters state (with defaults)
    const [parameters, setParameters] = useState<FinancialParameters>(
        data.parameters || {
            usdRate: 34.50,
            eurRate: 37.20,
            gbpRate: 44.10,
            inflationRate: 0.40,
            salaryIncreaseRate: 0.25,
            taxRate: 0.25
        }
    );

    const [isRecalculating, setIsRecalculating] = useState(false);

    // Calculate financial model with current parameters
    const inputWithParams = {
        ...data,
        parameters,
        scenarios: DEFAULT_SCENARIOS, // Enable scenarios
        enableUnitEconomics: true,
        language: language || 'en'
    };

    const results = generateFinancialModel(inputWithParams);
    const summary = results.summary;
    const monthlyData = results.monthly;
    const redFlags = results.redFlags;

    // Handlers
    const handleEdit = () => setStep(0);

    const handleParametersChange = (newParams: FinancialParameters) => {
        setParameters(newParams);
        // Update store
        setData({ parameters: newParams });
    };

    const handleRecalculate = () => {
        setIsRecalculating(true);

        // Push local parameters to store and trigger a full recalculation
        // Also ensure pricing currency is synced
        setData({
            parameters: { ...parameters }
        });

        // Artificial delay for visual feedback that a "calculation" happened
        setTimeout(() => {
            setIsRecalculating(false);
        }, 500);
    };

    const handleSave = async (forceUser?: any) => {
        if (!user && !forceUser) {
            setAuthOpen(true);
            return;
        }

        setIsSaving(true);
        try {
            const savedModel = await saveModelToSupabase(inputWithParams, results, (forceUser || user)?.id);
            console.log("Supabase Response:", savedModel);

            if (savedModel && savedModel.id) {
                setSavedModelId(savedModel.id);
                alert(language === 'tr' ? `Model başarıyla Buluta kaydedildi! (ID: ${savedModel.id})` : "Model saved to Cloud successfully!");
            } else {
                console.error("Save succeeded but no ID returned:", savedModel);
                alert("Model kaydedildi fakat ID alınamadı. Lütfen tekrar deneyin.");
            }

        } catch (e: any) {
            if (e.name === 'AbortError') {
                console.warn('Save operation aborted');
                return;
            }
            console.error(e);
            alert(`Error: ${e.message}`);
        } finally {
            setIsSaving(false);
        }
    };




    // ... existing handlers ...



    const handleDownloadExcel = async () => {
        if (!isPro) {
            setShowUpgrade(true); // Excel is strictly Pro
            return;
        }

        try {
            const response = await fetch('/api/generate-excel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inputWithParams),
            });

            if (!response.ok) throw new Error("Download failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `financial-model-${data.businessName.replace(/\s+/g, '_') || 'draft'}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e: any) {
            console.error(e);
            alert("Excel download error.");
        }
    };

    // This function is now called by the PDFPreviewModal's download button



    const handleLogout = async () => {
        await supabase?.auth.signOut();
        setSavedModelId(null);
        window.location.reload();
    };

    // Chart data
    const chartData = monthlyData.slice(0, 12).map(m => ({
        month: `${m.month}. ${t('common.month')}`,
        revenue: m.revenue,
        expenses: m.totalExpenses,
        profit: m.netIncome,
        cash: m.cashFlow.endingBalance
    }));

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-20">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-block p-3 rounded-2xl bg-white shadow-xl mb-4">
                    {data.logoUrl ? (
                        <div className="w-32 h-32 relative mx-auto flex items-center justify-center overflow-hidden rounded-xl">
                            <img src={data.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                    ) : (
                        <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent px-4 py-2">
                            {data.businessName ? data.businessName.charAt(0).toUpperCase() : 'E'}
                        </div>
                    )}
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                    {data.businessName || t('common.app_name')}
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    {data.description || t('home.description')}
                </p>

            </div>


            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={handleEdit} variant="outline" size="lg">
                    <Edit className="mr-2 h-4 w-4" />
                    {t('dashboard.edit_model')}
                </Button>
                <Button onClick={() => handleSave()} disabled={isSaving} size="lg">
                    <CloudUpload className="mr-2 h-4 w-4" />
                    {isSaving ? t('common.processing') : t('dashboard.save_cloud')}
                </Button>

                <Button
                    onClick={() => {
                        if (isPro) {
                            setShareModalOpen(true);
                        } else {
                            setShowUpgrade(true);
                        }
                    }}
                    disabled={!savedModelId} // Only enabled if saved
                    variant={isPro ? "secondary" : "default"}
                    className={cn(
                        "font-semibold transition-all",
                        isPro
                            ? "bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200"
                            : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
                    )}
                    size="lg"
                >
                    {isPro ? (
                        <>
                            <Share2 className="mr-2 h-4 w-4" />
                            {t('share_modal.create_link')}
                        </>
                    ) : (
                        <>
                            <Lock className="mr-2 h-4 w-4" />
                            {t('share_modal.create_link')} (Pro)
                        </>
                    )}
                </Button>

                <Button
                    onClick={handleDownloadExcel}
                    disabled={isRecalculating}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                    size="lg"
                >
                    {isPro ? (
                        <>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            {t('dashboard.export_excel')}
                        </>
                    ) : (
                        <>
                            <Lock className="mr-2 h-4 w-4" />
                            Excel (Pro)
                        </>
                    )}
                </Button>

                {user ? (
                    <Button onClick={handleLogout} variant="ghost" size="lg">
                        <LogOut className="mr-2 h-4 w-4" />
                        {t('common.logout')} ({user.email})
                    </Button>
                ) : (
                    <Button onClick={() => setAuthOpen(true)} className="bg-slate-800 text-white hover:bg-slate-900" size="lg">
                        <UserPlus className="mr-2 h-4 w-4" />
                        {t('common.login')}
                    </Button>
                )}
            </div>

            {/* NEW: Parameters Panel */}
            <ParametersPanel
                parameters={parameters}
                onParametersChange={handleParametersChange}
                onRecalculate={handleRecalculate}
                isRecalculating={isRecalculating}
            />

            <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <TabsTrigger value="summary" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5">
                        {t('dashboard.overview')}
                    </TabsTrigger>
                    <TabsTrigger value="growth" className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all rounded-lg text-sm font-medium py-2.5">
                        <TrendingUp className="w-4 h-4" />
                        {t('dashboard.growth_tab.title')}
                    </TabsTrigger>
                    <TabsTrigger value="variance" className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all rounded-lg text-sm font-medium py-2.5">
                        <Activity className="w-4 h-4" />
                        {t('dashboard.variance.tab_title') || "Variance Analysis"}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">


                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <CardDescription className="text-xs font-bold text-emerald-600/80 uppercase tracking-wider">{t('dashboard.total_revenue')}</CardDescription>
                                <CardTitle className="text-2xl font-bold text-emerald-500">
                                    {format(summary.totalRevenue)}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <CardDescription className="text-xs font-bold text-indigo-600/80 uppercase tracking-wider">{t('dashboard.total_profit')}</CardDescription>
                                <CardTitle className="text-2xl font-bold text-indigo-500">
                                    {format(summary.totalProfit)}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <CardDescription className="text-xs font-bold text-purple-600/80 uppercase tracking-wider">{t('dashboard.breakeven')}</CardDescription>
                                <CardTitle className="text-2xl font-bold text-purple-600">
                                    {summary.breakevenMonth ? `${summary.breakevenMonth}. ${t('common.month')}` : "-"}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <CardDescription className="text-xs font-bold text-rose-600/80 uppercase tracking-wider">{t('dashboard.needed_capital')}</CardDescription>
                                <CardTitle className="text-2xl font-bold text-rose-500">
                                    {format(summary.neededCapital)}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Red Flags */}
                    {redFlags.length > 0 && (
                        <Card className="border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-300">
                                    <AlertCircle className="w-5 h-5" />
                                    {t('dashboard.red_flags')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {redFlags.map((flag, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-200">
                                            <span className="text-red-500">•</span>
                                            <span>{t(flag)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* NEW: Unit Economics Dashboard */}
                    {summary.unitEconomics && (
                        <UnitEconomicsDashboard unitEconomics={summary.unitEconomics} />
                    )}

                    {/* NEW: Death Valley Chart */}
                    <DeathValleyChart
                        monthly={monthlyData}
                        paybackPeriod={summary.paybackPeriod}
                    />

                    {/* Revenue & Profit Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('dashboard.monthly_revenue_profit')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                                        <Tooltip formatter={(value: any) => format(value)} />
                                        <Legend />
                                        <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} name={t('dashboard.revenue')} />
                                        <Line type="monotone" dataKey="profit" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} name={t('dashboard.profit')} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>


                    {/* Cash Flow Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('dashboard.cash_flow')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" />
                                        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                                        <Tooltip
                                            formatter={(value: any) => format(value)}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="cash" fill="#6366F1" radius={[4, 4, 0, 0]} name={t('dashboard.cash_balance')} />
                                    </BarChart>
                                </ResponsiveContainer>

                            </div>
                        </CardContent>
                    </Card>

                    {/* NEW: Cost Structure Chart */}
                    {summary.costStructure && (
                        <CostStructureChart costStructure={summary.costStructure} />
                    )}




                    {/* NEW: Analytics Intelligence Dashboard */}
                    <AnalyticsDashboard result={results} />

                    {/* NEW: Revenue Scenarios */}
                    <RevenueScenarios input={inputWithParams} />

                    {/* MOVED: Advanced Tools Section (Locked or Unlocked) */}
                    {!savedModelId ? (
                        <section className="relative z-10 mt-16 pt-10 border-t-2 border-slate-100 dark:border-slate-800 bg-gradient-to-b from-slate-50/80 to-slate-100/50 dark:from-slate-900/80 dark:to-slate-950/50 rounded-3xl p-8 shadow-xl backdrop-blur-sm">
                            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
                                        <Briefcase className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('dashboard.advanced_tools')}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            {t('dashboard.save_desc')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Card className="bg-white/80 dark:bg-slate-800/80 border-dashed border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                                <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-2">
                                        <Lock className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t('dashboard.save_to_unlock')}</h4>
                                    <Button size="lg" onClick={() => handleSave()} disabled={isSaving} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                                        {isSaving ? t('dashboard.saving') : t('dashboard.save_and_continue')}
                                    </Button>
                                </CardContent>
                            </Card>
                        </section>
                    ) : (
                        <div className="space-y-10">
                            {/* SECTION 1: Event Management (Timeline) */}
                            <section className="relative z-10 p-8 rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800">
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('dashboard.event_management')}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.event_desc')}</p>
                                        </div>
                                    </div>
                                </div>

                                {isPro ? (
                                    <TimelineEditor modelId={savedModelId} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                        <Lock className="w-12 h-12 text-slate-300 mb-4" />
                                        <h4 className="text-lg font-semibold mb-2">{t('dashboard.timeline_pro_title') || "Timeline Events (Pro)"}</h4>
                                        <Button onClick={() => setShowUpgrade(true)} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200">
                                            {t('common.upgrade_to_pro')}
                                        </Button>
                                    </div>
                                )}
                            </section>

                            {/* SECTION 2: Monthly Checklist */}
                            <section className="relative z-10 p-8 rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('dashboard.checklist.title')}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.why_important')}</p>
                                    </div>
                                </div>
                                <MonthlyChecklist modelId={savedModelId} />
                            </section>

                            {/* SECTION 3: AI CFO Decision Center */}
                            <section className="relative z-10 p-8 rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800">
                                <DecisionCenter />
                            </section>
                        </div>
                    )}

                </TabsContent>

                <TabsContent value="growth" className="space-y-6">
                    <GrowthTab />
                </TabsContent>

                {/* VARIANCE ANALYSIS TAB */}
                <TabsContent value="variance" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Antigravity AI Coach Overlay */}
                    <AICoachPanel results={results} />

                    {savedModelId ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <VarianceAnalysis
                                    modelId={savedModelId}
                                    forecast={monthlyData}
                                />
                            </div>
                            <div className="lg:col-span-1">
                                <BenchmarkRadar results={results} sector={data.sector} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <Lock className="w-12 h-12 text-slate-300 mb-4" />
                            <h4 className="text-lg font-semibold mb-2">{t('dashboard.save_to_unlock')}</h4>
                            <p className="text-sm text-muted-foreground mb-4">{t('dashboard.variance.unlock_desc') || "Save your model to start tracking actuals against forecast."}</p>
                            <Button onClick={() => handleSave()} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                                {t('dashboard.save_and_continue')}
                            </Button>
                        </div>
                    )}
                </TabsContent>

            </Tabs>




            {/* Modals */}
            <AuthModal
                open={authOpen}
                onClose={() => setAuthOpen(false)}
                onSuccess={(user) => {
                    setAuthOpen(false);
                    handleSave(user);
                }}
            />
            <UpgradeModal
                open={showUpgrade}
                onClose={() => setShowUpgrade(false)}
            />

            {/* NEW: Excel Preview Modal for Non-Pro Users */}
            <ExcelPreviewModal
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
                onUpgrade={() => {
                    setPreviewOpen(false);
                    setShowUpgrade(true);
                }}
                monthlyData={monthlyData}
            />



            {/* NEW: PDF Preview Modal */}




            {/* Share Modal */}
            <ShareModelModal
                open={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                modelId={savedModelId}
            />
        </div >
    );
}
