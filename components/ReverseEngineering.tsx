
"use client";

import { useState } from "react";
import { useFinancialStore } from "@/lib/store";
import { calculateReverseGoal } from "@/lib/engine/reverse-engineer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Target, TrendingUp, Users, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function ReverseEngineeringTool() {
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
                    <Target className="w-6 h-6" /> Hedef Analizi (Tersine Mühendislik)
                </CardTitle>
                <CardDescription>
                    Aylık ulaşmak istediğiniz **Net Kâr** miktarını girin, gereken satış adedini hesaplayalım.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <Label>Aylık Hedef Net Kâr (TL)</Label>
                        <Input
                            type="number"
                            value={targetProfit}
                            onChange={(e) => setTargetProfit(Number(e.target.value))}
                            className="text-lg font-semibold"
                        />
                    </div>
                    <Button onClick={handleCalculate} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                        Hesapla
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
                                        <DollarSign className="w-4 h-4" /> Gereken Ciro
                                    </div>
                                    <div className="text-2xl font-bold text-indigo-600">
                                        {formatCurrency(result.targetRevenue)}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-1">
                                        <Users className="w-4 h-4" /> Müşteri / Satış Adedi
                                    </div>
                                    <div className="text-2xl font-bold text-indigo-600">
                                        {Math.ceil(result.requiredCustomers)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        ({formatCurrency(data.pricing.amount)} / adet)
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-1">
                                        <TrendingUp className="w-4 h-4" /> Ayrılacak Pazarlama
                                    </div>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {formatCurrency(result.marketingBudget)}
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
