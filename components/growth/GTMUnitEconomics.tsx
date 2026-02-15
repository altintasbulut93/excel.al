"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { Activity, DollarSign, TrendingUp, Clock } from "lucide-react";

import { useLanguage } from "@/lib/i18n-context";
import { useFormat } from "@/hooks/use-format";

interface GTMUnitEconomicsProps {
    cac: number;
    ltv: number;
    paybackMonths: number;
}

export function GTMUnitEconomics({ cac, ltv, paybackMonths }: GTMUnitEconomicsProps) {
    const { t } = useLanguage();
    const { format } = useFormat();

    const ltvCacRatio = cac > 0 ? ltv / cac : 0;
    const isHealthy = ltvCacRatio >= 3;
    const isPaybackGood = paybackMonths <= 12;

    const ratioPercentage = Math.min((ltvCacRatio / 5) * 100, 100); // 5 is excellent

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CAC Card */}
            <Card className="bg-red-50 border-red-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-red-600">
                        {t('dashboard.growth_tab.cac_label_full')}
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-700">{format(cac)}</div>
                    <p className="text-xs text-red-600/80 mt-1">
                        {t('dashboard.growth_tab.cac_desc')}
                    </p>
                </CardContent>
            </Card>

            {/* LTV/CAC Ratio */}
            <Card className={isHealthy ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-green-700">
                        {t('dashboard.growth_tab.ltv_cac_ratio')}
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-700" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-800">{ltvCacRatio.toFixed(1)}x</div>
                    <Progress value={ratioPercentage} className="h-2 mt-2 bg-green-200" indicatorClassName={isHealthy ? "bg-green-600" : "bg-yellow-600"} />
                    <p className="text-xs text-green-700/80 mt-1">
                        {t('dashboard.growth_tab.target_3x')} ({isHealthy ? t('dashboard.growth_tab.currently_healthy') : t('dashboard.growth_tab.currently_improve')})
                    </p>
                </CardContent>
            </Card>

            {/* Payback Period */}
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-blue-700">
                        {t('dashboard.growth_tab.payback_label_full')}
                    </CardTitle>
                    <Clock className="h-4 w-4 text-blue-700" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-800">{paybackMonths.toFixed(1)} {t('dashboard.growth_tab.ay')}</div>
                    <p className="text-xs text-blue-700/80 mt-1">
                        {isPaybackGood ? t('dashboard.growth_tab.payback_good') : t('dashboard.growth_tab.payback_bad')}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
