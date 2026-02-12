
"use client";

import { useFinancialStore } from "@/lib/store";
import { generateFinancialModel } from "@/lib/engine/financials";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertCircle, Download, CheckCircle, TrendingUp, DollarSign, CloudUpload, Lock, LogOut, FileSpreadsheet, FileText, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { saveModelToSupabase } from "@/lib/db";
import { useState } from "react";
import { UpgradeModal } from "@/components/UpgradeModal";
import { AuthModal } from "@/components/AuthModal";
import { supabase } from "@/lib/supabase";
import { DEFAULT_SCENARIOS } from "@/lib/engine/scenarios";

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
import { GrowthReport } from "@/components/GrowthReport";

export function Step4Dashboard() {
    const { data, setData, setStep, user, isAdmin, subscriptionTier } = useFinancialStore();
    const [isSaving, setIsSaving] = useState(false);
    const [savedModelId, setSavedModelId] = useState<string | null>(null);
    const [authOpen, setAuthOpen] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);

    // Pro features: Admin OR enterprise/pro tier
    const isPro = isAdmin || subscriptionTier === 'pro' || subscriptionTier === 'enterprise';

    // Parameters state (with defaults)
    const [parameters, setParameters] = useState<FinancialParameters>(
        data.parameters || {
            usdRate: 34.50,
            eurRate: 37.20,
            inflationRate: 0.40,
            salaryIncreaseRate: 0.25,
            taxRate: 0.25
        }
    );

    // Calculate financial model with current parameters
    const inputWithParams = {
        ...data,
        parameters,
        scenarios: DEFAULT_SCENARIOS, // Enable scenarios
        enableUnitEconomics: true
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
        // Force re-render by updating data
        setData({ parameters });
    };

    const handleSave = async (forceUser?: any) => {
        if (!user && !forceUser) {
            setAuthOpen(true);
            return;
        }

        setIsSaving(true);
        try {
            const savedModel = await saveModelToSupabase(inputWithParams, results, (forceUser || user)?.id);
            if (savedModel) setSavedModelId(savedModel.id);
            alert("Model başarıyla Buluta kaydedildi! 🚀");
        } catch (e: any) {
            console.error(e);
            alert(`Hata: ${e.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownloadExcel = async () => {
        if (!isPro) {
            setShowUpgrade(true);
            return;
        }

        try {
            const response = await fetch('/api/generate-excel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inputWithParams),
            });

            if (!response.ok) throw new Error("İndirme başarısız");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `finansal-model-${data.businessName.replace(/\s+/g, '_') || 'taslak'}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e: any) {
            console.error(e);
            alert("Excel indirme hatası.");
        }
    };

    const handleDownloadPDF = async () => {
        if (!isPro) {
            setShowUpgrade(true);
            return;
        }

        try {
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inputWithParams),
            });

            if (!response.ok) throw new Error("PDF indirme başarısız");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `finansal-model-${data.businessName.replace(/\s+/g, '_') || 'taslak'}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e: any) {
            console.error(e);
            alert("PDF indirme hatası.");
        }
    };

    const handleLogout = async () => {
        await supabase?.auth.signOut();
        window.location.reload();
    };

    // Chart data
    const chartData = monthlyData.slice(0, 12).map(m => ({
        month: `${m.month}. Ay`,
        revenue: m.revenue,
        expenses: m.totalExpenses,
        profit: m.netIncome,
        cash: m.cashFlow.endingBalance
    }));

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-block p-3 rounded-2xl bg-white shadow-xl mb-4">
                    <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        excel.al
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {data.businessName || "Finansal Model"} - Dashboard
                </h1>
                <p className="text-muted-foreground">
                    Detaylı finansal analiz ve projeksiyonlar
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={handleEdit} variant="outline" size="lg">
                    <Edit className="mr-2 h-4 w-4" />
                    Düzenle
                </Button>
                <Button onClick={() => handleSave()} disabled={isSaving} size="lg">
                    <CloudUpload className="mr-2 h-4 w-4" />
                    {isSaving ? "Kaydediliyor..." : "Buluta Kaydet"}
                </Button>
                <Button
                    onClick={handleDownloadExcel}
                    className="bg-green-600 hover:bg-green-700"
                    size="lg"
                >
                    {isPro ? (
                        <>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Excel İndir
                        </>
                    ) : (
                        <>
                            <Lock className="mr-2 h-4 w-4" />
                            Excel (Pro)
                        </>
                    )}
                </Button>
                <Button
                    onClick={handleDownloadPDF}
                    className="bg-red-600 hover:bg-red-700"
                    size="lg"
                >
                    {isPro ? (
                        <>
                            <FileText className="mr-2 h-4 w-4" />
                            PDF İndir
                        </>
                    ) : (
                        <>
                            <Lock className="mr-2 h-4 w-4" />
                            PDF (Pro)
                        </>
                    )}
                </Button>
                {user && (
                    <Button onClick={handleLogout} variant="ghost" size="lg">
                        <LogOut className="mr-2 h-4 w-4" />
                        Çıkış
                    </Button>
                )}
            </div>

            {/* NEW: Parameters Panel */}
            <ParametersPanel
                parameters={parameters}
                onParametersChange={handleParametersChange}
                onRecalculate={handleRecalculate}
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                        <CardDescription className="text-xs font-medium uppercase">Toplam Gelir</CardDescription>
                        <CardTitle className="text-2xl font-bold text-blue-600">
                            {formatCurrency(summary.totalRevenue)}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                        <CardDescription className="text-xs font-medium uppercase">Toplam Kâr</CardDescription>
                        <CardTitle className="text-2xl font-bold text-green-600">
                            {formatCurrency(summary.totalProfit)}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                        <CardDescription className="text-xs font-medium uppercase">Başabaş Ayı</CardDescription>
                        <CardTitle className="text-2xl font-bold text-purple-600">
                            {summary.breakevenMonth ? `${summary.breakevenMonth}. Ay` : "Yok"}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-3">
                        <CardDescription className="text-xs font-medium uppercase">Gerekli Sermaye</CardDescription>
                        <CardTitle className="text-2xl font-bold text-orange-600">
                            {formatCurrency(summary.neededCapital)}
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
                            Dikkat Edilmesi Gerekenler
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {redFlags.map((flag, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-200">
                                    <span className="text-red-500">•</span>
                                    <span>{flag}</span>
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
                    <CardTitle>Aylık Gelir ve Kâr Trendi</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Gelir" />
                                <Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} name="Kâr" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Cash Flow Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Nakit Akışı</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="cash" fill="#8b5cf6" name="Nakit Bakiye" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* NEW: Cost Structure Chart */}
            {summary.costStructure && (
                <CostStructureChart costStructure={summary.costStructure} />
            )}

            {/* NEW: Scenario Manager */}
            {results.scenarios && results.scenarioAnalysis && (
                <ScenarioManager
                    scenarios={results.scenarios}
                    scenarioAnalysis={results.scenarioAnalysis}
                />
            )}

            {/* NEW: Analytics Intelligence Dashboard */}
            <AnalyticsDashboard result={results} />

            {/* NEW: Engagement Tools (Requires Save) */}
            <div className="mt-8 pt-8 border-t">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Gelişmiş Yönetim Araçları</h3>
                    {savedModelId && <GrowthReport modelId={savedModelId} />}
                </div>

                {!savedModelId ? (
                    <Card className="bg-muted/50 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                            <Lock className="w-12 h-12 text-muted-foreground mb-4" />
                            <h4 className="text-lg font-semibold mb-2">Bu özellikleri açmak için modeli kaydedin</h4>
                            <p className="text-muted-foreground mb-4 max-w-md">
                                Zaman çizelgesi, aylık hedefler ve büyüme raporları gibi gelişmiş özellikleri kullanmak için projenizi buluta kaydedin.
                            </p>
                            <Button onClick={() => handleSave()} disabled={isSaving}>
                                {isSaving ? "Kaydediliyor..." : "Projeyi Kaydet & Devam Et"}
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Tabs defaultValue="timeline">
                        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                            <TabsTrigger value="timeline">Zaman Çizelgesi</TabsTrigger>
                            <TabsTrigger value="checklist">Aylık Hedefler</TabsTrigger>
                        </TabsList>
                        <TabsContent value="timeline" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Olay Yönetimi</CardTitle>
                                    <CardDescription>Modele etki eden geçmiş ve gelecek olayları yönetin.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <TimelineEditor modelId={savedModelId} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="checklist" className="mt-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <MonthlyChecklist modelId={savedModelId} />
                                {/* Info card */}
                                <Card className="bg-muted/30">
                                    <CardHeader>
                                        <CardTitle className="text-base">Neden Önemli?</CardTitle>
                                        <CardDescription>
                                            Düzenli veri girişi yaparak modelinizin güvenilirliğini artırın ve yatırımcı raporları oluşturun.
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </div>

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
        </div>
    );
}
