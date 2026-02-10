
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

// Initialize Stripe outside of component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function UpgradeModal({ trigger }: { trigger?: React.ReactNode }) {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modelId: 'demo' }) // Normally pass actual model ID
            });

            const { sessionId, url, error } = await response.json();

            if (error) {
                alert(`Ödeme başlatılamadı: ${error}`);
                setLoading(false);
                return;
            }

            if (url) {
                window.location.href = url; // Redirect to Stripe Checkout
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || <Button variant="default" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-lg">👑 Premium'a Geç</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        🚀 Pro Plan'a Yükseltin
                    </DialogTitle>
                    <DialogDescription>
                        Yatırımcı sunumlarınızı power-up yapın.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-slate-50 p-4 rounded-lg border">
                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-lg font-semibold">Aylık Abonelik</span>
                            <span className="text-2xl font-bold text-primary">₺499<span className="text-sm font-normal text-muted-foreground">/ay</span></span>
                        </div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Sınırsız Finansal Model</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Excel & PDF İndirme</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Detaylı Sektör Benchmarkları</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> AI Destekli İpuçları</li>
                        </ul>
                    </div>

                    <Button onClick={handleCheckout} disabled={loading} className="w-full size-lg text-lg font-semibold bg-primary hover:bg-primary/90">
                        {loading ? "Yönlendiriliyor..." : "Hemen Başla"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">Güvenli ödeme altyapısı Stripe tarafından sağlanmaktadır.</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
