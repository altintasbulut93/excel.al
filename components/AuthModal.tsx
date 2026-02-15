
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail, Lock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function AuthModal({
    open,
    onClose,
    onSuccess
}: {
    open: boolean;
    onClose: () => void;
    onSuccess: (user: any) => void;
}) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [view, setView] = useState<'login' | 'register'>('login');
    const [magicLinkSent, setMagicLinkSent] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!supabase) {
            setError("Supabase istemcisi bulunamadı.");
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim(),
        });

        if (error) {
            console.error("Login Error:", error);
            if (error.message.includes("Invalid login credentials")) {
                setError("Hatalı e-posta veya şifre. Kayıt oldunuz mu?");
            } else {
                setError(error.message);
            }
        } else {
            onSuccess(data.user);
            onClose();
            window.location.reload();
        }
        setLoading(false);
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!supabase) return;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            alert("Kayıt başarılı! Lütfen e-postanızı onaylayın.");
            if (data.user) onSuccess(data.user);
            onClose();
        }
        setLoading(false);
    };

    const handleMagicLink = async () => {
        if (!email) {
            setError("Lütfen geçerli bir e-posta adresi girin.");
            return;
        }
        setLoading(true);
        setError("");

        if (!supabase) return;

        const { error } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: {
                // redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
                shouldCreateUser: true
            }
        });

        if (error) {
            setError(error.message);
        } else {
            setMagicLinkSent(true);
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (token: string) => {
        setLoading(true);
        if (!supabase) return;

        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email',
        });

        if (error) {
            setError("Kod hatalı veya süresi dolmuş.");
        } else {
            onSuccess(data.user);
            onClose();
            window.location.reload();
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{magicLinkSent ? "Kodu Girin" : "Giriş Yap veya Kayıt Ol"}</DialogTitle>
                    <DialogDescription>
                        {magicLinkSent
                            ? `${email} adresine gönderilen 6 haneli kodu girin.`
                            : "Projelerinizi bulutta saklamak için hesabınıza erişin."}
                    </DialogDescription>
                </DialogHeader>

                {magicLinkSent ? (
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Doğrulama Kodu</Label>
                            <Input
                                placeholder="123456"
                                onChange={(e) => {
                                    if (e.target.value.length === 6) handleVerifyOtp(e.target.value);
                                }}
                                className="text-center text-lg tracking-widest"
                                maxLength={6}
                            />
                        </div>
                        <Button variant="ghost" onClick={() => setMagicLinkSent(false)} className="w-full">
                            Geri Dön
                        </Button>
                    </div>
                ) : (
                    <Tabs value={view} onValueChange={(v) => setView(v as 'login' | 'register')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Giriş Yap</TabsTrigger>
                            <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login" className="space-y-4 py-2">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">E-posta</Label>
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Şifre</Label>
                                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                {error && <p className="text-sm text-red-500">{error}</p>}
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Lock className="mr-2 h-4 w-4" /> Giriş Yap</>}
                                </Button>
                            </form>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Veya Şifresiz</span></div>
                            </div>

                            <Button variant="outline" type="button" className="w-full" onClick={handleMagicLink} disabled={loading}>
                                <Mail className="mr-2 h-4 w-4" />
                                Kod ile Giriş Yap (E-posta)
                            </Button>
                        </TabsContent>

                        <TabsContent value="register" className="space-y-4 py-2">
                            <form onSubmit={handleSignUp} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="r-email">E-posta</Label>
                                    <Input id="r-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="r-password">Şifre</Label>
                                    <Input id="r-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                {error && <p className="text-sm text-red-500">{error}</p>}
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Kayıt Ol"}
                                </Button>
                            </form>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Veya Hızlı Kayıt</span></div>
                            </div>

                            <Button variant="outline" type="button" className="w-full" onClick={handleMagicLink} disabled={loading}>
                                <Mail className="mr-2 h-4 w-4" />
                                Kod ile Kayıt Ol (E-posta)
                            </Button>
                        </TabsContent>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    );
}

