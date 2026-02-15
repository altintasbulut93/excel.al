
"use client";

import { useEffect, useState } from "react";
import { FinancialModelResult } from "@/lib/engine/types";
import { analyzeFinancialHealth, Advice } from "@/lib/engine/ai-coach";
import { Card } from "@/components/ui/card";
import { Sparkles, AlertTriangle, CheckCircle, Zap, ArrowRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n-context";

interface AICoachPanelProps {
    results: FinancialModelResult;
}

export function AICoachPanel({ results }: AICoachPanelProps) {
    const { t } = useLanguage();
    const [adviceList, setAdviceList] = useState<Advice[]>([]);
    const [activeAdviceIndex, setActiveAdviceIndex] = useState(0);

    useEffect(() => {
        if (results) {
            const analysis = analyzeFinancialHealth(results);
            setAdviceList(analysis);
        }
    }, [results]);

    // Auto-rotate advice
    useEffect(() => {
        if (adviceList.length === 0) return;
        const interval = setInterval(() => {
            setActiveAdviceIndex((prev) => (prev + 1) % adviceList.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [adviceList]);

    if (!adviceList.length) return null;

    const activeItem = adviceList[activeAdviceIndex];

    const getIcon = (type: Advice['type']) => {
        switch (type) {
            case 'critical': return <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />;
            case 'warning': return <Activity className="w-5 h-5 text-amber-400" />;
            case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
            case 'opportunity': return <Zap className="w-5 h-5 text-blue-400" />;
            default: return <Sparkles className="w-5 h-5 text-purple-400" />;
        }
    };

    const getColor = (type: Advice['type']) => {
        switch (type) {
            case 'critical': return "border-red-500/50 bg-red-950/10 shadow-red-500/20";
            case 'warning': return "border-amber-500/50 bg-amber-950/10 shadow-amber-500/20";
            case 'success': return "border-emerald-500/50 bg-emerald-950/10 shadow-emerald-500/20";
            case 'opportunity': return "border-blue-500/50 bg-blue-950/10 shadow-blue-500/20";
            default: return "border-indigo-500/50 bg-indigo-950/10 shadow-indigo-500/20";
        }
    };

    return (
        <div className="relative w-full perspective-1000 mb-8 font-sans">
            {/* Antigravity Container */}
            <div className={cn(
                "relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-700 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl",
                getColor(activeItem.type),
                "shadow-lg"
            )}>

                {/* Glowing Background Effect */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer" />

                <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-6 relative z-10">

                    {/* Left: AI Avatar / Icon */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/20 blur-lg rounded-full animate-pulse" />
                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-black border border-white/10 flex items-center justify-center shadow-inner">
                                {getIcon(activeItem.type)}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                AI CEO Assistant
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70">LIVE</span>
                            </h3>
                            <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                                {activeItem.title}
                            </div>
                        </div>
                    </div>

                    {/* Center: Live Action Advice */}
                    <div className="flex-1 text-center md:text-left">
                        <p className="text-lg font-medium text-slate-800 dark:text-slate-200 leading-relaxed animate-in fade-in slide-in-from-bottom-2 key={activeItem.id}">
                            "{activeItem.message}"
                        </p>
                        {activeItem.action && (
                            <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
                                <Zap className="w-3 h-3" />
                                {t('aicfo.recommendation') || "Öneri"}: {activeItem.action}
                            </div>
                        )}
                    </div>

                    {/* Right: Key Metric 3D Card */}
                    <div className="hidden md:block">
                        <div className="group relative w-32 h-20 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center justify-center transform transition-transform duration-500 hover:scale-105 hover:rotate-1">
                            <div className="text-xs text-muted-foreground uppercase">{t('common.metric') || "Metrik"}</div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{activeItem.metric || "-"}</div>

                            {/* Floating particles */}
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                        </div>
                    </div>

                </div>

                {/* Progress Bar for Auto-Rotate */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full opacity-50 animate-progress origin-left"
                    style={{ animationDuration: '8s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }} />
            </div>
        </div>
    );
}
