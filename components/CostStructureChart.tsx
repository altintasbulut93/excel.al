"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Layers, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

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

    // Chart data
    const chartData = [
        { name: 'Sabit Giderler', value: totalFixed, percentage: fixedPercentage },
        { name: 'Değişken Giderler', value: totalVariable, percentage: variablePercentage }
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
                            Gider Yapısı Analizi
                        </CardTitle>
                        <CardDescription>
                            Sabit ve değişken gider dağılımı
                        </CardDescription>
                    </div>
                    {isHealthy ? (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Ölçeklenebilir
                        </Badge>
                    ) : (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Yüksek Sabit Gider
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
                            Toplam Gider
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(totalCosts)}
                        </p>
                    </div>

                    {/* Fixed Costs */}
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-xs font-medium text-red-600 dark:text-red-400 uppercase mb-1">
                            Sabit Giderler
                        </p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                            {formatCurrency(totalFixed)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            %{fixedPercentage.toFixed(1)} oranında
                        </p>
                    </div>

                    {/* Variable Costs */}
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase mb-1">
                            Değişken Giderler
                        </p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {formatCurrency(totalVariable)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            %{variablePercentage.toFixed(1)} oranında
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
                                label={({ name, percentage }) => `${name}: %${percentage.toFixed(1)}`}
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
                                                    <strong>Tutar:</strong> {formatCurrency(data.value)}
                                                </p>
                                                <p className="text-xs">
                                                    <strong>Oran:</strong> %{data.percentage.toFixed(1)}
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
                            Sabit Giderler
                        </h4>
                        <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
                            <li className="flex items-start gap-2">
                                <span className="text-red-500">•</span>
                                <span><strong>Personel Maaşları:</strong> Satıştan bağımsız, her ay ödenen</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500">•</span>
                                <span><strong>Ofis Kirası:</strong> Sabit aylık kira</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500">•</span>
                                <span><strong>Yazılım Abonelikleri:</strong> SaaS araçlar</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500">•</span>
                                <span><strong>Sigorta & Muhasebe:</strong> Zorunlu giderler</span>
                            </li>
                        </ul>
                    </div>

                    {/* Variable Costs Breakdown */}
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            Değişken Giderler
                        </h4>
                        <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                            <li className="flex items-start gap-2">
                                <span className="text-green-500">•</span>
                                <span><strong>COGS:</strong> Satılan ürünün maliyeti</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500">•</span>
                                <span><strong>Komisyonlar:</strong> Satış bazlı ödemeler</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500">•</span>
                                <span><strong>Pazarlama (Değişken):</strong> Performans bazlı reklamlar</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500">•</span>
                                <span><strong>Ödeme İşlem Ücretleri:</strong> Stripe, PayPal vb.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Analysis & Recommendations */}
                <div className={`p-4 rounded-lg border ${isHealthy ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' : 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'}`}>
                    <h4 className={`font-semibold mb-2 flex items-center gap-2 ${isHealthy ? 'text-green-900 dark:text-green-100' : 'text-orange-900 dark:text-orange-100'}`}>
                        {isHealthy ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        Analiz & Öneriler
                    </h4>
                    {isHealthy ? (
                        <div className="text-sm text-green-800 dark:text-green-200 space-y-2">
                            <p>
                                ✅ <strong>Sağlıklı gider yapısı!</strong> Sabit giderleriniz %{fixedPercentage.toFixed(0)} seviyesinde,
                                bu ölçeklenebilir bir yapı anlamına gelir.
                            </p>
                            <p>
                                💡 Satışlarınız arttıkça değişken giderler de artacak ama sabit giderler aynı kalacağı için
                                kâr marjınız yükselecek.
                            </p>
                        </div>
                    ) : (
                        <div className="text-sm text-orange-800 dark:text-orange-200 space-y-2">
                            <p>
                                ⚠️ <strong>Dikkat!</strong> Sabit giderleriniz %{fixedPercentage.toFixed(0)} seviyesinde,
                                bu ölçeklenebilirliği zorlaştırabilir.
                            </p>
                            <p>
                                💡 <strong>Öneriler:</strong>
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Bazı sabit giderleri değişken hale getirin (örn: freelancer kullanımı)</li>
                                <li>Ofis yerine remote çalışma modeli düşünün</li>
                                <li>Satış bazlı komisyon sistemine geçin</li>
                                <li>Bulut maliyetlerini kullanıma göre ölçeklendirin</li>
                            </ul>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
