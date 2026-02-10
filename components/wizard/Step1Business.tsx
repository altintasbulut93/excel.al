
"use client";

import { useFinancialStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea"
import { Sparkles } from "lucide-react";

export function Step1Business() {
    const { data, setData, setStep } = useFinancialStore();
    const [idea, setIdea] = useState(data.businessName || "");
    const [sector, setSector] = useState(data.sector || "");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // AI Analysis (Real)
    const handleAnalyze = async () => {
        if (!idea) return;
        setIsAnalyzing(true);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Analiz hatası");
            }

            const result = await response.json();

            // Update store with AI suggestions
            let newSector = result.sector || sector;
            // Keep user selection if AI is generic 'Other' and user selected something specific before
            if ((newSector === 'Other' || !newSector) && sector) newSector = sector;

            setData({
                businessName: result.businessName || idea,
                sector: newSector,
                revenueModel: result.revenueModel,
                pricing: result.pricing,
                growth: result.growth,
                team: result.team,
                fixedExpenses: result.fixedExpenses,
                marketing: result.marketing
            });

            setSector(newSector);
            // Don't overwrite idea text if user typed a long description, 
            // but maybe suggest the business name
            if (result.businessName && result.businessName !== "Derived from idea or generic") {
                // Optional: Ask user or just set it? Let's just keep the description in the input for now
                // setIdea(result.businessName); 
            }

            alert("✨ AI Analizi Tamamlandı! Girişiminiz için varsayımlar oluşturuldu. 'Devam Et' diyerek görebilirsiniz.");

        } catch (error: any) {
            console.error(error);
            alert(`AI Analizi sırasında bir hata oluştu: ${error.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleNext = () => {
        setData({ businessName: idea, sector });
        setStep(1); // Go to step 2
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-primary/20">
            <CardHeader>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">İş Fikriniz Nedir?</CardTitle>
                <CardDescription>
                    Fikrinizi kısaca anlatın, yapay zeka finansal modelinizi <b>otomatik</b> oluştursun.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="idea">İş Fikri / Proje Adı</Label>
                    <Textarea
                        id="idea"
                        placeholder="Örn: Küçük işletmeler için yapay zeka destekli stok yönetim yazılımı (SaaS)...."
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        className="min-h-[100px] text-lg p-4"
                    />
                    <Button
                        variant="default"
                        className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={handleAnalyze}
                        disabled={!idea || isAnalyzing}
                    >
                        {isAnalyzing ? "Analiz Ediliyor (GPT-4o)..." : <><Sparkles className="w-4 h-4 mr-2" /> AI ile Otomatik Doldur</>}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                        * AI; Gelir modeli, fiyatlandırma, ekip ve gider kalemlerini tahmin eder.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sector">Sektör (Manuel Seçim)</Label>
                    <Select value={sector} onValueChange={(val) => { setSector(val); setData({ sector: val }); }}>
                        <SelectTrigger id="sector">
                            <SelectValue placeholder="Sektör Seçin veya AI Bekleyin" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SaaS">SaaS (Yazılım Servisi)</SelectItem>
                            <SelectItem value="E-commerce">E-Ticaret</SelectItem>
                            <SelectItem value="Marketplace">Pazaryeri</SelectItem>
                            <SelectItem value="Consulting">Danışmanlık / Hizmet</SelectItem>
                            <SelectItem value="MobileApp">Mobil Uygulama</SelectItem>
                            <SelectItem value="Other">Diğer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={handleNext} disabled={!idea || !sector} size="lg" className="px-8">
                    Devam Et &rarr;
                </Button>
            </CardFooter>
        </Card>
    );
}
