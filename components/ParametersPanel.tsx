"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Settings, DollarSign, TrendingUp, Percent, RefreshCw } from "lucide-react";
import { FinancialParameters } from "@/lib/engine/types";

interface ParametersPanelProps {
    parameters: FinancialParameters;
    onParametersChange: (params: FinancialParameters) => void;
    onRecalculate?: () => void;
}

export function ParametersPanel({ parameters, onParametersChange, onRecalculate }: ParametersPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleChange = (key: keyof FinancialParameters, value: number) => {
        onParametersChange({
            ...parameters,
            [key]: value
        });
    };

    return (
        <Card className="border-t-4 border-t-blue-500 shadow-lg bg-gradient-to-br from-blue-50/50 to-slate-50 dark:from-blue-950/20 dark:to-slate-900">
            <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                Finansal Parametreler
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Dolar kuru, enflasyon ve diğer makro değişkenler
                            </CardDescription>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                    >
                        {isExpanded ? "Gizle" : "Göster"}
                    </Button>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="space-y-6 pt-0">
                    {/* Currency Rates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* USD Rate */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <Label className="font-semibold">Dolar Kuru (USD/TRY)</Label>
                            </div>
                            <Input
                                type="number"
                                step="0.01"
                                min="1"
                                max="100"
                                value={parameters.usdRate}
                                onChange={(e) => handleChange('usdRate', parseFloat(e.target.value) || 0)}
                                className="text-lg font-semibold"
                            />
                            <p className="text-xs text-muted-foreground">
                                USD cinsinden giderler bu kurdan TRY'ye çevrilir
                            </p>
                        </div>

                        {/* EUR Rate */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-blue-600" />
                                <Label className="font-semibold">Euro Kuru (EUR/TRY)</Label>
                            </div>
                            <Input
                                type="number"
                                step="0.01"
                                min="1"
                                max="100"
                                value={parameters.eurRate}
                                onChange={(e) => handleChange('eurRate', parseFloat(e.target.value) || 0)}
                                className="text-lg font-semibold"
                            />
                            <p className="text-xs text-muted-foreground">
                                EUR cinsinden giderler bu kurdan TRY'ye çevrilir
                            </p>
                        </div>
                    </div>

                    {/* Inflation Rate */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-orange-600" />
                                <Label className="font-semibold">Yıllık Enflasyon Oranı</Label>
                            </div>
                            <span className="text-2xl font-bold text-orange-600">
                                %{(parameters.inflationRate * 100).toFixed(0)}
                            </span>
                        </div>
                        <Slider
                            value={[parameters.inflationRate * 100]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(val) => handleChange('inflationRate', val[0] / 100)}
                            className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                            Tüm giderler aylık enflasyon oranına göre artırılır
                        </p>
                    </div>

                    {/* Salary Increase Rate */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-purple-600" />
                                <Label className="font-semibold">Yıllık Maaş Artış Oranı</Label>
                            </div>
                            <span className="text-2xl font-bold text-purple-600">
                                %{(parameters.salaryIncreaseRate * 100).toFixed(0)}
                            </span>
                        </div>
                        <Slider
                            value={[parameters.salaryIncreaseRate * 100]}
                            min={0}
                            max={50}
                            step={1}
                            onValueChange={(val) => handleChange('salaryIncreaseRate', val[0] / 100)}
                            className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                            Personel maaşları her yıl bu oranda artırılır
                        </p>
                    </div>

                    {/* Tax Rate */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Percent className="w-4 h-4 text-red-600" />
                                <Label className="font-semibold">Kurumlar Vergisi Oranı</Label>
                            </div>
                            <span className="text-2xl font-bold text-red-600">
                                %{(parameters.taxRate * 100).toFixed(0)}
                            </span>
                        </div>
                        <Slider
                            value={[parameters.taxRate * 100]}
                            min={0}
                            max={50}
                            step={1}
                            onValueChange={(val) => handleChange('taxRate', val[0] / 100)}
                            className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                            Pozitif kâr üzerinden hesaplanan vergi oranı
                        </p>
                    </div>

                    {/* Recalculate Button */}
                    {onRecalculate && (
                        <div className="pt-4 border-t">
                            <Button
                                onClick={onRecalculate}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                size="lg"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Yeniden Hesapla
                            </Button>
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                            <strong>💡 İpucu:</strong> Parametreleri değiştirdiğinizde tüm hesaplamalar otomatik güncellenir.
                            Dolar kuru değiştiğinde USD cinsinden giderler, enflasyon değiştiğinde tüm maliyetler yeniden hesaplanır.
                        </p>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
