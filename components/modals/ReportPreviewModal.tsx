
"use client";

import { useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFinancialStore } from "@/lib/store";
import { useLanguage } from "@/lib/i18n-context";
import { formatCurrency } from "@/lib/utils";
import { Download, Copy, X, Printer, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReportPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportType: string;
}

export function ReportPreviewModal({ isOpen, onClose, reportType }: ReportPreviewModalProps) {
    const { data, results, savedModelId } = useFinancialStore();
    const { t, language } = useLanguage();
    const reportRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);
    const [sharing, setSharing] = useState(false);

    if (!data || !results) return null;

    const { businessName, logoUrl } = data;
    const summary = results.summary;
    const monthly = results.monthly;

    const currentDate = new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(reportRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${businessName}_Report.pdf`);
        } catch (error) {
            console.error(error);
        } finally {
            setDownloading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShareLink = async () => {
        if (!savedModelId) {
            alert(t('dashboard.save_to_unlock'));
            return;
        }
        setSharing(true);
        try {
            const res = await fetch('/api/share/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    modelId: savedModelId,
                    expiryDays: 30 // Default 30 days for report sharing
                })
            });
            const data = await res.json();
            if (data.success) {
                const link = `${window.location.origin}/invest/${data.token}`;
                navigator.clipboard.writeText(link);
                alert(t('dashboard.report.link_copied'));
            } else {
                alert("Error generating link");
            }
        } catch (e) {
            console.error(e);
            alert("Error");
        } finally {
            setSharing(false);
        }
    };

    // Chart Data (First 12 months)
    const chartData = monthly.slice(0, 12).map((m, i) => ({
        name: `M${i + 1}`,
        Revenue: m.revenue,
        Expenses: m.totalExpenses,
        Burn: m.burnRate,
        Marketing: m.expenses.marketing
    }));

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
                {/* Header Actions */}
                <div className="flex items-center justify-between p-4 border-b bg-slate-50 dark:bg-slate-900">
                    <div className="text-sm font-medium text-muted-foreground hidden sm:block">
                        {t('dashboard.report.title')} - {reportType === 'monthly' ? t('dashboard.report.monthly') : t('dashboard.report.investor')}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <Button variant="outline" size="sm" onClick={handlePrint} className="hidden sm:flex">
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={downloading}>
                            <Download className="w-4 h-4 mr-2" />
                            {downloading ? t('common.processing') : "PDF"}
                        </Button>
                        <Button size="sm" onClick={handleShareLink} disabled={sharing || !savedModelId}>
                            {sharing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Copy className="w-4 h-4 mr-2 hidden sm:inline" />}
                            {t('share_modal.copy_link')}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Scrollable Report Content */}
                <ScrollArea className="flex-1 bg-slate-100 p-4 sm:p-8">
                    <div ref={reportRef} className="bg-white mx-auto shadow-xl p-8 sm:p-12 max-w-[210mm] min-h-[297mm] text-slate-800">
                        {/* Report Header */}
                        <div className="flex justify-between items-start border-b pb-8 mb-8">
                            <div className="flex items-center gap-4">
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Logo" className="h-16 w-16 object-contain rounded-lg border p-1" />
                                ) : (
                                    <div className="h-16 w-16 bg-slate-100 rounded-lg flex items-center justify-center text-2xl font-bold text-slate-800">
                                        {businessName?.charAt(0) || 'C'}
                                    </div>
                                )}
                                <div>
                                    <div className="text-3xl font-bold text-slate-900">{businessName || 'Company Name'}</div>
                                    <div className="text-sm text-slate-500">{t('common.app_name')} Intelligence Report</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-light text-slate-400 uppercase tracking-widest">
                                    {reportType === 'monthly' ? 'Monthly Update' : 'Investor Deck'}
                                </div>
                                <div className="text-sm font-medium text-slate-600 mt-2">{currentDate}</div>
                            </div>
                        </div>

                        {/* Executive Summary */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3 mb-4 uppercase text-sm tracking-wider">
                                {t('investor_dash.executive_summary')}
                            </h3>
                            <p className="text-slate-600 leading-relaxed text-justify">
                                {t('investor_dash.summary_intro')}
                                <span className="font-semibold text-slate-900"> {businessName}</span> shows a
                                <span className="font-semibold text-emerald-600"> {summary.unitEconomics?.ltvCacRatio > 3 ? t('investor_dash.strong_potential') : t('investor_dash.moderate_risk')}</span>.
                                The company is currently projecting <span className="font-semibold">{formatCurrency(summary.totalRevenue)}</span> in revenue for the first year,
                                with a net burn rate averaging <span className="font-semibold">{formatCurrency(summary.averageBurn)}</span>.
                                Runway analysis estimates <span className="font-semibold text-blue-600">{summary.runwayMonths} months</span> of operation with current capital.
                            </p>
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">{t('dashboard.revenue')}</div>
                                <div className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.totalRevenue)}</div>
                                <div className="text-[10px] text-slate-400 mt-1">First 12 Months</div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">{t('dashboard.profit')}</div>
                                <div className={`text-2xl font-bold ${summary.totalProfit > 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                                    {formatCurrency(summary.totalProfit)}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1">Net Income</div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">{t('dashboard.needed_capital')}</div>
                                <div className="text-2xl font-bold text-slate-700">{formatCurrency(summary.neededCapital)}</div>
                                <div className="text-[10px] text-slate-400 mt-1">Funding Requirement</div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">LTV / CAC</div>
                                <div className="text-2xl font-bold text-purple-600">{summary.unitEconomics?.ltvCacRatio?.toFixed(1)}x</div>
                                <div className="text-[10px] text-slate-400 mt-1">{t('dashboard.unit_economics')}</div>
                            </div>
                        </div>

                        {/* Charts Area */}
                        <div className="mb-12">
                            <h3 className="text-lg font-bold text-slate-900 border-l-4 border-indigo-600 pl-3 mb-6 uppercase text-sm tracking-wider">
                                {t('dashboard.monthly_revenue_profit')}
                            </h3>
                            <div className="h-64 w-full border rounded-lg p-4 bg-white">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val: number) => `${val / 1000}k`} />
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Line type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="Expenses" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* DETAILED BREAKDOWN TABLE (New Request) */}
                        <div className="mb-12">
                            <h3 className="text-lg font-bold text-slate-900 border-l-4 border-slate-600 pl-3 mb-6 uppercase text-sm tracking-wider">
                                Detailed Financial Breakdown
                            </h3>
                            <div className="overflow-hidden rounded-lg border border-slate-200">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3">Month</th>
                                            <th className="px-4 py-3 text-right">Revenue</th>
                                            <th className="px-4 py-3 text-right">Marketing</th>
                                            <th className="px-4 py-3 text-right">Total Expenses</th>
                                            <th className="px-4 py-3 text-right">Net Profit</th>
                                            <th className="px-4 py-3 text-right">Cash Flow</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {monthly.slice(0, 12).map((m, i) => (
                                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                                <td className="px-4 py-2 font-medium text-slate-700">Month {i + 1}</td>
                                                <td className="px-4 py-2 text-right text-emerald-600">{formatCurrency(m.revenue)}</td>
                                                <td className="px-4 py-2 text-right text-slate-600">{formatCurrency(m.expenses.marketing)}</td>
                                                <td className="px-4 py-2 text-right text-rose-500">{formatCurrency(m.totalExpenses)}</td>
                                                <td className={`px-4 py-2 text-right font-medium ${m.netIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {formatCurrency(m.netIncome)}
                                                </td>
                                                <td className="px-4 py-2 text-right text-slate-600">{formatCurrency(m.cashFlow.endingBalance)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Additional Info for Investor */}
                        {reportType !== 'monthly' && (
                            <div className="mb-12">
                                <h3 className="text-lg font-bold text-slate-900 border-l-4 border-amber-500 pl-3 mb-6 uppercase text-sm tracking-wider">
                                    {t('dashboard.growth_engine')} & Burn
                                </h3>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="h-48 w-full">
                                        <h4 className="text-sm font-semibold mb-2 text-center text-slate-500">Net Burn Rate</h4>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData}>
                                                <XAxis dataKey="name" fontSize={10} hide />
                                                <Bar dataKey="Burn" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex flex-col justify-center space-y-4 text-sm text-slate-600">
                                        <div className="flex justify-between border-b pb-2">
                                            <span>Runway</span>
                                            <span className="font-bold text-slate-900">{summary.runwayMonths} Months</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span>CAC</span>
                                            <span className="font-bold text-slate-900">{formatCurrency(summary.unitEconomics?.cac || 0)}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span>LTV</span>
                                            <span className="font-bold text-slate-900">{formatCurrency(summary.unitEconomics?.ltv || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-16 pt-8 border-t flex items-center justify-between text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-slate-200 rounded flex items-center justify-center text-[8px] font-bold text-slate-600">e</div>
                                <span>Powered by excel.al Executive Engine</span>
                            </div>
                            <div>
                                Confidential & Proprietary
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
