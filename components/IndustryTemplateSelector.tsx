"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFinancialStore } from "@/lib/store";
import { Loader2, Check, LayoutTemplate, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateRevenueItem {
    id: string;
    name: string;
    type: 'recurring' | 'one_time';
    unit: string;
    price: number;
    growth_rate: number;
}

interface TemplateCostItem {
    id: string;
    name: string;
    type: 'fixed' | 'variable';
    category: string;
    monthly: number;
}

interface IndustryTemplate {
    id: string;
    code: string;
    name: string;
    description: string;
    icon: string;
    default_revenue_items: TemplateRevenueItem[];
    default_cost_items: TemplateCostItem[];
}

interface IndustryTemplateSelectorProps {
    onSelect?: (template: IndustryTemplate) => void;
}

export function IndustryTemplateSelector({ onSelect }: IndustryTemplateSelectorProps) {
    const [templates, setTemplates] = useState<IndustryTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplateCode, setSelectedTemplateCode] = useState<string | null>(null);
    const { setData } = useFinancialStore();

    useEffect(() => {
        fetchTemplates();
    }, []);

    async function fetchTemplates() {
        try {
            const response = await fetch('/api/industry-templates');
            const data = await response.json();
            if (data.success) {
                setTemplates(data.templates);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleSelect = (template: IndustryTemplate) => {
        setSelectedTemplateCode(template.code);

        // Apply template data to store
        // Map first revenue item to pricing/growth
        const mainRevenue = template.default_revenue_items?.[0];
        const growthData = mainRevenue ? {
            initialCustomers: 0,
            monthlyGrowthRate: (mainRevenue.growth_rate || 10) / 100
        } : undefined;

        const pricingData = mainRevenue ? {
            amount: mainRevenue.price,
            period: (mainRevenue.type === 'recurring' ? 'monthly' : 'one_time') as 'monthly' | 'one_time' | 'annual'
        } : undefined;

        // Map cost items
        const newTeam: any[] = [];
        const newFixedExpenses: any[] = [];

        template.default_cost_items?.forEach(item => {
            if (item.category === 'personnel') {
                newTeam.push({
                    id: crypto.randomUUID(),
                    role: item.name,
                    count: 1,
                    salary: item.monthly,
                    isNetSalary: true
                });
            } else {
                newFixedExpenses.push({
                    id: crypto.randomUUID(),
                    name: item.name,
                    amount: item.monthly,
                    currency: 'USD', // Default, should effectively use store currency ideally
                    isVariable: item.type === 'variable'
                });
            }
        });

        setData({
            sector: template.name,
            ...(growthData && { growth: growthData }),
            ...(pricingData && { pricing: { ...pricingData, currency: 'USD' } }), // currency needs careful handling
            team: newTeam,
            fixedExpenses: newFixedExpenses
        });

        if (onSelect) {
            onSelect(template);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
                <Card
                    key={template.id}
                    className={cn(
                        "cursor-pointer transition-all hover:shadow-md border-2",
                        selectedTemplateCode === template.code
                            ? "border-primary bg-primary/5"
                            : "border-transparent hover:border-primary/20"
                    )}
                    onClick={() => handleSelect(template)}
                >
                    <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                        <div className="text-4xl">{template.icon}</div>
                        <div>
                            <h3 className="font-semibold text-lg">{template.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {template.description}
                            </p>
                        </div>
                        {selectedTemplateCode === template.code && (
                            <Badge variant="default" className="mt-2">
                                <Check className="w-3 h-3 mr-1" />
                                Selected
                            </Badge>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
