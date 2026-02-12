import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
    category: 'personnel' | 'marketing' | 'infrastructure' | 'software' | 'overhead' | 'logistics' | 'cogs' | 'fees';
    monthly: number;
    per_user?: number;
    percentage?: number;
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { template_code, user_id } = body;
        const model_id = params.id;

        if (!template_code || !user_id || !model_id) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // 1. Get Template Data
        const { data: template, error: templateError } = await supabase
            .from('industry_templates')
            .select('*')
            .eq('code', template_code)
            .single();

        if (templateError || !template) {
            throw new Error('Template not found');
        }

        // 2. Get Current Model Data
        const { data: model, error: modelError } = await supabase
            .from('financial_models')
            .select('*')
            .eq('id', model_id)
            .single();

        if (modelError || !model) {
            throw new Error('Model not found');
        }

        const currentInputs = model.inputs || {};

        // 3. Transform Template Items to Model Inputs

        // REVENUE (Map first item to main revenue model)
        const revenueItems = template.default_revenue_items as TemplateRevenueItem[];
        let newPricing = currentInputs.pricing;
        let newGrowthData = currentInputs.growth;

        if (revenueItems && revenueItems.length > 0) {
            const mainRevenue = revenueItems[0];
            newPricing = {
                amount: mainRevenue.price,
                currency: currentInputs.pricing?.currency || 'USD', // Keep existing currency
                period: mainRevenue.type === 'recurring' ? 'monthly' : 'one_time'
            };

            newGrowthData = {
                ...currentInputs.growth,
                monthlyGrowthRate: (mainRevenue.growth_rate || 10) / 100
            };
        }

        // COSTS (Map to Team and Fixed Expenses)
        const costItems = template.default_cost_items as TemplateCostItem[];
        const newTeam = [...(currentInputs.team || [])];
        const newFixedExpenses = [...(currentInputs.fixedExpenses || [])];
        let newMarketing = currentInputs.marketing;

        if (costItems) {
            costItems.forEach(item => {
                if (item.category === 'personnel') {
                    // Add to Team
                    newTeam.push({
                        id: crypto.randomUUID(),
                        role: item.name,
                        count: 1,
                        salary: item.monthly,
                        isNetSalary: true // Default to net salary
                    });
                } else if (item.category === 'marketing') {
                    // Update Marketing if strict override desired, or add as flexible expense
                    // Here we add as fixed expense if it's a fixed amount
                    if (item.type === 'fixed') {
                        newFixedExpenses.push({
                            id: crypto.randomUUID(),
                            name: item.name,
                            amount: item.monthly,
                            currency: currentInputs.pricing?.currency || 'USD',
                            isVariable: false
                        });
                    }
                } else {
                    // Add to Fixed/Variable Expenses
                    newFixedExpenses.push({
                        id: crypto.randomUUID(),
                        name: item.name,
                        amount: item.monthly,
                        currency: currentInputs.pricing?.currency || 'USD',
                        isVariable: item.type === 'variable'
                    });
                }
            });
        }

        // 4. Update Model
        const updatedInputs = {
            ...currentInputs,
            pricing: newPricing,
            growth: newGrowthData,
            team: newTeam,
            fixedExpenses: newFixedExpenses,
            marketing: newMarketing
        };

        const { error: updateError } = await supabase
            .from('financial_models')
            .update({
                inputs: updatedInputs,
                updated_at: new Date().toISOString()
            })
            .eq('id', model_id);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({
            success: true,
            model: {
                ...model,
                inputs: updatedInputs
            }
        });

    } catch (error: any) {
        console.error('Error loading template:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
