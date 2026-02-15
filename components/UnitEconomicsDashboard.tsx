"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UnitEconomics } from "@/lib/engine/types";
import { TrendingUp, DollarSign, Users, Target, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";
import { useFinancialStore } from "@/lib/store";
import { useFormat } from "@/hooks/use-format";

interface UnitEconomicsDashboardProps {
    unitEconomics: UnitEconomics;
}

export function UnitEconomicsDashboard({ unitEconomics }: UnitEconomicsDashboardProps) {
    const { cac, arpu, ltv, ltvCacRatio, paybackPeriod, grossMargin } = unitEconomics;
    const { t } = useLanguage();
    const { format } = useFormat();

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
                        {t('dashboard.unit_title')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {t('dashboard.unit_desc')}
                    </p>
                </div>
                {isHealthyLtvCac && isHealthyPayback && isHealthyMargin ? (
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {t('dashboard.healthy')}
                    </Badge>
                ) : (
                    <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {t('dashboard.attention')}
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
                                {t('dashboard.cac_label')}
                            </CardDescription>
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                                <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold text-blue-600">
                            {format(cac)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            <strong>{t('dashboard.cac_name')}</strong>
                            <br />
                            {t('dashboard.cac_desc')}
                        </p>
                        <div className="mt-2 text-xs">
                            <span className="text-muted-foreground">{t('dashboard.formula')}:</span>
                            <br />
                            <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                                {t('dashboard.form_cac')}
                            </code>
                        </div>
                    </CardContent>
                </Card>

                {/* ARPU */}
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-xs font-medium uppercase">
                                {t('dashboard.arpu_label')}
                            </CardDescription>
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                                <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold text-green-600">
                            {format(arpu)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            <strong>{t('dashboard.arpu_name')}</strong>
                            <br />
                            {t('dashboard.arpu_desc')}
                        </p>
                        <div className="mt-2 text-xs">
                            <span className="text-muted-foreground">{t('dashboard.formula')}:</span>
                            <br />
                            <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                                {t('dashboard.form_arpu')}
                            </code>
                        </div>
                    </CardContent>
                </Card>

                {/* LTV */}
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-xs font-medium uppercase">
                                {t('dashboard.ltv_label')}
                            </CardDescription>
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold text-purple-600">
                            {format(ltv)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            <strong>{t('dashboard.ltv_name')}</strong>
                            <br />
                            {t('dashboard.ltv_desc')}
                        </p>
                        <div className="mt-2 text-xs">
                            <span className="text-muted-foreground">{t('dashboard.formula')}:</span>
                            <br />
                            <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                                {t('dashboard.form_ltv')}
                            </code>
                        </div>
                    </CardContent>
                </Card>

                {/* LTV/CAC Ratio */}
                <Card className={`border-l-4 ${isHealthyLtvCac ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20' : 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20'}`}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-xs font-medium uppercase">
                                {t('dashboard.ratio_label')}
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
                            <strong>{t('dashboard.ratio_title')}</strong>
                            <br />
                            {isHealthyLtvCac ? (
                                <span className="text-green-600 font-semibold">✅ {t('dashboard.healthy')} (&gt;3)</span>
                            ) : (
                                <span className="text-orange-600 font-semibold">⚠️ {t('dashboard.low')} (&lt;3)</span>
                            )}
                        </p>
                        <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded border">
                            <p className="text-xs">
                                <strong>{t('dashboard.target')}:</strong> &gt;3.0
                                <br />
                                <strong>{t('dashboard.excellent')}:</strong> &gt;5.0
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Payback Period */}
                <Card className={`border-l-4 ${isHealthyPayback ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20' : 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20'}`}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-xs font-medium uppercase">
                                {t('dashboard.payback_label')}
                            </CardDescription>
                            <div className={`p-2 rounded-lg ${isHealthyPayback ? 'bg-green-100 dark:bg-green-900' : 'bg-orange-100 dark:bg-orange-900'}`}>
                                <Clock className={`w-4 h-4 ${isHealthyPayback ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`} />
                            </div>
                        </div>
                        <CardTitle className={`text-3xl font-bold ${isHealthyPayback ? 'text-green-600' : 'text-orange-600'}`}>
                            {paybackPeriod.toFixed(1)} {t('dashboard.months')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            <strong>{t('dashboard.payback_title')}</strong>
                            <br />
                            {isHealthyPayback ? (
                                <span className="text-green-600 font-semibold">✅ {t('dashboard.fast')} (&lt;12 {t('dashboard.months')})</span>
                            ) : (
                                <span className="text-orange-600 font-semibold">⚠️ {t('dashboard.slow')} (&gt;12 {t('dashboard.months')})</span>
                            )}
                        </p>
                        <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded border">
                            <p className="text-xs">
                                <strong>{t('dashboard.target')}:</strong> &lt;12 {t('dashboard.months')}
                                <br />
                                <strong>{t('dashboard.excellent')}:</strong> &lt;6 {t('dashboard.months')}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Gross Margin */}
                <Card className={`border-l-4 ${isHealthyMargin ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20' : 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20'}`}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardDescription className="text-xs font-medium uppercase">
                                {t('dashboard.margin_label')}
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
                            <strong>{t('dashboard.margin_title')}</strong>
                            <br />
                            {isHealthyMargin ? (
                                <span className="text-green-600 font-semibold">✅ {t('dashboard.healthy')} (&gt;70%)</span>
                            ) : (
                                <span className="text-orange-600 font-semibold">⚠️ {t('dashboard.low')} (&lt;70%)</span>
                            )}
                        </p>
                        <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded border">
                            <p className="text-xs">
                                <strong>{t('dashboard.saas_target')}:</strong> &gt;70%
                                <br />
                                <strong>{t('dashboard.ecommerce')}:</strong> 30-40%
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Info Box */}
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        📊 {t('dashboard.what_is_title')}
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        {t('dashboard.what_is_desc')}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
