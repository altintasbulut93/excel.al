
"use client";

import { useFinancialStore } from "@/lib/store";
import { generateFinancialModel } from "@/lib/engine/financials";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { AlertCircle, Download, CheckCircle, TrendingUp, DollarSign, CloudUpload, Lock, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { saveModelToSupabase } from "@/lib/db";
import { useState } from "react";
import { UpgradeModal } from "@/components/UpgradeModal";
import { EmailModal } from "@/components/EmailModal";
import { AuthModal } from "@/components/AuthModal";
import { supabase } from "@/lib/supabase";
import { ReverseEngineeringTool } from "@/components/ReverseEngineering";
import { BenchmarkCard } from "@/components/BenchmarkCard";

export function Step4Dashboard() {
    const { data, setStep, user } = useFinancialStore();
    const [isSaving, setIsSaving] = useState(false);
    const [isPro, setIsPro] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);

    // Hesaplamayı çalıştır
    const results = generateFinancialModel(data);
    const summary = results.summary;
    const monthlyData = results.monthly;
    const redFlags = results.redFlags;

    const handleEdit = () => setStep(0);

    const handleSave = async (forceUser?: any) => {
        if (!user && !forceUser) {
            setAuthOpen(true);
            return;
        }

        setIsSaving(true);
        try {
            await saveModelToSupabase(data, results, (forceUser || user)?.id);
            alert("Model başarıyla Buluta kaydedildi! 🚀");
        } catch (e: any) {
            console.error(e);
            alert(`hata: ${e.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownloadExcel = async () => {
        if (!isPro) return;

        try {
            const response = await fetch('/api/generate-excel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
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
            alert("Hata.");
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">

            <AuthModal
                isOpen={authOpen}
                onClose={() => setAuthOpen(false)}
                onSuccess={(u) => {
                    setAuthOpen(false);
                    handleSave(u);
                }}
            />

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">Finansal Projeksiyon: {data.businessName}</h1>
                        {user && <Badge variant="secondary" className="text-xs">{user.email}</Badge>}
                    </div>
                    <p className="text-muted-foreground">{data.sector} • {data.revenueModel}</p>
                </div>
                <div className="flex space-x-2 items-center flex-wrap gap-y-2 justify-center">
                    {!isPro && <UpgradeModal />}

                    <EmailModal />

                    <Button variant="outline" onClick={() => handleSave()} disabled={isSaving}>
                        {isSaving ? "Kaydediliyor..." : <><CloudUpload className="mr-2 h-4 w-4" /> {user ? "Kaydet" : "Giriş & Kaydet"}</>}
                    </Button>

                    <Button variant="ghost" onClick={handleEdit}>Düzenle</Button>

                    {user && (
                        <Button variant="ghost" size="icon" onClick={() => supabase.auth.signOut()} title="Çıkış Yap">
                            <LogOut className="w-4 h-4 text-red-500" />
                        </Button>
                    )}

                    {isPro ? (
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20 active:scale-95 transition-transform"
                            onClick={handleDownloadExcel}
                        >
                            <Download className="mr-2 h-4 w-4" /> Excel İndir
                        </Button>
                    ) : (
                        <div title="Pro özellik">
                            <UpgradeModal
                                trigger={
                                    <Button variant="secondary" className="opacity-80">
                                        <Lock className="mr-2 h-4 w-4" /> Excel (Pro)
                                    </Button>
                                }
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Ciro (1. Yıl)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{formatCurrency(summary.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">+%{(data.growth.monthlyGrowthRate * 100).toFixed(0)}/ay büyüme</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Kâr Margin</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${summary.totalProfit > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            %{summary.totalRevenue > 0 ? ((summary.totalProfit / summary.totalRevenue) * 100).toFixed(1) : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Sektör Ort: %20-30</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Başabaş (Break-Even)</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary.breakevenMonth ? `${summary.breakevenMonth}. Ay` : "Ulaşılamadı"}
                        </div>
                        <p className="text-xs text-muted-foreground">Kâra geçilen ilk ay</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sermaye İhtiyacı</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{formatCurrency(summary.neededCapital)}</div>
                        <p className="text-xs text-muted-foreground">Negatif bakiye riski</p>
                    </CardContent>
                </Card>
            </div>

            {/* CHARTS */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-2 lg:col-span-1 shadow-md">
                    <CardHeader>
                        <CardTitle>Gelir vs Gider</CardTitle>
                        <CardDescription>Aylık bazda operasyonel performans</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tickFormatter={(val) => `${val}.Ay`} />
                                <YAxis tickFormatter={(val) => `₺${val / 1000}k`} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="revenue" name="Gelir" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="totalExpenses" name="Gider" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-2 lg:col-span-1 shadow-md">
                    <CardHeader>
                        <CardTitle>Nakit Akışı (Kümülatif)</CardTitle>
                        <CardDescription>Kasa durumu ve runway analizi</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tickFormatter={(val) => `${val}.Ay`} />
                                <YAxis tickFormatter={(val) => `₺${val / 1000}k`} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <defs>
                                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="cashFlow.endingBalance"
                                    name="Kasa Bakiyesi"
                                    stroke="#82ca9d"
                                    fillOpacity={1}
                                    fill="url(#colorCash)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* BENCHMARKS & RED FLAGS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <BenchmarkCard />

                {/* RED FLAGS */}
                {redFlags.length > 0 ? (
                    <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10 h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
                                <AlertCircle className="h-5 w-5" />
                                Risk Analizi (Red Flags)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                                {redFlags.map((flag, idx) => (
                                    <li key={idx} className="text-foreground">{flag}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-l-4 border-l-green-500 bg-green-50/50 h-full flex items-center justify-center">
                        <div className="text-center p-6">
                            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                            <h3 className="text-lg font-bold text-green-800">Harika!</h3>
                            <p className="text-green-700">Modelinizde kritik bir risk (red-flag) tespit edilemedi.</p>
                        </div>
                    </Card>
                )}
            </div>

            {/* REVERSE ENGINEERING TOOL */}
            <ReverseEngineeringTool />

        </div>
    );
}
