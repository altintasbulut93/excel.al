"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScenarioResult, ScenarioType } from "@/lib/engine/types";
import { TrendingUp, TrendingDown, Target } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";
import { useFormat } from "@/hooks/use-format";

interface ScenarioManagerProps {
    scenarios: ScenarioResult[];
    scenarioAnalysis?: {
        averageRevenue: number;
        averageProfit: number;
        riskScore: number;
    };
}

export function ScenarioManager({ scenarios, scenarioAnalysis }: ScenarioManagerProps) {
    const { t } = useLanguage();
    const { format } = useFormat();
    const [activeScenario, setActiveScenario] = useState<ScenarioType>('base');

    const getScenario = (type: ScenarioType) => scenarios.find(s => s.scenario === type);
    const bestScenario = getScenario('best');
    const baseScenario = getScenario('base');
    const worstScenario = getScenario('worst');
    const currentScenario = getScenario(activeScenario);

    const getRiskLevel = (score: number) => {
        if (score < 30) return { label: t('dashboard.risk_low'), color: 'green' };
        if (score < 60) return { label: t('dashboard.risk_medium'), color: 'orange' };
        return { label: t('dashboard.risk_high'), color: 'red' };
    };

    const riskLevel = scenarioAnalysis ? getRiskLevel(scenarioAnalysis.riskScore) : null;

    return (
        <div className="space-y-6">
            {/* Header with Analysis Summary */}
            <Card className="border-t-4 border-t-indigo-500 bg-gradient-to-br from-indigo-50/50 to-slate-50 dark:from-indigo-950/20 dark:to-slate-900">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                                {t('revenue.advanced_title')}
                            </CardTitle>
                            <CardDescription>
                                {t('revenue.advanced_desc')}
                            </CardDescription>
                        </div>
                        {riskLevel && (
                            <Badge className={`bg-${riskLevel.color}-100 text-${riskLevel.color}-800 border-${riskLevel.color}-300`}>
                                {riskLevel.label}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                {scenarioAnalysis && (
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border">
                                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                                    {t('dashboard.revenue')}
                                </p>
                                <p className="text-2xl font-bold text-indigo-600">
                                    {format(scenarioAnalysis.averageRevenue)}
                                </p>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border">
                                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                                    {t('dashboard.monthly_story.net_profit')}
                                </p>
                                <p className="text-2xl font-bold text-indigo-600">
                                    {format(scenarioAnalysis.averageProfit)}
                                </p>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border">
                                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                                    {t('dashboard.risk_index')}
                                </p>
                                <p className={`text-2xl font-bold text-${riskLevel?.color}-600`}>
                                    {scenarioAnalysis.riskScore.toFixed(0)}/100
                                </p>
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Scenario Tabs */}
            <Tabs value={activeScenario} onValueChange={(v) => setActiveScenario(v as ScenarioType)}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="best" className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        {t('revenue.optimistic')}
                    </TabsTrigger>
                    <TabsTrigger value="base" className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        {t('revenue.base')}
                    </TabsTrigger>
                    <TabsTrigger value="worst" className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" />
                        {t('revenue.pessimistic')}
                    </TabsTrigger>
                </TabsList>

                {/* Best Scenario */}
                <TabsContent value="best">
                    {bestScenario && (
                        <ScenarioCard scenario={bestScenario} color="green" />
                    )}
                </TabsContent>

                {/* Base Scenario */}
                <TabsContent value="base">
                    {baseScenario && (
                        <ScenarioCard scenario={baseScenario} color="blue" />
                    )}
                </TabsContent>

                {/* Worst Scenario */}
                <TabsContent value="worst">
                    {worstScenario && (
                        <ScenarioCard scenario={worstScenario} color="red" />
                    )}
                </TabsContent>
            </Tabs>

            {/* Comparison Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{t('revenue.comparison_summary')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-slate-500">
                                    <th className="text-left p-2 font-semibold">{t('common.metric')}</th>
                                    <th className="text-right p-2 font-semibold text-emerald-600">{t('revenue.optimistic')}</th>
                                    <th className="text-right p-2 font-semibold text-blue-600">{t('revenue.base')}</th>
                                    <th className="text-right p-2 font-semibold text-rose-600">{t('revenue.pessimistic')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-2">{t('dashboard.total_revenue')}</td>
                                    <td className="text-right p-2 text-emerald-700 font-semibold font-mono">
                                        {format(bestScenario?.summary.totalRevenue || 0)}
                                    </td>
                                    <td className="text-right p-2 text-blue-700 font-semibold font-mono">
                                        {format(baseScenario?.summary.totalRevenue || 0)}
                                    </td>
                                    <td className="text-right p-2 text-rose-700 font-semibold font-mono">
                                        {format(worstScenario?.summary.totalRevenue || 0)}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-2">{t('dashboard.monthly_story.net_profit')}</td>
                                    <td className="text-right p-2 text-emerald-700 font-semibold font-mono">
                                        {format(bestScenario?.summary.totalProfit || 0)}
                                    </td>
                                    <td className="text-right p-2 text-blue-700 font-semibold font-mono">
                                        {format(baseScenario?.summary.totalProfit || 0)}
                                    </td>
                                    <td className="text-right p-2 text-rose-700 font-semibold font-mono">
                                        {format(worstScenario?.summary.totalProfit || 0)}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-2">{t('dashboard.breakeven_point')}</td>
                                    <td className="text-right p-2">
                                        {bestScenario?.summary.breakevenMonth ? `${bestScenario.summary.breakevenMonth}. ${t('common.month')}` : t('revenue.no_items')}
                                    </td>
                                    <td className="text-right p-2">
                                        {baseScenario?.summary.breakevenMonth ? `${baseScenario.summary.breakevenMonth}. ${t('common.month')}` : t('revenue.no_items')}
                                    </td>
                                    <td className="text-right p-2">
                                        {worstScenario?.summary.breakevenMonth ? `${worstScenario.summary.breakevenMonth}. ${t('common.month')}` : t('revenue.no_items')}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-2">{t('common.capital')} {t('dashboard.evaluation')}</td>
                                    <td className="text-right p-2 font-mono">
                                        {format(bestScenario?.summary.neededCapital || 0)}
                                    </td>
                                    <td className="text-right p-2 font-mono">
                                        {format(baseScenario?.summary.neededCapital || 0)}
                                    </td>
                                    <td className="text-right p-2 font-mono">
                                        {format(worstScenario?.summary.neededCapital || 0)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Scenario Card Component
function ScenarioCard({ scenario, color }: { scenario: ScenarioResult; color: 'green' | 'blue' | 'red' }) {
    const { t } = useLanguage();
    const { format } = useFormat();

    const colorClasses = {
        green: {
            bg: 'bg-green-50 dark:bg-green-950/20',
            border: 'border-green-200 dark:border-green-800',
            text: 'text-green-900 dark:text-green-100',
            badge: 'bg-green-100 text-green-800 border-green-300'
        },
        blue: {
            bg: 'bg-blue-50 dark:bg-blue-950/20',
            border: 'border-blue-200 dark:border-blue-800',
            text: 'text-blue-900 dark:text-blue-100',
            badge: 'bg-blue-100 text-blue-800 border-blue-300'
        },
        red: {
            bg: 'bg-red-50 dark:bg-red-950/20',
            border: 'border-red-200 dark:border-red-800',
            text: 'text-red-900 dark:text-red-100',
            badge: 'bg-red-100 text-red-800 border-red-300'
        }
    };

    const classes = colorClasses[color];

    return (
        <Card className={`${classes.bg} ${classes.border}`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className={classes.text}>{scenario.name}</CardTitle>
                    <Badge className={classes.badge}>
                        {scenario.scenario === 'best' && <TrendingUp className="w-4 h-4 mr-1" />}
                        {scenario.scenario === 'base' && <Target className="w-4 h-4 mr-1" />}
                        {scenario.scenario === 'worst' && <TrendingDown className="w-4 h-4 mr-1" />}
                        {scenario.scenario.toUpperCase()}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">{t('dashboard.total_revenue')}</p>
                        <p className="text-xl font-bold font-mono">{format(scenario.summary.totalRevenue)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">{t('dashboard.monthly_story.net_profit')}</p>
                        <p className="text-xl font-bold font-mono">{format(scenario.summary.totalProfit)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">{t('dashboard.breakeven_point')}</p>
                        <p className="text-xl font-bold">
                            {scenario.summary.breakevenMonth ? `${scenario.summary.breakevenMonth}. ${t('common.month')}` : t('revenue.no_items')}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">{t('common.capital')}</p>
                        <p className="text-xl font-bold font-mono">{format(scenario.summary.neededCapital)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
