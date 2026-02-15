"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Settings, DollarSign, TrendingUp, Percent, RefreshCw } from "lucide-react";
import { FinancialParameters } from "@/lib/engine/types";
import { useLanguage } from "@/lib/i18n-context";
import { useFinancialStore } from "@/lib/store";

interface ParametersPanelProps {
    parameters: FinancialParameters;
    onParametersChange: (params: FinancialParameters) => void;
    onRecalculate?: () => void;
    isRecalculating?: boolean;
}

export function ParametersPanel({ parameters, onParametersChange, onRecalculate, isRecalculating }: ParametersPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { t } = useLanguage();
    const { data, setData } = useFinancialStore();

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
                                {t('dashboard.param_title')}
                            </CardTitle>
                            <CardDescription className="text-sm">
                                {t('dashboard.param_desc')}
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
                        {isExpanded ? t('dashboard.hide') : t('dashboard.show')}
                    </Button>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="space-y-6 pt-0">
                    {/* Currency Rates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* USD Rate */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <Label className="font-semibold">{t('dashboard.usd_rate')}</Label>
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
                                {t('dashboard.usd_desc')}
                            </p>
                        </div>

                        {/* EUR Rate */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-blue-600" />
                                <Label className="font-semibold">{t('dashboard.eur_rate')}</Label>
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
                                {t('dashboard.eur_desc')}
                            </p>
                        </div>

                        {/* GBP Rate */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-purple-600" />
                                <Label className="font-semibold">{t('dashboard.gbp_rate')}</Label>
                            </div>
                            <Input
                                type="number"
                                step="0.01"
                                min="1"
                                max="100"
                                value={parameters.gbpRate}
                                onChange={(e) => handleChange('gbpRate', parseFloat(e.target.value) || 0)}
                                className="text-lg font-semibold"
                            />
                            <p className="text-xs text-muted-foreground">
                                {t('dashboard.gbp_desc')}
                            </p>
                        </div>
                    </div>

                    {/* Inflation Rate */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-orange-600" />
                                <Label className="font-semibold">{t('dashboard.annual_inflation')}</Label>
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
                            {t('dashboard.inflation_desc')}
                        </p>
                    </div>

                    {/* Salary Increase Rate */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-purple-600" />
                                <Label className="font-semibold">{t('dashboard.annual_salary_increase')}</Label>
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
                            {t('dashboard.salary_desc')}
                        </p>
                    </div>

                    {/* Tax Rate */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Percent className="w-4 h-4 text-red-600" />
                                <Label className="font-semibold">{t('dashboard.corporate_tax')}</Label>
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
                            {t('dashboard.tax_desc')}
                        </p>
                    </div>

                    {/* Recalculate Button */}
                    {onRecalculate && (
                        <div className="pt-4 border-t">
                            <Button
                                onClick={onRecalculate}
                                disabled={isRecalculating}
                                className={`w-full h-12 text-lg transition-all ${isRecalculating ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700 shadow-md active:scale-[0.98]"}`}
                                size="lg"
                            >
                                <RefreshCw className={`mr-2 h-5 w-5 ${isRecalculating ? "animate-spin" : ""}`} />
                                {isRecalculating ? t('dashboard.saving') : t('dashboard.recalculate')}
                            </Button>
                        </div>
                    )}

                    {/* Currency Selector Section */}
                    <div className="space-y-4 py-4 border-t border-blue-100 dark:border-blue-900/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-indigo-600" />
                                <Label className="font-semibold text-sm">{t('dashboard.currency_selector.title')}</Label>
                            </div>
                            <div className="flex gap-1.5">
                                {['TRY', 'USD', 'EUR', 'GBP'].map(curr => (
                                    <Button
                                        key={curr}
                                        variant={data.pricing.currency === curr ? "default" : "outline"}
                                        size="sm"
                                        disabled={isRecalculating}
                                        className={`h-7 px-3 text-xs font-bold transition-all ${data.pricing.currency === curr
                                            ? "bg-indigo-600 hover:bg-indigo-700 shadow-md scale-105"
                                            : "hover:bg-indigo-50 dark:hover:bg-indigo-900/40"
                                            }`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setData({ pricing: { ...data.pricing, currency: curr as any } });
                                            if (onRecalculate) onRecalculate();
                                        }}
                                    >
                                        {curr}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic leading-tight">
                            {t('dashboard.currency_selector.desc')}
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                            <strong>💡 {t('dashboard.param_tip')}:</strong> {t('dashboard.param_tip_desc')}
                        </p>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

