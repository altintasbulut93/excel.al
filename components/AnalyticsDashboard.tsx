"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FinancialModelResult } from "@/lib/engine/types";
import { calculateAnalytics, getRiskLevel } from "@/lib/engine/analytics";
import { TrendingUp, Shield, Target, AlertTriangle, CheckCircle, Activity } from "lucide-react";

interface AnalyticsDashboardProps {
    result: FinancialModelResult;
}

export function AnalyticsDashboard({ result }: AnalyticsDashboardProps) {
    const analytics = calculateAnalytics(result);
    const riskLevel = getRiskLevel(analytics.riskIndex);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        Finansal İstihbarat Analizi
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Gelişmiş metrikler ve risk değerlendirmesi
                    </p>
                </div>
                <Badge className={`bg-${riskLevel.color}-100 text-${riskLevel.color}-800 border-${riskLevel.color}-300 text-lg px-4 py-2`}>
                    {riskLevel.label}
                </Badge>
            </div>

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Growth Efficiency Score */}
                <Card className="border-t-4 border-t-blue-500">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-xs font-medium uppercase">
                                Büyüme Verimliliği
                            </CardDescription>
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold text-blue-600">
                            {analytics.growthEfficiencyScore}/100
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={analytics.growthEfficiencyScore} className="h-2 mb-2" />
                        <p className="text-xs text-muted-foreground">
                            {analytics.growthEfficiencyScore >= 80 && "🎉 Mükemmel! Yüksek büyüme, düşük harcama"}
                            {analytics.growthEfficiencyScore >= 60 && analytics.growthEfficiencyScore < 80 && "✅ İyi! Dengeli büyüme"}
                            {analytics.growthEfficiencyScore >= 40 && analytics.growthEfficiencyScore < 60 && "⚠️ Orta! Verimlilik artırılabilir"}
                            {analytics.growthEfficiencyScore < 40 && "🚨 Dikkat! Yüksek harcama, düşük büyüme"}
                        </p>
                    </CardContent>
                </Card>

                {/* Financial Stability Score */}
                <Card className="border-t-4 border-t-green-500">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-xs font-medium uppercase">
                                Finansal İstikrar
                            </CardDescription>
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                                <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold text-green-600">
                            {analytics.financialStabilityScore}/100
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={analytics.financialStabilityScore} className="h-2 mb-2" />
                        <p className="text-xs text-muted-foreground">
                            {analytics.financialStabilityScore >= 80 && "🛡️ Çok İstikrarlı - Düşük risk"}
                            {analytics.financialStabilityScore >= 60 && analytics.financialStabilityScore < 80 && "✅ İstikrarlı - Orta risk"}
                            {analytics.financialStabilityScore >= 40 && analytics.financialStabilityScore < 60 && "⚠️ İstikrarsız - Yüksek risk"}
                            {analytics.financialStabilityScore < 40 && "🚨 Kritik - Acil aksiyon gerekli"}
                        </p>
                    </CardContent>
                </Card>

                {/* Risk Index */}
                <Card className={`border-t-4 border-t-${riskLevel.color}-500`}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-xs font-medium uppercase">
                                Risk Endeksi
                            </CardDescription>
                            <div className={`p-2 rounded-lg bg-${riskLevel.color}-100 dark:bg-${riskLevel.color}-900`}>
                                <AlertTriangle className={`w-4 h-4 text-${riskLevel.color}-600 dark:text-${riskLevel.color}-400`} />
                            </div>
                        </div>
                        <CardTitle className={`text-3xl font-bold text-${riskLevel.color}-600`}>
                            {analytics.riskIndex}/100
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={analytics.riskIndex} className="h-2 mb-2" />
                        <p className="text-xs text-muted-foreground">
                            {riskLevel.description}
                        </p>
                    </CardContent>
                </Card>

                {/* Scenario Confidence */}
                <Card className="border-t-4 border-t-purple-500">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-xs font-medium uppercase">
                                Senaryo Güveni
                            </CardDescription>
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                                <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold text-purple-600">
                            %{analytics.scenarioConfidence}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={analytics.scenarioConfidence} className="h-2 mb-2" />
                        <p className="text-xs text-muted-foreground">
                            {analytics.scenarioConfidence >= 80 && "🎯 Yüksek güven - İyi araştırılmış"}
                            {analytics.scenarioConfidence >= 60 && analytics.scenarioConfidence < 80 && "✅ Orta güven - Makul varsayımlar"}
                            {analytics.scenarioConfidence >= 40 && analytics.scenarioConfidence < 60 && "⚠️ Düşük güven - Spekülatif"}
                            {analytics.scenarioConfidence < 40 && "🚨 Çok düşük - Belirsiz"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Detaylı Analiz
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Growth Efficiency Details */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Büyüme Verimliliği Analizi
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-blue-800 dark:text-blue-200">
                                    <strong>Skor:</strong> {analytics.growthEfficiencyScore}/100
                                </p>
                                <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                                    Gelir büyümesi ile harcama oranının dengesi
                                </p>
                            </div>
                            <div>
                                <p className="text-blue-800 dark:text-blue-200">
                                    <strong>Değerlendirme:</strong>
                                </p>
                                <ul className="text-xs text-blue-700 dark:text-blue-300 list-disc list-inside mt-1">
                                    {analytics.growthEfficiencyScore >= 80 && <li>Yüksek büyüme, düşük harcama ✅</li>}
                                    {analytics.growthEfficiencyScore >= 60 && analytics.growthEfficiencyScore < 80 && <li>Dengeli büyüme stratejisi</li>}
                                    {analytics.growthEfficiencyScore < 60 && <li>Harcama optimizasyonu gerekli ⚠️</li>}
                                    {result.summary.breakevenMonth && <li>Başabaş noktasına ulaşıldı ✅</li>}
                                    {!result.summary.breakevenMonth && <li>Henüz kârlı değil</li>}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Financial Stability Details */}
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Finansal İstikrar Analizi
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-green-800 dark:text-green-200">
                                    <strong>Skor:</strong> {analytics.financialStabilityScore}/100
                                </p>
                                <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                                    Nakit, kârlılık, büyüme ve birim ekonomisi dengesi
                                </p>
                            </div>
                            <div>
                                <p className="text-green-800 dark:text-green-200">
                                    <strong>Faktörler:</strong>
                                </p>
                                <ul className="text-xs text-green-700 dark:text-green-300 list-disc list-inside mt-1">
                                    <li>Nakit runway: {result.summary.runwayMonths || 0} ay</li>
                                    <li>Kâr marjı: {result.summary.totalRevenue > 0 ? ((result.summary.totalProfit / result.summary.totalRevenue) * 100).toFixed(1) : 0}%</li>
                                    {result.summary.unitEconomics && (
                                        <li>LTV/CAC: {result.summary.unitEconomics.ltvCacRatio.toFixed(1)}x</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Risk Assessment */}
                    <div className={`p-4 bg-${riskLevel.color}-50 dark:bg-${riskLevel.color}-950/20 rounded-lg border border-${riskLevel.color}-200 dark:border-${riskLevel.color}-800`}>
                        <h4 className={`font-semibold text-${riskLevel.color}-900 dark:text-${riskLevel.color}-100 mb-2 flex items-center gap-2`}>
                            <AlertTriangle className="w-4 h-4" />
                            Risk Değerlendirmesi
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className={`text-${riskLevel.color}-800 dark:text-${riskLevel.color}-200`}>
                                    <strong>Risk Seviyesi:</strong> {riskLevel.label}
                                </p>
                                <p className={`text-${riskLevel.color}-700 dark:text-${riskLevel.color}-300 text-xs mt-1`}>
                                    {riskLevel.description}
                                </p>
                            </div>
                            <div>
                                <p className={`text-${riskLevel.color}-800 dark:text-${riskLevel.color}-200`}>
                                    <strong>Öneriler:</strong>
                                </p>
                                <ul className={`text-xs text-${riskLevel.color}-700 dark:text-${riskLevel.color}-300 list-disc list-inside mt-1`}>
                                    {analytics.riskIndex >= 75 && (
                                        <>
                                            <li>Acil sermaye artırımı düşünün</li>
                                            <li>Giderleri hemen azaltın</li>
                                            <li>Gelir kaynaklarını çeşitlendirin</li>
                                        </>
                                    )}
                                    {analytics.riskIndex >= 50 && analytics.riskIndex < 75 && (
                                        <>
                                            <li>Nakit akışını yakından izleyin</li>
                                            <li>Büyüme stratejisini gözden geçirin</li>
                                            <li>Alternatif finansman seçenekleri araştırın</li>
                                        </>
                                    )}
                                    {analytics.riskIndex < 50 && (
                                        <>
                                            <li>Mevcut stratejiye devam edin</li>
                                            <li>Büyüme fırsatlarını değerlendirin</li>
                                            <li>Operasyonel verimliliği artırın</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
