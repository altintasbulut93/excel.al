"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFormat } from "@/hooks/use-format";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Layers, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";

interface CostStructureChartProps {
    costStructure: {
        totalFixed: number;
        totalVariable: number;
        fixedPercentage: number;
        variablePercentage: number;
    };
}

export function CostStructureChart({ costStructure }: CostStructureChartProps) {
    const { totalFixed, totalVariable, fixedPercentage, variablePercentage } = costStructure;
    const totalCosts = totalFixed + totalVariable;
    const { t } = useLanguage();
    const { format } = useFormat();

    // Chart data
    const chartData = [
        { name: t('dashboard.expense_analysis.fixed_expenses'), value: totalFixed, percentage: fixedPercentage },
        { name: t('dashboard.expense_analysis.variable_expenses'), value: totalVariable, percentage: variablePercentage }
    ];

    const COLORS = {
        fixed: '#ef4444',      // red-500
        variable: '#22c55e'    // green-500
    };

    // Health check: Fixed costs should ideally be <70% for scalability
    const isHealthy = fixedPercentage < 70;

    return (
        <Card className="border-t-4 border-t-amber-500">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Layers className="w-5 h-5 text-amber-600" />
                            {t('dashboard.expense_analysis.title')}
                        </CardTitle>
                        <CardDescription>
                            {t('dashboard.expense_analysis.desc')}
                        </CardDescription>
                    </div>
                    {isHealthy ? (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {t('dashboard.expense_analysis.scalable')}
                        </Badge>
                    ) : (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {t('dashboard.expense_analysis.high_fixed')}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Costs */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                            {t('dashboard.expense_analysis.total_expense')}
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {format(totalCosts)}
                        </p>
                    </div>

                    {/* Fixed Costs */}
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-xs font-medium text-red-600 dark:text-red-400 uppercase mb-1">
                            {t('dashboard.expense_analysis.fixed_expenses')}
                        </p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                            {format(totalFixed)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('dashboard.expense_analysis.fixed_percentage').replace('{percent}', fixedPercentage.toFixed(1))}
                        </p>
                    </div>

                    {/* Variable Costs */}
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase mb-1">
                            {t('dashboard.expense_analysis.variable_expenses')}
                        </p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {format(totalVariable)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('dashboard.expense_analysis.variable_percentage').replace('{percent}', variablePercentage.toFixed(1))}
                        </p>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: %${((percent || 0) * 100).toFixed(1)}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                <Cell fill={COLORS.fixed} />
                                <Cell fill={COLORS.variable} />
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border">
                                                <p className="font-semibold text-sm mb-1">{data.name}</p>
                                                <p className="text-xs">
                                                    <strong>{t('dashboard.expense_analysis.amount')}:</strong> {format(data.value)}
                                                </p>
                                                <p className="text-xs">
                                                    <strong>{t('dashboard.expense_analysis.ratio')}:</strong> %{data.percentage.toFixed(1)}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Breakdown Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Fixed Costs Breakdown */}
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                        <h4 className="font-semibold text-red-900 dark:text-red-100 mb-3 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            {t('dashboard.expense_analysis.fixed_expenses_caps')}
                        </h4>
                        <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
                            <li className="flex items-start gap-2">
                                <span className="text-red-500">•</span>
                                <span><strong>{t('dashboard.expense_analysis.staff_salaries')}</strong> {t('dashboard.expense_analysis.staff_salaries_desc')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500">•</span>
                                <span><strong>{t('dashboard.expense_analysis.office_rent')}</strong> {t('dashboard.expense_analysis.office_rent_desc')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500">•</span>
                                <span><strong>{t('dashboard.expense_analysis.software_subs')}</strong> {t('dashboard.expense_analysis.software_subs_desc')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500">•</span>
                                <span><strong>{t('dashboard.expense_analysis.insurance_accounting')}</strong> {t('dashboard.expense_analysis.insurance_accounting_desc')}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Variable Costs Breakdown */}
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            {t('dashboard.expense_analysis.variable_expenses_caps')}
                        </h4>
                        <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                            <li className="flex items-start gap-2">
                                <span className="text-green-500">•</span>
                                <span><strong>{t('dashboard.expense_analysis.cogs')}</strong> {t('dashboard.expense_analysis.cogs_desc')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500">•</span>
                                <span><strong>{t('dashboard.expense_analysis.commissions')}</strong> {t('dashboard.expense_analysis.commissions_desc')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500">•</span>
                                <span><strong>{t('dashboard.expense_analysis.marketing_variable')}</strong> {t('dashboard.expense_analysis.marketing_variable_desc')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500">•</span>
                                <span><strong>{t('dashboard.expense_analysis.payment_fees')}</strong> {t('dashboard.expense_analysis.payment_fees_desc')}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Analysis & Recommendations */}
                <div className={`p-4 rounded-lg border ${isHealthy ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' : 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'}`}>
                    <h4 className={`font-semibold mb-2 flex items-center gap-2 ${isHealthy ? 'text-green-900 dark:text-green-100' : 'text-orange-900 dark:text-orange-100'}`}>
                        {isHealthy ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {t('dashboard.expense_analysis.analysis_recommendations')}
                    </h4>
                    {isHealthy ? (
                        <div className="text-sm text-green-800 dark:text-green-200 space-y-2">
                            <p>
                                ✅ <strong>{t('dashboard.expense_analysis.healthy_structure')}</strong> {t('dashboard.expense_analysis.healthy_structure_desc').replace('{percent}', fixedPercentage.toFixed(0))}
                            </p>
                            <p>
                                💡 {t('dashboard.expense_analysis.margin_increase_desc')}
                            </p>
                        </div>
                    ) : (
                        <div className="text-sm text-orange-800 dark:text-orange-200 space-y-2">
                            <p>
                                ⚠️ <strong>{t('dashboard.expense_analysis.unhealthy_structure')}</strong> {t('dashboard.expense_analysis.unhealthy_structure_desc').replace('{percent}', fixedPercentage.toFixed(0))}
                            </p>
                            <p>
                                💡 <strong>{t('dashboard.expense_analysis.rec_header')}</strong>
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>{t('dashboard.expense_analysis.rec1')}</li>
                                <li>{t('dashboard.expense_analysis.rec2')}</li>
                                <li>{t('dashboard.expense_analysis.rec3')}</li>
                                <li>{t('dashboard.expense_analysis.rec4')}</li>
                            </ul>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
