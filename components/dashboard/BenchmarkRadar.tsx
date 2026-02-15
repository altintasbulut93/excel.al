
"use client";

import { PureComponent } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getBenchmarks } from "@/lib/engine/benchmarks";
import { FinancialModelResult } from "@/lib/engine/types";

interface BenchmarkRadarProps {
    results: FinancialModelResult;
    sector: string;
}

export function BenchmarkRadar({ results, sector }: BenchmarkRadarProps) {
    const benchmarks = getBenchmarks(sector);

    // Calculate User Metrics (normalized roughly to 0-100 scale for radar)
    const summary = results.summary;
    const revenue = summary.totalRevenue || 1;

    // Example mapping
    // 1. Profit Margin (%) -> x100
    // Fix: Access dynamic property or calculate
    const margin = (summary as any).profitMargin ?? (summary.totalRevenue > 0 ? summary.totalProfit / summary.totalRevenue : 0);
    const profitScore = Math.min(Math.max(margin * 100, 0), 100);

    // 2. Growth (Monthly Avg) -> x1000? No, let's say 10% is 100 score? No, 10% is 10 score on chart.
    // Let's match scale of benchmark. Benchmark says Profit=20. So 20% margin = 20 score.

    // 3. Marketing Spend %
    const totalMarketing = results.monthly.reduce((acc, m) => acc + m.expenses.marketing, 0);
    const mktScore = Math.min((totalMarketing / revenue) * 100, 100);

    // Construct Data
    // We map benchmark keys to user values.
    // This is a simplification. Ideally proper mapping logic needed.
    const data = benchmarks.map(b => {
        let userVal = 50; // default

        if (b.subject.includes('Profit') || b.subject.includes('Kar')) userVal = profitScore;
        if (b.subject.includes('Marketing') || b.subject.includes('Pazarlama')) userVal = mktScore;
        if (b.subject.includes('Growth') || b.subject.includes('Büyüme')) userVal = 10; // Placeholder for growth rate calc

        return {
            subject: b.subject,
            A: b.A, // Benchmark
            B: userVal, // User
            fullMark: 100,
        };
    });

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center justify-between">
                    <span>Sektörel Radar (Benchmark)</span>
                    <span className="text-xs font-normal px-2 py-1 bg-slate-100 rounded text-slate-500 uppercase">{sector || 'Genel'}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Sektör Ortalaması"
                            dataKey="A"
                            stroke="#94a3b8"
                            fill="#94a3b8"
                            fillOpacity={0.3}
                        />
                        <Radar
                            name="Senin Girişimin"
                            dataKey="B"
                            stroke="#2563eb"
                            fill="#3b82f6"
                            fillOpacity={0.6}
                        />
                        <Legend />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
