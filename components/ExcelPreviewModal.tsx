"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Lock, FileSpreadsheet, CreditCard } from "lucide-react";
import { MonthlyFinancialResult } from "@/lib/engine/types";
import { useLanguage } from "@/lib/i18n-context";
import { useFormat } from "@/hooks/use-format";

export function ExcelPreviewModal({
    isOpen,
    onClose,
    onUpgrade,
    monthlyData
}: {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
    monthlyData: MonthlyFinancialResult[];
}) {
    const { t } = useLanguage();
    const { format, currency } = useFormat();

    // Only verify non-empty data
    const previewData = monthlyData.slice(0, 5); // Show first 5 months

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FileSpreadsheet className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">{t('dashboard.excel_preview_title')}</DialogTitle>
                                <DialogDescription>
                                    {t('dashboard.excel_preview_desc')}
                                </DialogDescription>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                {/* Simulated Excel Sheet UI */}
                <div className="flex-1 overflow-auto border rounded-md bg-white shadow-inner mt-4 relative">
                    {/* Excel Header */}
                    <div className="flex bg-gray-100 border-b text-xs font-medium text-gray-500 sticky top-0 z-10">
                        <div className="w-10 p-2 border-r text-center"></div>
                        <div className="w-32 p-2 border-r">A</div>
                        <div className="w-32 p-2 border-r">B</div>
                        <div className="w-32 p-2 border-r">C</div>
                        <div className="w-32 p-2 border-r">D</div>
                        <div className="w-32 p-2 border-r">E</div>
                        <div className="w-32 p-2 border-r">F</div>
                    </div>

                    {/* Excel Rows */}
                    <div className="text-sm font-news divide-y">
                        {/* Title Row */}
                        <div className="flex hover:bg-gray-50">
                            <div className="w-10 p-2 border-r bg-gray-50 text-gray-500 text-center text-xs">1</div>
                            <div className="flex-1 p-2 font-bold text-lg text-blue-800">{t('dashboard.excel_report_title')} - 2025</div>
                        </div>
                        {/* Headers */}
                        <div className="flex hover:bg-gray-50 font-bold bg-slate-50">
                            <div className="w-10 p-2 border-r bg-gray-50 text-gray-500 text-center text-xs">2</div>
                            <div className="w-32 p-2 border-r">{t('common.month')}</div>
                            <div className="w-32 p-2 border-r">{t('dashboard.revenue')}</div>
                            <div className="w-32 p-2 border-r">{t('dashboard.expenses')}</div>
                            <div className="w-32 p-2 border-r">{t('dashboard.net_profit')}</div>
                            <div className="w-32 p-2 border-r">{t('dashboard.cash_balance')}</div>
                            <div className="w-32 p-2 border-r">{t('dashboard.customer')}</div>
                        </div>

                        {/* Data Rows */}
                        {previewData.map((row, i) => (
                            <div key={i} className="flex hover:bg-gray-50 group">
                                <div className="w-10 p-2 border-r bg-gray-50 text-gray-500 text-center text-xs">{i + 3}</div>
                                <div className="w-32 p-2 border-r font-mono">{row.month}. {t('common.month')}</div>
                                <div className="w-32 p-2 border-r text-green-600 font-mono">{format(row.revenue)}</div>
                                <div className="w-32 p-2 border-r text-red-500 font-mono">{format(row.totalExpenses)}</div>
                                <div className="w-32 p-2 border-r font-medium font-mono">{format(row.netIncome)}</div>
                                <div className="w-32 p-2 border-r text-blue-600 font-mono">{format(row.cashFlow.endingBalance)}</div>
                                <div className="w-32 p-2 border-r font-mono">{row.customers}</div>
                            </div>
                        ))}

                        {/* Blurred Rows */}
                        {[1, 2, 3, 4, 5].map((_, i) => (
                            <div key={`blur-${i}`} className="flex relative items-center justify-center opacity-50 blur-[2px] select-none pointer-events-none">
                                <div className="w-10 p-2 border-r bg-gray-50 text-center text-xs">{i + 8}</div>
                                <div className="w-32 p-2 border-r">...</div>
                                <div className="w-32 p-2 border-r">...</div>
                                <div className="w-32 p-2 border-r">...</div>
                                <div className="w-32 p-2 border-r">...</div>
                                <div className="w-32 p-2 border-r">...</div>
                                <div className="w-32 p-2 border-r">...</div>
                            </div>
                        ))}
                    </div>

                    {/* "Paywall" Overlay over blurred area */}
                    <div className="absolute inset-x-0 bottom-0 top-40 bg-gradient-to-t from-white via-white/90 to-transparent flex flex-col items-center justify-end pb-12">
                        <div className="p-6 bg-white shadow-2xl rounded-xl border border-blue-100 text-center max-w-md animate-in fade-in slide-in-from-bottom-10 duration-500">
                            <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4 p-2 bg-blue-50 rounded-full" />
                            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                                {t('dashboard.download_full_report')}
                            </h3>
                            <p className="text-gray-500 mb-6 text-sm">
                                {t('dashboard.pro_feature_desc')}
                            </p>
                            <Button onClick={onUpgrade} size="lg" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg text-white font-bold text-md h-12">
                                <Download className="w-5 h-5 mr-2" />
                                {t('dashboard.upgrade_to_pro_btn')} {currency === 'TRY' ? '(₺499/tek sefer)' : currency === 'USD' ? '($15/one-time)' : currency === 'EUR' ? '(€14/one-time)' : '(£12/one-time)'}
                            </Button>
                            <p className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                                <CreditCard className="w-3 h-3" /> {t('common.secure_payment')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 gap-2">
                    <Button variant="outline" onClick={onClose}>{t('common.close')}</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
