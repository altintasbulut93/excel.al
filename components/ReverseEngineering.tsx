
"use client";

import { useState } from "react";
import { useFinancialStore } from "@/lib/store";
import { calculateReverseGoal } from "@/lib/engine/reverse-engineer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/i18n-context";
import { useFormat } from "@/hooks/use-format";

export function ReverseEngineeringTool() {
    const { t } = useLanguage();
    const { format, currency } = useFormat();
    const { data } = useFinancialStore();
    const [targetProfit, setTargetProfit] = useState<number>(50000); // Default 50k
    const [result, setResult] = useState<ReturnType<typeof calculateReverseGoal> | null>(null);

    const handleCalculate = () => {
        const res = calculateReverseGoal(data, targetProfit);
        setResult(res);
    };

    return (
        <Card className="border-t-4 border-t-indigo-500 shadow-lg bg-slate-50/50 dark:bg-slate-900/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-indigo-700">
                    <Target className="w-6 h-6" /> {t('dashboard.reverse_tool_title')}
                </CardTitle>
                <CardDescription>
                    {t('dashboard.reverse_tool_desc')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <Label>{t('dashboard.target_net_profit')} ({currency})</Label>
                        <Input
                            type="number"
                            value={targetProfit}
                            onChange={(e) => setTargetProfit(Number(e.target.value))}
                            className="text-lg font-semibold"
                        />
                    </div>
                    <Button onClick={handleCalculate} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                        {t('wizard.calculate')}
                    </Button>
                </div>

                {result && (
                    <div className={`p-4 rounded-lg border ${result.isFeasible ? 'bg-white border-indigo-100' : 'bg-red-50 border-red-200'}`}>
                        {!result.isFeasible ? (
                            <div className="text-red-600 font-semibold">{result.notes[0]}</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                <div>
                                    <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-1">
                                        <DollarSign className="w-4 h-4" /> {t('dashboard.required_revenue')}
                                    </div>
                                    <div className="text-2xl font-bold text-indigo-600 font-mono">
                                        {format(result.targetRevenue)}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-1">
                                        <Users className="w-4 h-4" /> {t('dashboard.required_customers')}
                                    </div>
                                    <div className="text-2xl font-bold text-indigo-600 font-mono">
                                        {Math.ceil(result.requiredCustomers)}
                                    </div>
                                    <div className="text-xs text-muted-foreground font-mono">
                                        ({format(data.pricing.amount)} / {t('revenue.unit')})
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-1">
                                        <TrendingUp className="w-4 h-4" /> {t('wizard.marketing_budget')}
                                    </div>
                                    <div className="text-2xl font-bold text-purple-600 font-mono">
                                        {format(result.marketingBudget)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
