"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MonthlyFinancialResult } from "@/lib/engine/types";
import { formatCurrency } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";

import { useFormat } from "@/hooks/use-format";

interface DeathValleyChartProps {
    monthly: MonthlyFinancialResult[];
    paybackPeriod: number | null;
}

export function DeathValleyChart({ monthly, paybackPeriod }: DeathValleyChartProps) {
    const { t } = useLanguage();
    const { format } = useFormat();

    // Calculate cumulative profit
    let cumulativeProfit = 0;
    let cumulativeCash = monthly[0]?.cashFlow.beginningBalance || 0;
    let minCumulativeProfit = 0;
    let minCumulativeProfitMonth = 0;

    const chartData = monthly.map((m) => {
        cumulativeProfit += m.netIncome;
        cumulativeCash = m.cashFlow.endingBalance;

        // Track death valley depth
        if (cumulativeProfit < minCumulativeProfit) {
            minCumulativeProfit = cumulativeProfit;
            minCumulativeProfitMonth = m.month;
        }

        return {
            month: `${m.month}. ${t('common.month')}`,
            monthNumber: m.month,
            cumulativeProfit: Math.round(cumulativeProfit),
            cumulativeCash: Math.round(cumulativeCash),
            monthlyProfit: Math.round(m.netIncome)
        };
    });

    const deathValleyDepth = Math.abs(minCumulativeProfit);
    const isInDeathValley = cumulativeProfit < 0;

    return (
        <Card className="border-t-4 border-t-purple-500">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-purple-600" />
                            {t('dashboard.death_title')}
                        </CardTitle>
                        <CardDescription>
                            {t('dashboard.death_desc')}
                        </CardDescription>
                    </div>
                    {isInDeathValley ? (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            {t('dashboard.in_valley')}
                        </Badge>
                    ) : (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {t('dashboard.positive_zone')}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Death Valley Depth */}
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-xs font-medium text-red-600 dark:text-red-400 uppercase mb-1">
                            {t('dashboard.deep_point')}
                        </p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                            {format(deathValleyDepth)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {minCumulativeProfitMonth}. {t('dashboard.month_label')}
                        </p>
                    </div>

                    {/* Payback Period */}
                    <div className={`p-4 rounded-lg border ${paybackPeriod ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'}`}>
                        <p className={`text-xs font-medium uppercase mb-1 ${paybackPeriod ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                            {t('dashboard.payback_period')}
                        </p>
                        <p className={`text-2xl font-bold ${paybackPeriod ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}`}>
                            {paybackPeriod ? `${paybackPeriod}. ${t('common.month')}` : t('dashboard.no_payback')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {paybackPeriod ? t('dashboard.turned_positive') : t('dashboard.not_turned_yet')}
                        </p>
                    </div>

                    {/* Current Status */}
                    <div className={`p-4 rounded-lg border ${isInDeathValley ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800' : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'}`}>
                        <p className={`text-xs font-medium uppercase mb-1 ${isInDeathValley ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                            {t('dashboard.current_status')}
                        </p>
                        <p className={`text-2xl font-bold ${isInDeathValley ? 'text-orange-700 dark:text-orange-300' : 'text-green-700 dark:text-green-300'}`}>
                            {format(Math.abs(cumulativeProfit))}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {isInDeathValley ? t('dashboard.negative_cum') : t('dashboard.positive_cum')}
                        </p>
                    </div>
                </div>

                {/* Chart */}
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                            <XAxis
                                dataKey="month"
                                className="text-xs"
                                tick={{ fill: 'currentColor' }}
                            />
                            <YAxis
                                className="text-xs"
                                tick={{ fill: 'currentColor' }}
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                                                <p className="font-semibold text-sm mb-2">{payload[0].payload.month}</p>
                                                <div className="space-y-1 text-xs">
                                                    <p className="text-purple-600">
                                                        <strong>{t('dashboard.cum_profit')}:</strong> {format(payload[0].payload.cumulativeProfit)}
                                                    </p>
                                                    <p className="text-blue-600">
                                                        <strong>{t('dashboard.cash_balance')}:</strong> {format(payload[0].payload.cumulativeCash)}
                                                    </p>
                                                    <p className="text-slate-600">
                                                        <strong>{t('dashboard.monthly_profit')}:</strong> {format(payload[0].payload.monthlyProfit)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend />
                            <ReferenceLine
                                y={0}
                                stroke="#ef4444"
                                strokeDasharray="3 3"
                                label={{ value: t('dashboard.breakeven_point'), position: "insideTopRight", fill: "#ef4444" }}
                            />
                            {paybackPeriod && (
                                <ReferenceLine
                                    x={`${paybackPeriod}. ${t('common.month')}`}
                                    stroke="#22c55e"
                                    strokeDasharray="5 5"
                                    label={{ value: "Payback", position: "top", fill: "#22c55e", fontWeight: "bold" }}
                                />
                            )}
                            <Area
                                type="monotone"
                                dataKey="cumulativeProfit"
                                stroke="#8b5cf6"
                                fillOpacity={1}
                                fill="url(#colorProfit)"
                                name={t('dashboard.cum_profit')}
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="cumulativeCash"
                                stroke="#3b82f6"
                                fillOpacity={1}
                                fill="url(#colorCash)"
                                name={t('dashboard.cash_balance')}
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {t('dashboard.death_what_title')}
                    </h4>
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                        {t('dashboard.death_what_desc')}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
