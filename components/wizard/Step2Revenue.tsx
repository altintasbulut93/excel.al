
"use client";

import { useFinancialStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

export function Step2Revenue() {
    const { data, setData, setStep } = useFinancialStore();

    // Local state initialized from store
    const [revenueModel, setRevenueModel] = useState(data.revenueModel);
    const [price, setPrice] = useState(data.pricing.amount || 0);
    const [initialCustomers, setInitialCustomers] = useState(data.growth.initialCustomers || 0);
    const [growthRate, setGrowthRate] = useState(data.growth.monthlyGrowthRate * 100 || 10);

    const handleNext = () => {
        setData({
            revenueModel,
            pricing: { ...data.pricing, amount: price },
            growth: { initialCustomers, monthlyGrowthRate: growthRate / 100 }
        });
        setStep(2);
    };

    const handleBack = () => setStep(0);

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-primary/20">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Gelir Modeli & Büyüme</CardTitle>
                <CardDescription>Nasıl para kazanacaksınız ve ne kadar hızlı büyüyeceksiniz?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Revenue Model */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Gelir Modeli</Label>
                        <Select value={revenueModel} onValueChange={(val: any) => setRevenueModel(val)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="subscription">Abonelik (SaaS)</SelectItem>
                                <SelectItem value="one_time">Tek Seferlik Satış</SelectItem>
                                <SelectItem value="commission">Komisyon</SelectItem>
                                <SelectItem value="service">Hizmet Bedeli</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Ortalama Fiyat (TL)</Label>
                        <Input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            placeholder="0.00"
                            min="0"
                            max="1000000"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            {data.sector === 'SaaS' ? "💡 Ortalama SaaS: 200-1000 TL" : "Sektör ortalaması değişebilir"}
                        </p>
                    </div>
                </div>

                {/* Growth Assumptions */}
                <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold text-sm text-foreground/80">Büyüme Varsayımları</h4>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <Label>İlk Ay Müşteri Sayısı: <span className="text-primary font-bold">{initialCustomers}</span></Label>
                        </div>
                        <Slider
                            value={[initialCustomers]}
                            min={0}
                            max={1000}
                            step={5}
                            onValueChange={(val) => setInitialCustomers(val[0])}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <Label>Aylık Büyüme Hedefi: <span className="text-primary font-bold">%{growthRate}</span></Label>
                        </div>
                        <Slider
                            value={[growthRate]}
                            min={1}
                            max={50}
                            step={1}
                            onValueChange={(val) => setGrowthRate(val[0])}
                        />
                        <p className="text-xs text-muted-foreground">
                            {growthRate > 20 ? "⚠️ %20+ büyüme agresif bir hedeftir." : "✅ Makul bir büyüme oranı."}
                        </p>
                    </div>
                </div>

            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={handleBack}>&larr; Geri</Button>
                <Button onClick={handleNext} disabled={price <= 0} size="lg">Devam Et &rarr;</Button>
            </CardFooter>
        </Card>
    );
}
