"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Shield, Zap, Globe, Rocket } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PRICING_PLANS } from "@/lib/pricing-plans";
import { Badge } from "@/components/ui/badge";

interface PricingTableProps {
    onCheckout: (planFreq: 'monthly' | 'yearly', region: 'TR' | 'GLOBAL') => void;
    isLoading?: boolean;
}

export function PricingTable({ onCheckout, isLoading }: PricingTableProps) {
    const [isYearly, setIsYearly] = useState(true);
    const [region, setRegion] = useState<'TR' | 'GLOBAL'>('TR');

    const plans = PRICING_PLANS[region];
    const monthlyPrice = plans.monthly.amount;
    const yearlyPrice = plans.yearly.amount / 12; // Monthly equivalent

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-8">
                {/* Region Toggle */}
                <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <Button
                        variant={region === 'TR' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setRegion('TR')}
                        className="text-xs font-bold"
                    >
                        🇹🇷 Türkiye
                    </Button>
                    <Button
                        variant={region === 'GLOBAL' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setRegion('GLOBAL')}
                        className="text-xs font-bold"
                    >
                        🌍 Global
                    </Button>
                </div>

                {/* Period Toggle */}
                <div className="flex items-center space-x-4">
                    <Label htmlFor="period-switch" className={`text-sm font-medium ${!isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Monthly</Label>
                    <Switch
                        id="period-switch"
                        checked={isYearly}
                        onCheckedChange={setIsYearly}
                    />
                    <Label htmlFor="period-switch" className={`text-sm font-medium ${isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                        Yearly <span className="text-emerald-500 text-xs ml-1">(Save 20%)</span>
                    </Label>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-2 gap-8">

                {/* Free Plan */}
                <Card className="border-slate-200 shadow-sm relative overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-xl">Free / Starter</CardTitle>
                        <CardDescription>Yeni başlayan girişimler için</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">
                            {region === 'TR' ? '₺0' : '$0'}
                            <span className="text-sm font-normal text-muted-foreground">/mo</span>
                        </div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Temel Finansal Modelleme</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 3 Yıllık Projeksiyon</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> PDF İndirme</li>
                            <li className="flex items-center gap-2 opacity-50"><X className="w-4 h-4" /> AI Finans Koçu</li>
                            <li className="flex items-center gap-2 opacity-50"><X className="w-4 h-4" /> Sektör Benchmarkları</li>
                            <li className="flex items-center gap-2 opacity-50"><X className="w-4 h-4" /> Senaryo Analizi</li>
                            <li className="flex items-center gap-2 opacity-50"><X className="w-4 h-4" /> Excel/Yatırımcı Export</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full" disabled>Şu anki planınız</Button>
                    </CardFooter>
                </Card>

                {/* PRO Plan */}
                <Card className="border-indigo-500 border-2 shadow-xl relative overflow-hidden transform hover:scale-105 transition-transform duration-300">
                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs px-3 py-1 font-bold rounded-bl-lg">
                        POPULAR
                    </div>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-xl font-bold text-indigo-600">Pro / Growth</CardTitle>
                            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">AI Powered</Badge>
                        </div>
                        <CardDescription>Büyüyen şirketler ve yatırım arayanlar için</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-4xl font-bold">
                            {region === 'TR' ? '₺' : '$'}
                            {isYearly ? Math.round(yearlyPrice) : monthlyPrice}
                            <span className="text-sm font-normal text-muted-foreground">/mo</span>
                        </div>
                        {isYearly && (
                            <p className="text-xs text-emerald-600 font-medium">Billed annually ({region === 'TR' ? `₺${plans.yearly.amount}` : `$${plans.yearly.amount}`})</p>
                        )}

                        <ul className="space-y-2 text-sm font-medium">
                            <li className="flex items-center gap-2"><Check className="w-5 h-5 text-indigo-500" /> <span className="font-bold">Her Şey Dahil (Free Özellikleri)</span></li>
                            <li className="flex items-center gap-2"><Rocket className="w-4 h-4 text-indigo-500" /> <span className="font-bold">Antigravity AI Koçu</span></li>
                            <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-indigo-500" /> Sektör Benchmark Radarı</li>
                            <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-indigo-500" /> Sınırsız Senaryo & Simülasyon</li>
                            <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-indigo-500" /> Yatırımcı Uyumlu Excel Export</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 text-lg shadow-lg hover:shadow-indigo-500/50 transition-all"
                            onClick={() => onCheckout(isYearly ? 'yearly' : 'monthly', region)}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : 'Upgrade to Pro'}
                        </Button>
                    </CardFooter>
                </Card>

            </div>

            <p className="text-center text-xs text-muted-foreground mt-8">
                Secure payment via Stripe. Cancel anytime. 14-day money-back guarantee.
            </p>
        </div>
    );
}
