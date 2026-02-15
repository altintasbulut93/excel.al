
import { FinancialInput } from '../engine/types';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

const SYSTEM_PROMPT = `
You are an expert financial consultant for startups. 
Your goal is to analyze a business idea and generate realistic financial assumptions for a 1-year projection.
Focus on the Turkish market (TR) context.

Output must be a valid JSON object matching this structure:
{
  "businessName": "Derived from idea or generic",
  "sector": "SaaS" | "E-commerce" | "Marketplace" | "Consulting" | "MobileApp" | "Other" (Choose best fit),
  "revenueModel": "subscription" | "one_time" | "commission" | "service",
  "pricing": {
    "amount": number (Estimated average price in TRY),
    "currency": "TRY",
    "period": "monthly" | "annual" (usually monthly)
  },
  "growth": {
    "initialCustomers": number (Conservative estimate for month 1, typical 0 for pre-launch, 5-10 for early),
    "monthlyGrowthRate": number (Decimal, e.g. 0.10 for 10%)
  },
  "team": [
    { "role": "Role Name", "count": number, "salary": number (Net Monthly TRY), "isNetSalary": true }
  ],
  "fixedExpenses": [
    { "name": "Expense Name", "amount": number (Monthly TRY), "currency": "TRY" }
  ],
  "marketing": {
    "type": "percentage" | "fixed",
    "value": number (Decimal, e.g. 0.20 for 20% of revenue OR Amount in TRY)
  }
}

Rules:
1. Salaries must be realistic for Turkey 2025 (Min wage net ~17002 TL). Senior roles > 60k TL.
2. Sectors like SaaS usually have high margins, E-commerce lower.
3. Marketing budget is typically 15-30% of revenue.
4. Be conservative but optimistic.
5. Generate at least 2 team members and 3 fixed expenses (Rent, Software, etc.).
`;

export async function analyzeBusinessIdea(idea: string): Promise<Partial<FinancialInput>> {
  try {
    // Create OpenAI client at runtime, not at module load
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Business Idea: ${idea}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No content from OpenAI");

    const result = JSON.parse(content);

    // Add UUIDs
    if (result.team) {
      result.team = result.team.map((t: any) => ({ ...t, id: uuidv4() }));
    }
    if (result.fixedExpenses) {
      result.fixedExpenses = result.fixedExpenses.map((e: any) => ({ ...e, id: uuidv4() }));
    }

    return result;
  } catch (error) {
    console.error("AI Analysis Failed:", error);

    // Fallback: Generate mock data based on keywords
    console.log("Using fallback generator...");
    const isEcommerce = idea.toLowerCase().includes('e-ticaret') || idea.toLowerCase().includes('satış') || idea.toLowerCase().includes('mağaza');
    const isSaaS = idea.toLowerCase().includes('yazılım') || idea.toLowerCase().includes('app') || idea.toLowerCase().includes('uygulama') || idea.toLowerCase().includes('platform');
    const isConsulting = idea.toLowerCase().includes('danışmanlık') || idea.toLowerCase().includes('hizmet') || idea.toLowerCase().includes('ajans');

    let sector = 'Other';
    if (isSaaS) sector = 'SaaS';
    else if (isEcommerce) sector = 'E-commerce';
    else if (isConsulting) sector = 'Consulting';

    return {
      businessName: idea.length > 50 ? idea.substring(0, 50) + "..." : idea,
      sector: sector,
      revenueModel: isSaaS ? 'subscription' : (isConsulting ? 'service' : 'one_time'),
      pricing: {
        amount: isSaaS ? 500 : (isConsulting ? 15000 : 2500),
        currency: 'TRY',
        period: 'monthly'
      },
      growth: {
        initialCustomers: isSaaS ? 10 : (isConsulting ? 2 : 50),
        monthlyGrowthRate: isSaaS ? 0.15 : 0.05
      },
      team: [
        { id: uuidv4(), role: "Kurucu / CEO", count: 1, salary: 0, isNetSalary: true },
        { id: uuidv4(), role: "Satış / Pazarlama", count: 1, salary: 25000, isNetSalary: true }
      ],
      fixedExpenses: [
        { id: uuidv4(), name: "Ofis / Kira (Paylaşımlı)", amount: 5000, currency: 'TRY' },
        { id: uuidv4(), name: "Yazılım / Hosting", amount: 1000, currency: 'TRY' }
      ],
      marketing: {
        type: 'percentage',
        value: 0.10
      }
    };
  }
}
