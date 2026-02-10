
"use client";

import { useFinancialStore } from "@/lib/store";
import { BENCHMARKS } from "@/lib/engine/benchmarks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { generateFinancialModel } from "@/lib/engine/financials";
import { Info } from "lucide-react";

export function BenchmarkCard() {
    const { data } = useFinancialStore();

    // Calculate current metrics
    const results = generateFinancialModel(data);
    const totalRevenue = results.summary.totalRevenue;
    const grossProfit = results.monthly.reduce((sum, m) => sum + m.grossProfit, 0);
    const currentGrossMargin = totalRevenue > 0 ? grossProfit / totalRevenue : 0;

    let marketingSpend = 0;
    if (data.marketing.type === 'percentage') marketingSpend = data.marketing.value;
    else if (totalRevenue > 0) marketingSpend = (data.marketing.value * 12) / totalRevenue;

    // Get benchmarks for sector
    const sector = (data.sector as keyof typeof BENCHMARKS) || 'Other';
    const bench = BENCHMARKS[sector] || BENCHMARKS['Other'];

    const getStatusColor = (val: number, range: number[]) => {
        if (val >= range[0] && val <= range[1]) return "bg-green-500"; // Excellent
        if (val > range[1] * 1.2 || val < range[0] * 0.8) return "bg-red-500"; // Too high/low
        return "bg-yellow-500"; // Ok but could be better
    };

    const getStatusText = (val: number, range: number[]) => {
        if (val >= range[0] && val <= range[1]) return "Sektör Ortalamasında ✅";
        if (val < range[0]) return "Ortalamanın Altında ⚠️";
        return "Ortalamanın Üstünde 🚀";
    };

    return (
        <Card className="shadow-md border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    Sektör Karşılaştırması ({sector})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Gross Margin Benchmark */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Brüt Kâr Marjı</span>
                        <span className="font-bold">%{(currentGrossMargin * 100).toFixed(0)}</span>
                    </div>
                    <Progress value={currentGrossMargin * 100} className="h-2" indicatorClassName={getStatusColor(currentGrossMargin, bench.grossMargin)} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Hedef: %{(bench.grossMargin[0] * 100).toFixed(0)}-{(bench.grossMargin[1] * 100).toFixed(0)}</span>
                        <span>{getStatusText(currentGrossMargin, bench.grossMargin)}</span>
                    </div>
                </div>

                {/* Marketing Benchmark */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Pazarlama / Ciro</span>
                        <span className="font-bold">%{(marketingSpend * 100).toFixed(0)}</span>
                    </div>
                    {/* For marketing, higher is not always better but usually within range is good */}
                    <Progress value={marketingSpend * 100} className="h-2" indicatorClassName={getStatusColor(marketingSpend, bench.marketingSpend)} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Hedef: %{(bench.marketingSpend[0] * 100).toFixed(0)}-{(bench.marketingSpend[1] * 100).toFixed(0)}</span>
                        <span>{getStatusText(marketingSpend, bench.marketingSpend)}</span>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
