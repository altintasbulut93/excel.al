
"use client";

import { useState } from "react";
import { useFinancialStore } from "@/lib/store";
import { format } from "date-fns";
import { FileText, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n-context";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportPreviewModal } from "@/components/modals/ReportPreviewModal";
import { UpgradeModal } from "@/components/UpgradeModal";

export function GrowthReport({ modelId }: { modelId: string }) {
    const { t, language } = useLanguage();
    const [open, setOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [reportType, setReportType] = useState('monthly');
    const [showUpgrade, setShowUpgrade] = useState(false);

    const { isAdmin, subscriptionTier } = useFinancialStore();
    const isPro = isAdmin || subscriptionTier === 'pro' || subscriptionTier === 'enterprise';

    const handleCreateClick = () => {
        if (!isPro) {
            setShowUpgrade(true);
            return;
        }
        setPreviewOpen(true);
        setOpen(false);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <FileText className="w-4 h-4" />
                        {t('dashboard.report.title')}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('dashboard.report.title')}</DialogTitle>
                        <DialogDescription>
                            {t('dashboard.report.desc')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">{t('dashboard.report.type')}</Label>
                            <Select value={reportType} onValueChange={setReportType}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">{t('dashboard.report.monthly')}</SelectItem>
                                    <SelectItem value="investor">{t('dashboard.report.investor')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={handleCreateClick} className="w-full sm:w-auto" variant={isPro ? "default" : "secondary"}>
                            {!isPro && <Lock className="w-3 h-3 mr-2" />}
                            {t('dashboard.report.create')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ReportPreviewModal
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
                reportType={reportType}
            />

            <UpgradeModal
                open={showUpgrade}
                onClose={() => setShowUpgrade(false)}
            />
        </>
    );
}
