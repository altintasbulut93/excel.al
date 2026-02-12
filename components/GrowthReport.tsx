"use client";

import { useState } from "react";
import { useFinancialStore } from "@/lib/store";
import { format } from "date-fns";
import { FileText, Share2, Download, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function GrowthReport({ modelId }: { modelId: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState('monthly');
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);

    async function handleGenerate() {
        setLoading(true);
        try {
            const res = await fetch(`/api/model/${modelId}/generate-report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    report_type: reportType,
                    report_month: format(new Date(), 'yyyy-MM-dd')
                })
            });
            const data = await res.json();

            if (data.success) {
                // In a real app, this link would point to the public report page
                // For MVP, we point to a placeholder or the dashboard itself
                const link = `${window.location.origin}/report/${data.report.id}`;
                setGeneratedLink(link);
            }
        } catch (error) {
            console.error('Error generating report:', error);
        } finally {
            setLoading(false);
        }
    }

    const copyLink = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            alert('Link kopyalandı!');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Rapor Oluştur
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Büyüme Raporu Oluştur</DialogTitle>
                    <DialogDescription>
                        Finansal durumunuzu özetleyen ve paylaşılabilir bir rapor oluşturun.
                    </DialogDescription>
                </DialogHeader>

                {!generatedLink ? (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Rapor Tipi</Label>
                            <Select value={reportType} onValueChange={setReportType}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Aylık Özet</SelectItem>
                                    <SelectItem value="quarterly">Çeyrek Dönem</SelectItem>
                                    <SelectItem value="share">Yatırımcı Paylaşımı</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ) : (
                    <div className="py-6 space-y-4 text-center">
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                            <Check className="w-6 h-6" />
                        </div>
                        <h3 className="font-medium text-lg">Rapor Hazır!</h3>
                        <p className="text-muted-foreground text-sm">
                            Raporunuz başarıyla oluşturuldu. Aşağıdaki linki kullanarak paylaşabilirsiniz.
                        </p>

                        <div className="flex items-center gap-2 mt-4">
                            <Input value={generatedLink} readOnly />
                            <Button size="icon" onClick={copyLink}>
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex justify-center gap-2 pt-2">
                            <Button variant="outline" className="gap-2">
                                <Download className="w-4 h-4" />
                                PDF İndir
                            </Button>
                        </div>
                    </div>
                )}

                {!generatedLink && (
                    <DialogFooter>
                        <Button onClick={handleGenerate} disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Oluştur
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
