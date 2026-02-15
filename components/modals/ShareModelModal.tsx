
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Copy, Check, Loader2, Link as LinkIcon, Lock, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";

interface ShareModelModalProps {
    open: boolean;
    onClose: () => void;
    modelId: string | null;
}

export function ShareModelModal({ open, onClose, modelId }: ShareModelModalProps) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [expiry, setExpiry] = useState("7"); // days
    const [isPasswordProtected, setIsPasswordProtected] = useState(false);
    const [password, setPassword] = useState("");
    const [copied, setCopied] = useState(false);

    const handleCreateLink = async () => {
        if (!modelId) return;
        setLoading(true);
        try {
            const res = await fetch('/api/share/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    modelId,
                    expiryDays: expiry === 'forever' ? null : parseInt(expiry),
                    password: isPasswordProtected ? password : null
                })
            });

            const data = await res.json();
            if (data.success) {
                const link = `${window.location.origin}/invest/${data.token}`;
                setGeneratedLink(link);
            } else {
                alert(t('share_modal.share_error') + ": " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert(t('share_modal.share_error'));
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Reset state when closed
    const handleClose = () => {
        setGeneratedLink(null);
        setIsPasswordProtected(false);
        setPassword("");
        onClose();
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            handleClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-500" />
                        {t('share_modal.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('share_modal.desc')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {!generatedLink ? (
                        <div key="create-form" className="space-y-4 animate-in fade-in slide-in-from-left-4">
                            {/* Expiry Selection */}
                            <div className="space-y-2">
                                <Label>{t('share_modal.expiry_label')}</Label>
                                <Select value={expiry} onValueChange={setExpiry}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">{t('share_modal.expiry_7d')}</SelectItem>
                                        <SelectItem value="30">{t('share_modal.expiry_30d')}</SelectItem>
                                        <SelectItem value="forever">{t('share_modal.expiry_forever')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Password Protection */}
                            <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base">{t('share_modal.password_label')}</Label>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Lock className="w-3 h-3" />
                                        {isPasswordProtected ? "Enabled" : "Disabled"}
                                    </div>
                                </div>
                                <Switch
                                    checked={isPasswordProtected}
                                    onCheckedChange={setIsPasswordProtected}
                                />
                            </div>

                            {isPasswordProtected && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label>Password</Label>
                                    <Input
                                        type="text"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t('share_modal.password_placeholder')}
                                    />
                                </div>
                            )}

                            <Button onClick={handleCreateLink} disabled={loading || (isPasswordProtected && !password)} className="w-full">
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                                {t('share_modal.create_link')}
                            </Button>
                        </div>
                    ) : (
                        <div key="result-view" className="space-y-4 animate-in fade-in zoom-in-95">
                            <div className="flex items-center space-x-2">
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="link" className="sr-only">
                                        Link
                                    </Label>
                                    <Input
                                        id="link"
                                        defaultValue={generatedLink}
                                        readOnly
                                        className="bg-muted text-muted-foreground"
                                    />
                                </div>
                                <Button size="sm" className="px-3" onClick={handleCopy}>
                                    <span className="sr-only">Copy</span>
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                            <div className="text-sm text-center text-muted-foreground">
                                {t('share_modal.active_shares')}: 1
                            </div>
                            <Button variant="outline" className="w-full" onClick={handleClose}>
                                Done
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
