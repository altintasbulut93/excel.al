
import { createClient } from '@supabase/supabase-js';
import { generateFinancialModel } from '@/lib/engine/financials';
import { analyzeFinancials } from '@/lib/engine/analysis';
import { sendEmail } from '@/lib/email-service';
import { MonthlyPerformanceEmail } from '@/emails/MonthlyPerformanceEmail';
import { SmartAlertEmail } from '@/emails/SmartAlertEmail';
import { render } from '@react-email/render';
import { FinancialInput } from '@/lib/engine/types';

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class NotificationEngine {

    /**
     * Main entry point for the Cron Job.
     * Scans all users and their models to determine if notifications are needed.
     */
    async processAll() {
        console.log("Starting Notification Engine...");

        // 1. Fetch all users with their latest financial model
        // We use a join or separate queries. For simplicity, let's fetch profiles then models.
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, full_name');

        if (profileError || !profiles) {
            console.error("Failed to fetch profiles:", profileError);
            return { success: false, error: profileError };
        }

        const results = [];

        for (const profile of profiles) {
            if (!profile.email) continue;

            // Fetch latest model for this user
            const { data: models, error: modelError } = await supabase
                .from('financial_models')
                .select('inputs, updated_at')
                .eq('user_id', profile.id)
                .order('updated_at', { ascending: false })
                .limit(1);

            if (modelError || !models || models.length === 0) {
                continue; // No model, no analysis possible
            }

            const modelData = models[0];
            const inputs = modelData.inputs as FinancialInput;

            try {
                // 2. Generate Analysis
                const financialModel = generateFinancialModel(inputs);
                const analysis = analyzeFinancials(financialModel);

                // 3. Check & Send Monthly Report (if end of month)
                if (this.isEndOfMonth()) {
                    await this.sendMonthlyReport(profile, financialModel, analysis);
                    results.push({ user: profile.email, type: 'monthly', status: 'sent' });
                }

                // 4. Check & Send Smart Alerts (Runway, Burn Rate)
                const alert = this.checkSmartAlerts(analysis);
                if (alert) {
                    await this.sendSmartAlert(profile, alert);
                    results.push({ user: profile.email, type: 'alert', alert: alert.type, status: 'sent' });
                }

            } catch (err) {
                console.error(`Error processing user ${profile.id}:`, err);
                results.push({ user: profile.email, status: 'error', error: err });
            }
        }

        return { success: true, processed: results };
    }

    private isEndOfMonth(): boolean {
        // Simple check: is today one of the last 3 days of the month?
        const today = new Date();
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        return today.getDate() >= lastDayOfMonth - 2;
    }

    private async sendMonthlyReport(profile: any, model: any, analysis: any) {
        // Calculate dynamic values
        const currentMonthIndex = 0; // Assuming starting month is 0 for simplicity, or use Date logic
        const monthlyData = model.monthly[currentMonthIndex];

        const emailHtml = await render(
            MonthlyPerformanceEmail({
                userName: profile.full_name || 'Founder',
                month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
                score: analysis.riskScore.total,
                revenue: this.formatCurrency(monthlyData.revenue),
                runway: `${analysis.runwayMonths} months`,
                burnRate: this.formatCurrency(monthlyData.cashFlow.burnRate),
                dashboardLink: 'https://excel.al/dashboard'
            })
        );

        await sendEmail(profile.email, `Monthly Performance: ${analysis.riskScore.total}/100`, emailHtml);
    }

    private checkSmartAlerts(analysis: any): { type: "runway" | "burn_rate", message: string, value: string, threshold: string } | null {
        // Logic: low runway (< 3 months)
        if (analysis.runwayMonths > 0 && analysis.runwayMonths < 3) {
            return {
                type: 'runway',
                message: 'Critically Low Runway',
                value: `${analysis.runwayMonths} Months`,
                threshold: '3 Months'
            };
        }

        // Logic: High burn rate trend (simplified check)
        if (analysis.burnRate.trend === 'worsening') {
            return {
                type: 'burn_rate',
                message: 'Burn Rate Increasing',
                value: 'Trend: Worsening',
                threshold: 'Stable'
            };
        }

        return null; // No alerts
    }

    private async sendSmartAlert(profile: any, alert: any) {
        const emailHtml = await render(
            SmartAlertEmail({
                userName: profile.full_name || 'Founder',
                alertType: alert.type,
                message: alert.message,
                value: alert.value,
                threshold: alert.threshold,
                dashboardLink: 'https://excel.al/dashboard/decision-lab'
            })
        );

        await sendEmail(profile.email, `⚠️ Critical Alert: ${alert.message}`, emailHtml);
    }

    private formatCurrency(val: number) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    }
}
