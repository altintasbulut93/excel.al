import { useFinancialStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { Loader2, Wand2, Upload, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";

export function Step1Business() {
    const { data, setData, setStep } = useFinancialStore();
    const { t } = useLanguage();
    const [brandName, setBrandName] = useState(data.businessName || "");
    const [logo, setLogo] = useState<string | null>(data.logoUrl || null);
    const [idea, setIdea] = useState(data.description || "");
    const [sector, setSector] = useState(data.sector || "");
    const [businessModel, setBusinessModel] = useState<'B2B' | 'B2C' | 'B2B2C'>(data.businessModel || 'B2B');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleNext = () => {
        setData({
            businessName: brandName,
            logoUrl: logo || undefined,
            sector,
            businessModel,
            description: idea
        });
        setStep(1);
    };

    const handleAIAnalysis = async () => {
        if (!idea || idea.length < 10) return;
        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea })
            });
            const result = await response.json();

            if (result.sector) setSector(result.sector);

            setData({
                ...data,
                businessName: brandName,
                description: idea,
                sector: result.sector || sector
            });

        } catch (e) {
            console.error(e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleLogoUpload(file);
        }
    };

    const handleLogoUpload = (file: File) => {
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert("2MB limit");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setLogo(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleLogoUpload(file);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-primary/20">
            <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {t('wizard.step1_title')}
                </CardTitle>
                <CardDescription>
                    {t('wizard.step1_desc')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Brand & Logo Section */}
                <div className="flex gap-4 items-start">
                    {/* Brand Name Input */}
                    <div className="flex-1 space-y-2">
                        <Label>{t('wizard.brand_name')}</Label>
                        <Input
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            placeholder={t('wizard.brand_placeholder')}
                            className="h-12 text-lg"
                        />
                    </div>

                    {/* Logo Upload Area */}
                    <div className="flex-shrink-0">
                        <Label className="block mb-2">{t('wizard.logo_label')}</Label>
                        <div
                            className="w-32 h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all relative overflow-hidden group bg-slate-50"
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                        >
                            {logo ? (
                                <>
                                    <img src={logo} alt="Logo" className="w-full h-full object-contain p-2" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-xs font-medium">{t('wizard.change')}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setLogo(null);
                                        }}
                                        className="absolute top-1 right-1 p-1 bg-white rounded-full text-red-500 shadow-sm hover:bg-red-50"
                                    >
                                        <X size={14} />
                                    </button>
                                </>
                            ) : (
                                <div className="text-center p-2">
                                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                                    <span className="text-[10px] text-slate-500 font-medium">{t('wizard.upload')}</span>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center justify-between">
                        <span>{t('wizard.idea_label')}</span>
                        <span className="text-xs text-muted-foreground font-normal">{t('wizard.idea_hint')}</span>
                    </Label>
                    <Textarea
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        placeholder={t('wizard.idea_placeholder')}
                        className="h-32 resize-none"
                    />
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleAIAnalysis}
                        disabled={isAnalyzing || idea.length < 10}
                        className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('wizard.analyzing')}
                            </>
                        ) : (
                            <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                {t('wizard.ai_fill')}
                            </>
                        )}
                    </Button>
                </div>

                {/* Business Model Selection */}
                <div className="space-y-3">
                    <Label className="text-base font-semibold text-slate-900">{t('wizard.business_model')}</Label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            {
                                id: 'B2B',
                                label: 'B2B',
                                desc: t('wizard.b2b_desc'),
                                metrics: ['Sales Quota', 'ACV', 'Pipeline']
                            },
                            {
                                id: 'B2C',
                                label: 'B2C',
                                desc: t('wizard.b2c_desc'),
                                metrics: ['Ads Conversion', 'Viral K', 'DAU']
                            },
                            {
                                id: 'B2B2C',
                                label: 'B2B2C',
                                desc: t('wizard.b2b2c_desc'),
                                metrics: ['GMV', 'Take Rate', 'Network Effect']
                            }
                        ].map((model) => (
                            <div
                                key={model.id}
                                onClick={() => setBusinessModel(model.id as any)}
                                className={`
                                    cursor-pointer relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-200
                                    ${businessModel === model.id
                                        ? 'border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600/20'
                                        : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'
                                    }
                                `}
                            >
                                <div className="flex flex-col items-center text-center space-y-1">
                                    <span className={`text-lg font-bold ${businessModel === model.id ? 'text-blue-700' : 'text-slate-700'}`}>
                                        {model.label}
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">
                                        {model.desc}
                                    </span>
                                </div>

                                {/* Metrics Preview (Hover or Active) */}
                                {(businessModel === model.id) && (
                                    <div className="mt-3 pt-3 border-t border-blue-100 w-full">
                                        <div className="flex flex-wrap justify-center gap-1">
                                            {model.metrics.map(m => (
                                                <span key={m} className="text-[9px] uppercase tracking-wide bg-white text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-semibold">
                                                    {m}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>{t('wizard.sector_label')}</Label>
                    <Select value={sector} onValueChange={setSector}>
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder={t('wizard.sector_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SaaS">{t('wizard.sect_saas')}</SelectItem>
                            <SelectItem value="E-ticaret">{t('wizard.sect_ecom')}</SelectItem>
                            <SelectItem value="Hizmet">{t('wizard.sect_service')}</SelectItem>
                            <SelectItem value="Paryakende">{t('wizard.sect_retail')}</SelectItem>
                            <SelectItem value="Üretim">{t('wizard.sect_prod')}</SelectItem>
                            <SelectItem value="Mobil Uygulama">{t('wizard.sect_mobile')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

            </CardContent>
            <CardFooter className="flex justify-between pt-2">
                <Button variant="ghost" disabled>{t('common.back')}</Button>
                <Button onClick={handleNext} disabled={!brandName || !sector} size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                    {t('common.continue')} &rarr;
                </Button>
            </CardFooter>
        </Card>
    );
}
