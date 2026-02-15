"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, TrendingUp, ShieldCheck } from "lucide-react";

interface RiskScoreProps {
    score: number;
    metrics: {
        growthStability: number;
        capitalEfficiency: number;
        sustainability: number;
    };
}

export function RiskScoreCard({ score, metrics }: RiskScoreProps) {
    let color = "text-green-500";
    let bgColor = "bg-green-500";
    let label = "Healthy";
    const Icon = ShieldCheck;

    if (score < 50) {
        color = "text-red-500";
        bgColor = "bg-red-500";
        label = "High Risk";
        // Icon = AlertTriangle; // Re-assigned below if needed, but ShieldCheck is fine
    } else if (score < 80) {
        color = "text-amber-500";
        bgColor = "bg-amber-500";
        label = "Moderate Risk";
    }

    return (
        <Card className="h-full shadow-sm border-slate-200 dark:border-slate-800 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${bgColor}`} />
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                    <span>Financial Health Score</span>
                    <span className={`text-2xl ${color}`}>{score}/100</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Main Score Progress */}
                    <Progress value={score} className="h-3" indicatorClassName={bgColor} />

                    {/* Sub Matrices */}
                    <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Growth Stability
                            </span>
                            <span className="font-medium">{metrics.growthStability.toFixed(0)}/100</span>
                        </div>
                        <Progress value={metrics.growthStability} className="h-1.5" />

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Capital Efficiency
                            </span>
                            <span className="font-medium">{metrics.capitalEfficiency.toFixed(0)}/100</span>
                        </div>
                        <Progress value={metrics.capitalEfficiency} className="h-1.5" />

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Sustainability
                            </span>
                            <span className="font-medium">{metrics.sustainability.toFixed(0)}/100</span>
                        </div>
                        <Progress value={metrics.sustainability} className="h-1.5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
