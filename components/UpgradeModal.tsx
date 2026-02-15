import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n-context";

// Initialize Stripe outside of component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function UpgradeModal({
    open,
    onClose,
    trigger
}: {
    open?: boolean;
    onClose?: (open: boolean) => void;
    trigger?: React.ReactNode
}) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);
        // Mock checkout for now if API fails or not set up
        setTimeout(() => {
            alert(t('wizard.demo_msg'));
            setLoading(false);
            if (onClose) onClose(false);
        }, 1500);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        {t('wizard.upgrade_title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('wizard.upgrade_desc')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-slate-50 p-4 rounded-lg border">
                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-lg font-semibold">{t('wizard.monthly_sub')}</span>
                            <span className="text-2xl font-bold text-primary">{t('wizard.price')}<span className="text-sm font-normal text-muted-foreground">{t('wizard.per_month')}</span></span>
                        </div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> {t('wizard.feature1')}</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> {t('wizard.feature2')}</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> {t('wizard.feature3')}</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> {t('wizard.feature4')}</li>
                        </ul>
                    </div>

                    <Button onClick={handleCheckout} disabled={loading} className="w-full size-lg text-lg font-semibold bg-primary hover:bg-primary/90">
                        {loading ? t('wizard.redirecting') : t('wizard.start_now')}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">{t('wizard.secure_payment')}</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
