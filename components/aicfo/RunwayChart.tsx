"use client";

import { useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MonthlyFinancials } from "@/lib/engine/types";

interface RunwayChartProps {
    data: MonthlyFinancials[];
    runwayMonths: number;
}

export function RunwayChart({ data, runwayMonths }: RunwayChartProps) {

    const chartData = useMemo(() => {
        return data.map(m => ({
            name: m.month,
            Cash: m.cashFlow.endingBalance,
            Burn: m.cashFlow.netCashFlow < 0 ? Math.abs(m.cashFlow.netCashFlow) : 0,
            Zero: 0
        }));
    }, [data]);

    const isCritical = runwayMonths < 6;
    const badgeColor = runwayMonths > 12 ? "bg-green-500" : runwayMonths > 6 ? "bg-amber-500" : "bg-red-500";
    const statusText = runwayMonths > 12 ? "Safe Runway" : runwayMonths > 6 ? "Caution" : "Critical Risk";

    return (
        <Card className="h-full shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        Runway Analysis
                    </CardTitle>
                    <CardDescription>Cash Survival Projection</CardDescription>
                </div>
                <Badge className={`${badgeColor} text-white hover:${badgeColor}`}>
                    {runwayMonths >= 18 ? "18+ Months" : `${runwayMonths} Months`}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorDanger" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                hide
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 3 }).format(value)}
                            />
                            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />

                            <Area
                                type="monotone"
                                dataKey="Cash"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorCash)"
                            />
                            {/* If we want to show Burn as a negative area or separate bar, we can. For now, keep it simple focusing on Cash balance */}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
