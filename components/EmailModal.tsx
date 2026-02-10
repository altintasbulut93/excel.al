
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Mail } from "lucide-react";
import { useFinancialStore } from "@/lib/store";

export function EmailModal({ trigger }: { trigger?: React.ReactNode }) {
    const { data } = useFinancialStore();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSend = async () => {
        if (!email) return;
        setLoading(true);
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, data })
            });

            const result = await response.json();

            if (!response.ok) {
                alert(`Gönderim başarısız: ${result.error}`);
            } else {
                setSent(true);
            }
        } catch (err) {
            console.error(err);
            alert("Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline"><Mail className="mr-2 h-4 w-4" /> E-posta Gönder</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Dosyanı E-postana Gönder</DialogTitle>
                    <DialogDescription>
                        Excel formatındaki finansal modelinizi gelen kutunuza gönderin.
                    </DialogDescription>
                </DialogHeader>

                {!sent ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-posta Adresi</Label>
                            <Input
                                id="email"
                                placeholder="ornek@sirket.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Not: Demo modunda sadece kayıtlı e-postaya gönderim yapılabilir.
                            </p>
                        </div>
                        <Button onClick={handleSend} disabled={loading || !email} className="w-full">
                            {loading ? "Gönderiliyor..." : "Gönder"}
                        </Button>
                    </div>
                ) : (
                    <div className="py-6 text-center space-y-4">
                        <div className="text-green-600 font-bold text-lg">✅ Başarıyla Gönderildi!</div>
                        <p className="text-sm text-muted-foreground">Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
