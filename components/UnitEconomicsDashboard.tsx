"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UnitEconomics } from "@/lib/engine/types";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, DollarSign, Users, Target, Clock, AlertCircle, CheckCircle } from "lucide-react";

interface UnitEconomicsDashboardProps {
    unitEconomics: UnitEconomics;
}

export function UnitEconomicsDashboard({ unitEconomics }: UnitEconomicsDashboardProps) {
    const { cac, arpu, ltv, ltvCacRatio, paybackPeriod, grossMargin } = unitEconomics;

    // Health indicators
    const isHealthyLtvCac = ltvCacRatio >= 3;
    const isHealthyPayback = paybackPeriod <= 12;
    const isHealthyMargin = grossMargin >= 0.70;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        Birim Ekonomisi Metrikleri
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Startup'ınızın sağlığını gösteren kritik göstergeler
                    </p>
                </div>
                {isHealthyLtvCac && isHealthyPayback && isHealthyMargin ? (
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Sağlıklı
                    </Badge>
                ) : (
                    <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Dikkat
                    </Badge>
                )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* CAC */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-xs font-medium uppercase">
                                CAC
                            </CardDescription>
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                                <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold text-blue-600">
                            {formatCurrency(cac)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            <strong>Customer Acquisition Cost</strong>
                            <br />
                            Bir müşteri kazanmanın maliyeti
                        </p>
                        <div className="mt-2 text-xs">
                            <span className="text-muted-foreground">Formül:</span>
                            <br />
                            <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                                Pazarlama / Yeni Müşteri
                            </code>
                        </div>
                    </CardContent>
                </Card>

                {/* ARPU */}
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-xs font-medium uppercase">
                                ARPU
                            </CardDescription>
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                                <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold text-green-600">
                            {formatCurrency(arpu)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            <strong>Average Revenue Per User</strong>
                            <br />
                            Kullanıcı başına ortalama gelir
                        </p>
                        <div className="mt-2 text-xs">
                            <span className="text-muted-foreground">Formül:</span>
                            <br />
                            <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                                Toplam Gelir / Aktif Kullanıcı
                            </code>
                        </div>
                    </CardContent>
                </Card>

                {/* LTV */}
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-xs font-medium uppercase">
                                LTV
                            </CardDescription>
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold text-purple-600">
                            {formatCurrency(ltv)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            <strong>Lifetime Value</strong>
                            <br />
                            Bir müşterinin yaşam boyu değeri
                        </p>
                        <div className="mt-2 text-xs">
                            <span className="text-muted-foreground">Formül:</span>
                            <br />
                            <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                                (ARPU × Margin) / Churn
                            </code>
                        </div>
                    </CardContent>
                </Card>

                {/* LTV/CAC Ratio */}
                <Card className={`border-l-4 ${isHealthyLtvCac ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20' : 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20'}`}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-xs font-medium uppercase">
                                LTV/CAC Ratio
                            </CardDescription>
                            <div className={`p-2 rounded-lg ${isHealthyLtvCac ? 'bg-green-100 dark:bg-green-900' : 'bg-orange-100 dark:bg-orange-900'}`}>
                                <Target className={`w-4 h-4 ${isHealthyLtvCac ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`} />
                            </div>
                        </div>
                        <CardTitle className={`text-3xl font-bold ${isHealthyLtvCac ? 'text-green-600' : 'text-orange-600'}`}>
                            {ltvCacRatio.toFixed(1)}x
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            <strong>LTV/CAC Oranı</strong>
                            <br />
                            {isHealthyLtvCac ? (
                                <span className="text-green-600 font-semibold">✅ Sağlıklı (&gt;3)</span>
                            ) : (
                                <span className="text-orange-600 font-semibold">⚠️ Düşük (&lt;3)</span>
                            )}
                        </p>
                        <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded border">
                            <p className="text-xs">
                                <strong>Hedef:</strong> &gt;3.0
                                <br />
                                <strong>Mükemmel:</strong> &gt;5.0
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Payback Period */}
                <Card className={`border-l-4 ${isHealthyPayback ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20' : 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20'}`}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-xs font-medium uppercase">
                                Payback Period
                            </CardDescription>
                            <div className={`p-2 rounded-lg ${isHealthyPayback ? 'bg-green-100 dark:bg-green-900' : 'bg-orange-100 dark:bg-orange-900'}`}>
                                <Clock className={`w-4 h-4 ${isHealthyPayback ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`} />
                            </div>
                        </div>
                        <CardTitle className={`text-3xl font-bold ${isHealthyPayback ? 'text-green-600' : 'text-orange-600'}`}>
                            {paybackPeriod.toFixed(1)} ay
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            <strong>Geri Ödeme Süresi</strong>
                            <br />
                            {isHealthyPayback ? (
                                <span className="text-green-600 font-semibold">✅ Hızlı (&lt;12 ay)</span>
                            ) : (
                                <span className="text-orange-600 font-semibold">⚠️ Yavaş (&gt;12 ay)</span>
                            )}
                        </p>
                        <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded border">
                            <p className="text-xs">
                                <strong>Hedef:</strong> &lt;12 ay
                                <br />
                                <strong>Mükemmel:</strong> &lt;6 ay
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Gross Margin */}
                <Card className={`border-l-4 ${isHealthyMargin ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20' : 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20'}`}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-xs font-medium uppercase">
                                Gross Margin
                            </CardDescription>
                            <div className={`p-2 rounded-lg ${isHealthyMargin ? 'bg-green-100 dark:bg-green-900' : 'bg-orange-100 dark:bg-orange-900'}`}>
                                <TrendingUp className={`w-4 h-4 ${isHealthyMargin ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`} />
                            </div>
                        </div>
                        <CardTitle className={`text-3xl font-bold ${isHealthyMargin ? 'text-green-600' : 'text-orange-600'}`}>
                            %{(grossMargin * 100).toFixed(0)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            <strong>Brüt Kâr Marjı</strong>
                            <br />
                            {isHealthyMargin ? (
                                <span className="text-green-600 font-semibold">✅ Sağlıklı (&gt;70%)</span>
                            ) : (
                                <span className="text-orange-600 font-semibold">⚠️ Düşük (&lt;70%)</span>
                            )}
                        </p>
                        <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded border">
                            <p className="text-xs">
                                <strong>SaaS Hedef:</strong> &gt;70%
                                <br />
                                <strong>E-ticaret:</strong> 30-40%
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Info Box */}
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        📊 Birim Ekonomisi Nedir?
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        Birim ekonomisi, her bir müşteriden elde ettiğiniz değeri (LTV) ve o müşteriyi kazanmanın maliyetini (CAC)
                        karşılaştırarak işinizin sürdürülebilirliğini ölçer. Sağlıklı bir SaaS için <strong>LTV/CAC &gt; 3</strong> ve
                        <strong> Payback &lt; 12 ay</strong> olmalıdır.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
