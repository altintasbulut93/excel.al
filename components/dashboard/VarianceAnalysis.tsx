"use client";

import { useState, useEffect } from "react";
import { MonthlyFinancialResult } from "@/lib/engine/types";
import { supabase } from "@/lib/supabase"; // Corrected path
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Save, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";
import { useFormat } from "@/hooks/use-format";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface VarianceAnalysisProps {
    modelId: string;
    forecast: MonthlyFinancialResult[];
}

interface ActualData {
    month: number;
    revenue: number;
    expenses: number;
    burn: number; // Net Income (negative)
    cash: number;
}

export function VarianceAnalysis({ modelId, forecast }: VarianceAnalysisProps) {
    const { t } = useLanguage();
    const { format } = useFormat();
    const [actuals, setActuals] = useState<Record<number, ActualData>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!modelId) return;

        async function loadActuals() {
            setLoading(true);
            if (!supabase) {
                setLoading(false);
                return;
            }
            const { data, error } = await supabase
                .from('monthly_actuals')
                .select('*')
                .eq('model_id', modelId);

            if (data) {
                const map: Record<number, ActualData> = {};
                data.forEach((row: any) => {
                    map[row.month] = {
                        month: row.month,
                        revenue: row.revenue || 0,
                        expenses: (row.cogs || 0) + (row.marketing_spend || 0) + (row.personnel_cost || 0) + (row.other_expenses || 0),
                        burn: row.net_income || 0,
                        cash: row.cash_balance || 0
                    };
                });
                setActuals(map);
            }
            setLoading(false);
        }

        loadActuals();
    }, [modelId]);

    const handleSave = async (month: number) => {
        if (!modelId) return;
        setSaving(true);
        const current = actuals[month];

        if (!supabase) return;

        // Upsert
        const { error } = await supabase
            .from('monthly_actuals')
            .upsert({
                model_id: modelId,
                month: month,
                revenue: current.revenue,
                net_income: current.burn,
                cash_balance: current.cash,
                updated_at: new Date().toISOString()
            }, { onConflict: 'model_id, month' });

        setSaving(false);
    };

    const updateActual = (month: number, field: keyof ActualData, value: number) => {
        setActuals(prev => ({
            ...prev,
            [month]: {
                ...prev[month],
                month,
                [field]: value
            }
        }));
    };

    // Prepare Comparison Data for Chart
    const chartData = forecast.slice(0, 12).map(f => {
        const actual = actuals[f.month];
        return {
            month: f.month,
            ForecastRevenue: f.revenue,
            ActualRevenue: actual?.revenue || 0,
            ForecastBurn: Math.abs(f.netIncome < 0 ? f.netIncome : 0),
            ActualBurn: actual ? Math.abs(actual.burn < 0 ? actual.burn : 0) : 0
        };
    });

    if (loading) return <div>Loading...</div>;

    return (
        <Card className="w-full shadow-lg border-slate-200 dark:border-slate-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                    {t('dashboard.variance.title') || "Actuals vs Forecast"}
                </CardTitle>
                <CardDescription>
                    {t('dashboard.variance.desc') || "Compare your realized performance against the financial model plan."}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">

                {/* Visual Comparison */}
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} />
                            <YAxis tickFormatter={(val) => `${val / 1000}k`} tickLine={false} axisLine={false} />
                            <Tooltip
                                formatter={(val: any) => format(Number(val))}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            <Bar dataKey="ForecastRevenue" name="Forecast Rev" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="ActualRevenue" name="Actual Rev" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Data Entry Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900">
                            <TableRow>
                                <TableHead className="w-[80px]">{t('dashboard.month')}</TableHead>
                                <TableHead>{t('dashboard.revenue')} (Act vs Fcst)</TableHead>
                                <TableHead>{t('dashboard.net_income')} (Act vs Fcst)</TableHead>
                                <TableHead className="text-right">{t('common.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {forecast.slice(0, 12).map((f) => {
                                const act = actuals[f.month] || { revenue: 0, burn: 0, cash: 0 };
                                const revVar = act.revenue - f.revenue;
                                const burnVar = act.burn - f.netIncome;

                                return (
                                    <TableRow key={f.month}>
                                        <TableCell className="font-medium">Month {f.month}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <Input
                                                    type="number"
                                                    value={act.revenue || ''}
                                                    onChange={(e) => updateActual(f.month, 'revenue', Number(e.target.value))}
                                                    className="w-28 h-8 font-mono text-right"
                                                    placeholder="0"
                                                />
                                                <div className="text-xs text-muted-foreground w-24 text-right">
                                                    <div>Fcst: {format(f.revenue)}</div>
                                                    <div className={revVar >= 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                                                        {revVar > 0 ? "+" : ""}{format(revVar)}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <Input
                                                    type="number"
                                                    value={act.burn || ''}
                                                    onChange={(e) => updateActual(f.month, 'burn', Number(e.target.value))}
                                                    className="w-28 h-8 font-mono text-right"
                                                    placeholder="0"
                                                />
                                                <div className="text-xs text-muted-foreground w-24 text-right">
                                                    <div>Fcst: {format(f.netIncome)}</div>
                                                    <div className={burnVar >= 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                                                        {burnVar > 0 ? "+" : ""}{format(burnVar)}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSave(f.month)}
                                                disabled={saving}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Save className="w-4 h-4 text-blue-600" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
