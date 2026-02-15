"use client";

import { useFinancialStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Plus, Trash2, Eraser } from "lucide-react";
import { RevenueItem } from "@/lib/engine/types";
import { useLanguage } from "@/lib/i18n-context";

// Helper for Number Formatting (1.000.000 format)
const FormattedNumberInput = ({
    value,
    onChange,
    placeholder = "0",
    max = 1000000000,
    className
}: {
    value: number,
    onChange: (v: number) => void,
    placeholder?: string,
    max?: number,
    className?: string
}) => {
    const displayValue = value === 0 ? '' : new Intl.NumberFormat('tr-TR').format(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
        if (raw === '') {
            onChange(0);
            return;
        }
        let num = parseInt(raw, 10);
        if (isNaN(num)) num = 0;
        if (num > max) num = max;
        onChange(num);
    };

    return (
        <Input
            type="text"
            value={displayValue}
            onChange={handleChange}
            placeholder={placeholder}
            className={className}
        />
    );
};

export function Step2Revenue() {
    const { data, setData, setStep } = useFinancialStore();
    const { t } = useLanguage();

    // Initialize from store or create default item
    const [items, setItems] = useState<RevenueItem[]>(
        data.revenueItems && data.revenueItems.length > 0
            ? data.revenueItems
            : [{
                id: crypto.randomUUID(),
                name: t('wizard.main_product'),
                type: 'one_time',
                price: 0,
                currency: 'TRY',
                initialCustomers: 0,
                monthlyGrowthRate: 0.10, // %10 default
                churnRate: 0.05,
                cogsPercentage: 0.40, // Default 40% COGS for products
                returnRate: 0.05,
                shippingCost: 0
            }]
    );

    const REVENUE_TYPES = [
        { value: 'subscription', label: t('wizard.sect_saas') },
        { value: 'one_time', label: t('wizard.table_type') },
        { value: 'service', label: t('wizard.sect_service') },
        { value: 'commission', label: t('common.processing') } // Placeholder if no direct label
    ];

    // Update store whenever items change
    useEffect(() => {
        // Calculate aggregates for backward compatibility
        const totalInitial = items.reduce((sum, i) => sum + i.initialCustomers, 0);
        const avgGrowth = items.length > 0 ? items.reduce((sum, i) => sum + i.monthlyGrowthRate, 0) / items.length : 0;
        const mainItem = items[0] || { price: 0, type: 'one_time' };

        setData({
            revenueItems: items,
            // Legacy fallbacks
            growth: { initialCustomers: totalInitial, monthlyGrowthRate: avgGrowth },
            pricing: { amount: mainItem.price, currency: 'TRY', period: 'monthly' },
            revenueModel: items.length > 1 ? 'hybrid' : mainItem.type
        });
    }, [items, setData]);

    const handleAddItem = () => {
        setItems([...items, {
            id: crypto.randomUUID(),
            name: `${t('wizard.add_item')} ${items.length + 1}`,
            type: 'one_time',
            price: 0,
            currency: 'TRY',
            initialCustomers: 0,
            monthlyGrowthRate: 0.05,
            churnRate: 0.05,
            cogsPercentage: 0.40,
            returnRate: 0.05,
            shippingCost: 0
        }]);
    };

    const handleRemoveItem = (id: string) => {
        if (items.length === 1) {
            handleClearAll();
            return;
        }
        setItems(items.filter(i => i.id !== id));
    };

    const handleClearAll = () => {
        setItems([{
            id: crypto.randomUUID(),
            name: t('wizard.add_item'), // Default name
            type: 'one_time',
            price: 0,
            currency: 'TRY',
            initialCustomers: 0,
            monthlyGrowthRate: 0.05,
            churnRate: 0.05,
            cogsPercentage: 0.40,
            returnRate: 0.05,
            shippingCost: 0
        }]);
    };

    const updateItem = (id: string, field: keyof RevenueItem, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(0);

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-xl border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4 bg-muted/20">
                <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {t('wizard.step2_title')}
                    </CardTitle>
                    <CardDescription>
                        {t('wizard.step2_desc')}
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={handleClearAll} className="h-8">
                        <Eraser className="w-4 h-4 mr-2" />
                        {t('wizard.clear_table')}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-x-auto pb-4">
                    <table className="w-full min-w-[1200px] text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 min-w-[150px]">{t('wizard.table_name')}</th>
                                <th className="px-4 py-3 min-w-[150px]">{t('wizard.table_type')}</th>
                                <th className="px-4 py-3 min-w-[120px]">{t('wizard.table_price')}</th>
                                <th className="px-4 py-3 min-w-[120px]">{t('wizard.table_initial')}</th>
                                <th className="px-4 py-3 min-w-[100px]">{t('wizard.table_growth')}</th>
                                {['ecommerce', 'retail', 'production', 'marketplace', 'e-ticaret', 'paryakende', 'perakende', 'üretim'].includes((data.sector || '').toLowerCase()) && (
                                    <>
                                        <th className="px-4 py-3 min-w-[100px]">COGS (%)</th>
                                        <th className="px-4 py-3 min-w-[100px]">{t('common.return_rate') || 'Return %'}</th>
                                        <th className="px-4 py-3 min-w-[100px]">{t('common.shipping') || 'Shipping'}</th>
                                    </>
                                )}
                                <th className="px-4 py-3 w-[50px]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {items.map((item, index) => (
                                <tr key={item.id} className="bg-background hover:bg-muted/30 transition-colors">
                                    <td className="p-3">
                                        <Input
                                            value={item.name}
                                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                            placeholder="Örn: Premium Paket"
                                            className="font-medium"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <Select
                                            value={item.type}
                                            onValueChange={(val: any) => updateItem(item.id, 'type', val)}
                                        >
                                            <SelectTrigger className="border-0 shadow-none bg-transparent hover:bg-muted">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {REVENUE_TYPES.map(t => (
                                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="p-3">
                                        <FormattedNumberInput
                                            value={item.price}
                                            onChange={(val) => updateItem(item.id, 'price', val)}
                                            placeholder="0"
                                            className="text-right font-mono"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <FormattedNumberInput
                                            value={item.initialCustomers}
                                            onChange={(val) => updateItem(item.id, 'initialCustomers', val)}
                                            placeholder="0"
                                            className="text-right font-mono"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                value={Math.round(item.monthlyGrowthRate * 100)}
                                                onChange={(e) => updateItem(item.id, 'monthlyGrowthRate', Number(e.target.value) / 100)}
                                                className="pr-6 text-right"
                                                step={1}
                                            />
                                            <span className="absolute right-3 top-2.5 text-xs font-bold text-muted-foreground">%</span>
                                        </div>
                                    </td>
                                    {['ecommerce', 'retail', 'production', 'marketplace', 'e-ticaret', 'paryakende', 'perakende', 'üretim'].includes((data.sector || '').toLowerCase()) && (
                                        <>
                                            <td className="p-3">
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        value={Math.round((item.cogsPercentage || 0) * 100)}
                                                        onChange={(e) => updateItem(item.id, 'cogsPercentage', Number(e.target.value) / 100)}
                                                        className="pr-6 text-right"
                                                        step={1}
                                                        placeholder="40"
                                                    />
                                                    <span className="absolute right-3 top-2.5 text-xs font-bold text-muted-foreground">%</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        value={Math.round((item.returnRate || 0) * 100)}
                                                        onChange={(e) => updateItem(item.id, 'returnRate', Number(e.target.value) / 100)}
                                                        className="pr-6 text-right"
                                                        step={1}
                                                        placeholder="5"
                                                    />
                                                    <span className="absolute right-3 top-2.5 text-xs font-bold text-muted-foreground">%</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <FormattedNumberInput
                                                    value={item.shippingCost || 0}
                                                    onChange={(val) => updateItem(item.id, 'shippingCost', val)}
                                                    placeholder="0"
                                                    className="text-right font-mono"
                                                />
                                            </td>
                                        </>
                                    )}
                                    <td className="p-3 text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-destructive"
                                            onClick={() => handleRemoveItem(item.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t bg-muted/10 flex justify-center">
                    <Button onClick={handleAddItem} variant="outline" className="border-dashed border-2 w-full max-w-md hover:bg-white hover:border-primary text-muted-foreground hover:text-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('wizard.add_item')}
                    </Button>
                </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t p-6 bg-muted/20">
                <Button variant="ghost" onClick={handleBack} size="lg">&larr; {t('common.back')}</Button>
                <div className="flex flex-col items-end">
                    <Button onClick={handleNext} size="lg" className="px-8 bg-primary hover:bg-primary/90">
                        {t('common.continue')} &rarr;
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                        {t('wizard.auto_calc_note')}
                    </p>
                </div>
            </CardFooter>
        </Card>
    );
}
