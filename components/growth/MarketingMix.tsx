"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MarketingChannel } from "@/lib/engine/types";
import { formatCurrency } from "@/lib/utils";
import { Megaphone, Search, MousePointer, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useLanguage } from "@/lib/i18n-context";
import { useFormat } from "@/hooks/use-format";

interface MarketingMixProps {
    channels: MarketingChannel[];
    onChange: (channels: MarketingChannel[]) => void;
}

export function MarketingMix({ channels, onChange }: MarketingMixProps) {
    const { t } = useLanguage();
    const { format, currency } = useFormat();

    const updateChannel = (id: string, field: keyof MarketingChannel, value: any) => {
        onChange(channels.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const addChannel = () => {
        const newChannel: MarketingChannel = {
            id: crypto.randomUUID(),
            name: t('dashboard.growth_tab.new_channel'),
            monthlyBudget: 5000,
            cpc: 2.5,
            conversionVisitorToLead: 0.05
        };
        onChange([...channels, newChannel]);
    };

    const removeChannel = (id: string) => {
        onChange(channels.filter(c => c.id !== id));
    };

    const totalBudget = channels.reduce((sum, c) => sum + c.monthlyBudget, 0);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-blue-600" />
                        {t('dashboard.growth_tab.marketing_mix')}
                    </div>
                    <span className="text-sm font-normal text-muted-foreground">
                        {t('dashboard.growth_tab.total')}: {format(totalBudget)}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {channels.map((channel) => (
                    <div key={channel.id} className="p-4 bg-muted/30 rounded-lg space-y-4 border hover:border-blue-200 transition-colors">
                        <div className="flex items-center justify-between gap-4">
                            <Input
                                value={channel.name}
                                onChange={(e) => updateChannel(channel.id, 'name', e.target.value)}
                                className="font-semibold h-8 w-40 bg-transparent border-none shadow-none focus:bg-white"
                            />
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={() => removeChannel(channel.id)}>
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>

                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <Label>{t('dashboard.growth_tab.monthly_budget')}</Label>
                                    <span className="font-mono">{format(channel.monthlyBudget)}</span>
                                </div>
                                <Slider
                                    value={[channel.monthlyBudget]}
                                    min={0}
                                    max={50000}
                                    step={500}
                                    onValueChange={([val]) => updateChannel(channel.id, 'monthlyBudget', val)}
                                    className="py-1"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs flex items-center gap-1">
                                        <MousePointer className="w-3 h-3" /> {t('dashboard.growth_tab.cpc_label')}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={channel.cpc}
                                            onChange={(e) => updateChannel(channel.id, 'cpc', parseFloat(e.target.value))}
                                            className="h-8 pl-6"
                                            step={0.1}
                                        />
                                        <span className="absolute left-2 top-2 text-xs text-muted-foreground">
                                            {currency === 'TRY' ? '₺' :
                                                currency === 'USD' ? '$' :
                                                    currency === 'EUR' ? '€' :
                                                        currency === 'GBP' ? '£' : '₺'}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs flex items-center gap-1">
                                        <Search className="w-3 h-3" /> {t('dashboard.growth_tab.visitor_to_lead')}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={channel.conversionVisitorToLead * 100}
                                            onChange={(e) => updateChannel(channel.id, 'conversionVisitorToLead', parseFloat(e.target.value) / 100)}
                                            className="h-8 pr-6 text-right"
                                            step={0.1}
                                        />
                                        <span className="absolute right-2 top-2 text-xs text-muted-foreground">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <Button variant="outline" className="w-full border-dashed" onClick={addChannel}>
                    <Plus className="w-4 h-4 mr-2" /> {t('dashboard.growth_tab.add_channel')}
                </Button>
            </CardContent>
        </Card>
    );
}
