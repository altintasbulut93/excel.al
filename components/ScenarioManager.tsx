"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScenarioResult, ScenarioType } from "@/lib/engine/types";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Target, AlertCircle } from "lucide-react";

interface ScenarioManagerProps {
    scenarios: ScenarioResult[];
    scenarioAnalysis?: {
        averageRevenue: number;
        averageProfit: number;
        riskScore: number;
    };
}

export function ScenarioManager({ scenarios, scenarioAnalysis }: ScenarioManagerProps) {
    const [activeScenario, setActiveScenario] = useState<ScenarioType>('base');

    const getScenario = (type: ScenarioType) => scenarios.find(s => s.scenario === type);
    const bestScenario = getScenario('best');
    const baseScenario = getScenario('base');
    const worstScenario = getScenario('worst');
    const currentScenario = getScenario(activeScenario);

    const getRiskLevel = (score: number) => {
        if (score < 30) return { label: 'Düşük Risk', color: 'green' };
        if (score < 60) return { label: 'Orta Risk', color: 'orange' };
        return { label: 'Yüksek Risk', color: 'red' };
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
                                Çoklu Senaryo Analizi
                            </CardTitle>
                            <CardDescription>
                                İyi, Orta ve Kötü senaryoları karşılaştırın
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
                                    Ortalama Gelir
                                </p>
                                <p className="text-2xl font-bold text-indigo-600">
                                    {formatCurrency(scenarioAnalysis.averageRevenue)}
                                </p>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border">
                                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                                    Ortalama Kâr
                                </p>
                                <p className="text-2xl font-bold text-indigo-600">
                                    {formatCurrency(scenarioAnalysis.averageProfit)}
                                </p>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border">
                                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                                    Risk Skoru
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
                        İyi Senaryo
                    </TabsTrigger>
                    <TabsTrigger value="base" className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Orta Senaryo
                    </TabsTrigger>
                    <TabsTrigger value="worst" className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" />
                        Kötü Senaryo
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
                    <CardTitle className="text-lg">Senaryo Karşılaştırması</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2 font-semibold">Metrik</th>
                                    <th className="text-right p-2 font-semibold text-green-600">İyi</th>
                                    <th className="text-right p-2 font-semibold text-blue-600">Orta</th>
                                    <th className="text-right p-2 font-semibold text-red-600">Kötü</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-2">Toplam Gelir</td>
                                    <td className="text-right p-2 text-green-700 font-semibold">
                                        {formatCurrency(bestScenario?.summary.totalRevenue || 0)}
                                    </td>
                                    <td className="text-right p-2 text-blue-700 font-semibold">
                                        {formatCurrency(baseScenario?.summary.totalRevenue || 0)}
                                    </td>
                                    <td className="text-right p-2 text-red-700 font-semibold">
                                        {formatCurrency(worstScenario?.summary.totalRevenue || 0)}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-2">Toplam Kâr</td>
                                    <td className="text-right p-2 text-green-700 font-semibold">
                                        {formatCurrency(bestScenario?.summary.totalProfit || 0)}
                                    </td>
                                    <td className="text-right p-2 text-blue-700 font-semibold">
                                        {formatCurrency(baseScenario?.summary.totalProfit || 0)}
                                    </td>
                                    <td className="text-right p-2 text-red-700 font-semibold">
                                        {formatCurrency(worstScenario?.summary.totalProfit || 0)}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-2">Başabaş Ayı</td>
                                    <td className="text-right p-2">
                                        {bestScenario?.summary.breakevenMonth ? `${bestScenario.summary.breakevenMonth}. Ay` : 'Yok'}
                                    </td>
                                    <td className="text-right p-2">
                                        {baseScenario?.summary.breakevenMonth ? `${baseScenario.summary.breakevenMonth}. Ay` : 'Yok'}
                                    </td>
                                    <td className="text-right p-2">
                                        {worstScenario?.summary.breakevenMonth ? `${worstScenario.summary.breakevenMonth}. Ay` : 'Yok'}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-2">Gerekli Sermaye</td>
                                    <td className="text-right p-2">
                                        {formatCurrency(bestScenario?.summary.neededCapital || 0)}
                                    </td>
                                    <td className="text-right p-2">
                                        {formatCurrency(baseScenario?.summary.neededCapital || 0)}
                                    </td>
                                    <td className="text-right p-2">
                                        {formatCurrency(worstScenario?.summary.neededCapital || 0)}
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
                        <p className="text-xs text-muted-foreground uppercase mb-1">Toplam Gelir</p>
                        <p className="text-xl font-bold">{formatCurrency(scenario.summary.totalRevenue)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">Toplam Kâr</p>
                        <p className="text-xl font-bold">{formatCurrency(scenario.summary.totalProfit)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">Başabaş</p>
                        <p className="text-xl font-bold">
                            {scenario.summary.breakevenMonth ? `${scenario.summary.breakevenMonth}. Ay` : 'Yok'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">Sermaye İhtiyacı</p>
                        <p className="text-xl font-bold">{formatCurrency(scenario.summary.neededCapital)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
