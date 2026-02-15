"use client";

import { useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Calendar, BarChart3, ShieldCheck, Download, History, Zap } from "lucide-react";
import { useFinancialStore } from "@/lib/store";
import { format } from "date-fns";
import { tr, enUS, de, es, fr, arSA, ptBR } from "date-fns/locale";
import { useLanguage } from "@/lib/i18n-context";
import { PricingTable } from "@/components/pricing/PricingTable";

interface SubscriptionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const dateLocales: Record<string, any> = {
    tr, en: enUS, de, es, fr, ar: arSA, pt: ptBR
};

export function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
    const { user, subscriptionTier } = useFinancialStore();
    const { t, language } = useLanguage();
    const currentLocale = dateLocales[language || 'en'] || enUS;

    // Mock Data based on Tier
    const isPro = subscriptionTier === 'pro' || subscriptionTier === 'enterprise';
    const planName = isPro
        ? (subscriptionTier === 'enterprise' ? t('profile.plan_enterprise') : t('profile.plan_pro'))
        : t('profile.plan_free');
    const nextBillingDate = isPro ? new Date(new Date().setMonth(new Date().getMonth() + 1)) : null;

    // Usage Limits (Mock)
    const reportLimit = isPro ? 100 : 3;
    const reportUsed = isPro ? 12 : 1;
    const usagePercentage = (reportUsed / reportLimit) * 100;

    // Payment History (Mock)
    const activeCurrency = useFinancialStore((state) => state.data.pricing?.currency || 'TRY');
    const history = isPro ? [
        { id: 'inv_001', date: '2025-01-15', amount: `299.00 ${activeCurrency}`, status: t('profile.paid') },
        { id: 'inv_002', date: '2024-12-15', amount: `299.00 ${activeCurrency}`, status: t('profile.paid') },
    ] : [];

    const [showPricing, setShowPricing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckout = async (planFreq: 'monthly' | 'yearly', region: 'TR' | 'GLOBAL') => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planFreq, region }),
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('Checkout failed:', data.error);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] bg-slate-50 dark:bg-slate-900 p-0 overflow-hidden gap-0 border-none shadow-2xl">

                {/* Header Gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldCheck className="w-32 h-32" />
                    </div>

                    <DialogHeader className="relative z-10 text-left flex flex-row justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                                    {planName}
                                </Badge>
                                {isPro && <Badge className="bg-amber-400 text-amber-900 hover:bg-amber-500 border-0">{t('profile.active_caps')}</Badge>}
                            </div>
                            <DialogTitle className="text-2xl font-bold tracking-tight text-white mb-1">
                                {user?.user_metadata?.full_name || user?.email || t('profile.user_profile')}
                            </DialogTitle>
                            <DialogDescription className="text-blue-100 flex items-center gap-2">
                                <span className="opacity-80">{user?.email}</span>
                            </DialogDescription>
                        </div>
                        {showPricing && (
                            <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => setShowPricing(false)}>
                                Back to Profile
                            </Button>
                        )}
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                    {showPricing ? (
                        <PricingTable onCheckout={handleCheckout} isLoading={isLoading} />
                    ) : (
                        <>
                            {/* Subscription Status Card */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {t('profile.subscription_status')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                                            {isPro ? t('profile.active') : t('profile.basic')}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {nextBillingDate
                                                ? `${t('profile.renewal')}: ${format(nextBillingDate, 'd MMMM yyyy', { locale: currentLocale })}`
                                                : t('profile.lifetime_free')}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <BarChart3 className="w-4 h-4" />
                                            {t('profile.remaining_reports')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-bold text-slate-900 dark:text-slate-100">{reportUsed} / {reportLimit}</span>
                                                <span className="text-muted-foreground text-xs">{usagePercentage.toFixed(0)}%</span>
                                            </div>
                                            <Progress value={usagePercentage} className="h-2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Features / Upgrade Callout */}
                            {!isPro && (
                                <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-xl p-4 flex items-start gap-4">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">{t('profile.upgrade_pro')}</h3>
                                        <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1 mb-3">
                                            {t('profile.upgrade_pro_desc')}
                                        </p>
                                        <Button
                                            size="sm"
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                                            onClick={() => setShowPricing(true)}
                                        >
                                            {t('profile.upgrade_now')}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Payment History */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <History className="w-4 h-4 text-slate-500" />
                                        {t('profile.payment_history')}
                                    </h3>
                                    {history.length > 0 && (
                                        <Button variant="ghost" size="sm" className="text-xs h-7">{t('profile.see_all')}</Button>
                                    )}
                                </div>

                                <div className="border rounded-lg overflow-hidden border-slate-200 dark:border-slate-800">
                                    <Table>
                                        <TableHeader className="bg-slate-50 dark:bg-slate-900">
                                            <TableRow>
                                                <TableHead className="w-[100px] text-xs">{t('profile.date')}</TableHead>
                                                <TableHead className="text-xs">{t('profile.amount')}</TableHead>
                                                <TableHead className="text-right text-xs">{t('profile.status')}</TableHead>
                                                <TableHead className="w-[40px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {history.length > 0 ? (
                                                history.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="font-medium text-xs text-slate-600">{item.date}</TableCell>
                                                        <TableCell className="text-xs font-bold">{item.amount}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200 font-normal py-0">
                                                                {item.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                <Download className="w-3 h-3 text-slate-400" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-6">
                                                        {t('profile.no_history')}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Account Actions */}
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                                <Button variant="outline" size="sm" className="text-muted-foreground hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors">
                                    {t('profile.delete_account')}
                                </Button>
                                <Button variant="default" size="sm" onClick={() => onOpenChange(false)}>
                                    {t('profile.close')}
                                </Button>
                            </div>
                        </>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    );
}
