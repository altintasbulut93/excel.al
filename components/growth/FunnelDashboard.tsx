"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { SalesFunnel } from "@/lib/engine/types";
import { formatCurrency } from "@/lib/utils";
import { ArrowDown, Users, CheckCircle, Target } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { useLanguage } from "@/lib/i18n-context";

interface FunnelVisualizerProps {
    funnel: SalesFunnel;
    visits: number;
    leads: number;
    onChange: (funnel: SalesFunnel) => void;
    isB2C?: boolean;
}

export function FunnelVisualizer({ funnel, visits, leads, onChange, isB2C = false }: FunnelVisualizerProps) {
    const { t } = useLanguage();

    const sqls = Math.round(leads * funnel.leadToSQL);
    const deals = Math.round(sqls * funnel.sqlToDeal);

    const data = [
        { name: t('dashboard.growth_tab.funnel.visits'), value: visits, color: "#94a3b8" },
        { name: isB2C ? (t('dashboard.growth_tab.funnel.carts') || 'Add to Carts') : t('dashboard.growth_tab.funnel.leads'), value: leads, color: "#60a5fa" },
        { name: isB2C ? (t('dashboard.growth_tab.funnel.checkouts') || 'Checkouts') : t('dashboard.growth_tab.funnel.opportunities'), value: sqls, color: "#a78bfa" },
        { name: isB2C ? (t('dashboard.growth_tab.funnel.purchases') || 'Purchases') : t('dashboard.growth_tab.funnel.deals'), value: deals, color: "#34d399" },
    ];

    const updateFunnel = (field: keyof SalesFunnel, value: number) => {
        onChange({ ...funnel, [field]: value });
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    {t('dashboard.growth_tab.funnel.title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">

                {/* Visual Chart */}
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 30 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px' }} />
                            <Bar dataKey="value" barSize={32} radius={[0, 4, 4, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Controls */}
                <div className="grid gap-6 px-2">
                    {/* Leads -> SQL */}
                    <div className="space-y-4 relative pl-8 border-l-2 border-dashed border-blue-200">
                        <div className="absolute -left-[9px] top-0 bg-blue-100 rounded-full p-1">
                            <ArrowDown className="w-3 h-3 text-blue-600" />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-700">
                                {isB2C ? (t('dashboard.growth_tab.funnel.cart_to_checkout') || 'Cart -> Checkout') : t('dashboard.growth_tab.funnel.lead_to_sql')}
                            </span>
                            <span className="text-sm font-bold text-blue-600">%{(funnel.leadToSQL * 100).toFixed(0)}</span>
                        </div>
                        <Slider
                            value={[funnel.leadToSQL * 100]}
                            min={1}
                            max={100}
                            step={1}
                            onValueChange={([val]) => updateFunnel('leadToSQL', val / 100)}
                            className="py-1"
                        />
                        <p className="text-xs text-muted-foreground">
                            {t('dashboard.growth_tab.funnel.lead_to_sql_desc', { count: Math.round(funnel.leadToSQL * 100) })}
                        </p>
                    </div>

                    {/* SQL -> Deal */}
                    <div className="space-y-4 relative pl-8 border-l-2 border-dashed border-green-200">
                        <div className="absolute -left-[9px] top-0 bg-green-100 rounded-full p-1">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-700">
                                {isB2C ? (t('dashboard.growth_tab.funnel.checkout_to_purchase') || 'Checkout -> Purchase') : t('dashboard.growth_tab.funnel.sql_to_deal')}
                            </span>
                            <span className="text-sm font-bold text-green-600">%{(funnel.sqlToDeal * 100).toFixed(0)}</span>
                        </div>
                        <Slider
                            value={[funnel.sqlToDeal * 100]}
                            min={1}
                            max={100}
                            step={1}
                            onValueChange={([val]) => updateFunnel('sqlToDeal', val / 100)}
                            className="py-1"
                        />
                        <p className="text-xs text-muted-foreground">
                            {t('dashboard.growth_tab.funnel.sql_to_deal_desc', { count: Math.round(funnel.sqlToDeal * 100) })}
                        </p>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
