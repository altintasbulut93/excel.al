import { MonthlyFinancialResult } from "../engine/types";

export type NarrativeTone = 'investor' | 'linkedin' | 'internal';

export function generateMonthlyNarrative(
    month: MonthlyFinancialResult,
    prevMonth: MonthlyFinancialResult | undefined,
    healthScore: any,
    tone: NarrativeTone,
    businessName: string,
    t: (key: string) => string,
    format: (val: number) => string
): string {
    const revenueGrowth = prevMonth && prevMonth.revenue > 0
        ? ((month.revenue - prevMonth.revenue) / prevMonth.revenue) * 100
        : 0;

    const profitMargin = month.revenue > 0 ? (month.netIncome / month.revenue) * 100 : 0;
    const isProfitable = month.netIncome > 0;

    // Helper to replace template vars
    const replace = (text: string, vars: Record<string, string | number>) => {
        let result = text;
        Object.entries(vars).forEach(([key, val]) => {
            result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), val.toString());
        });
        return result;
    };

    // --- 1. INVESTOR UPDATE TONE ---
    if (tone === 'investor') {
        const title = replace(t('dashboard.narrative.investor_title'), { name: businessName, month: month.month });
        const summary = replace(t('dashboard.narrative.narrative_investor_desc'), {
            month: month.month,
            revenue: format(month.revenue),
            growth: revenueGrowth.toFixed(1),
            burn: format(month.metrics.burnRate),
            runway: month.metrics.runway.toFixed(1)
        });
        const health = replace(t('dashboard.narrative.health_desc'), {
            score: healthScore.score,
            grade: healthScore.grade,
            ratio: (month.metrics.ltvCacRatio || 0).toFixed(2)
        });
        const askStr = replace(t('dashboard.narrative.ask_desc'), { sector: '[Sector]' });

        return `
**${title}**

**🚀 ${t('dashboard.narrative.exec_summary')}**
${summary}

**${t('dashboard.narrative.key_financials')}:**
- **${t('dashboard.revenue')}:** ${format(month.revenue)}
- **${t('dashboard.monthly_story.gross_margin')}:** ${(month.metrics.grossMargin * 100).toFixed(1)}%
- **${t('dashboard.monthly_story.net_profit')}:** ${format(month.netIncome)}
- **${t('dashboard.monthly_story.cash_balance')}:** ${format(month.cashFlow.endingBalance)}

**${t('dashboard.narrative.perf_health')}:**
${health}

**${t('dashboard.narrative.ask')}:**
${askStr}
        `.trim();
    }

    // --- 2. LINKEDIN TONE ---
    if (tone === 'linkedin') {
        const growthEmoji = revenueGrowth > 10 ? "🚀" : "📈";
        const status = isProfitable ? t('dashboard.narrative.profitable') : t('dashboard.narrative.growing');

        const title = replace(t('dashboard.narrative.linkedin_title'), { name: businessName, month: month.month, emoji: growthEmoji });
        const desc = replace(t('dashboard.narrative.linkedin_desc'), {
            revenue: format(month.revenue),
            growth: revenueGrowth.toFixed(1)
        });
        const building = replace(t('dashboard.narrative.linkedin_building'), { status });

        return `
${title}

${desc}

${building}
${t('dashboard.narrative.linkedin_focus')}

**${t('dashboard.narrative.linkedin_wins')}:**
✅ ${replace(t('dashboard.narrative.linkedin_new_cust'), { count: month.newCustomers })}
✅ ${replace(t('dashboard.narrative.linkedin_margin'), { margin: (month.metrics.grossMargin * 100).toFixed(0) })}
✅ Health Score: ${healthScore.grade}

${t('dashboard.narrative.linkedin_thanks')}

#buildinginpublic #startup #growth #saas
        `.trim();
    }

    // --- 3. INTERNAL TEAM TONE ---
    const teamTitle = replace(t('dashboard.narrative.team_title'), { month: month.month });
    const teamIntro = replace(t('dashboard.narrative.team_intro'), { month: month.month });

    return `
**${teamTitle}**

${t('dashboard.narrative.team_greeting')}

${teamIntro}

**${t('dashboard.narrative.team_good')}:**
- ${replace(t('dashboard.narrative.team_revenue'), { revenue: format(month.revenue) })}
- ${replace(t('dashboard.narrative.team_growth'), { growth: revenueGrowth.toFixed(1) })}
- ${replace(t('dashboard.narrative.team_cust'), { count: month.customers, new: month.newCustomers })}

**${t('dashboard.narrative.team_watch')}:**
- ${replace(t('dashboard.narrative.team_burn'), { burn: format(month.metrics.burnRate) })}
- ${replace(t('dashboard.narrative.team_churn'), { count: month.churnedCustomers })}

**${t('dashboard.narrative.team_focus')}:**
${replace(t('dashboard.narrative.team_runway'), { runway: month.metrics.runway.toFixed(1) })}

${t('dashboard.narrative.team_footer')}
    `.trim();
}
