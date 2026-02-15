"use client";

import { useFinancialStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Step1Business } from "@/components/wizard/Step1Business";
import { Step2Revenue } from "@/components/wizard/Step2Revenue";
import { Step3Expenses } from "@/components/wizard/Step3Expenses";
import { Step4Dashboard } from "@/components/wizard/Step4Dashboard";
import { CountrySelector } from "@/components/CountrySelector";
import { cn } from "@/lib/utils";
import { LogOut, LayoutDashboard, Crown, User, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { SubscriptionModal } from "@/components/profile/SubscriptionModal";
import { UpgradeModal } from "@/components/UpgradeModal";
import { AuthModal } from "@/components/AuthModal";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";
import { HeaderLanguageSelector } from "@/components/HeaderLanguageSelector";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { currentStep, user, isAdmin, subscriptionTier, data } = useFinancialStore();
  const { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Pro features check
  const isPro = isAdmin || subscriptionTier === 'pro' || subscriptionTier === 'enterprise';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-100 selection:text-blue-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>

      {/* 21.dev Style Modern Header with Glassmorphism */}
      <header className={cn(
        "fixed top-4 left-4 right-4 z-50 transition-all duration-300 rounded-2xl border",
        "glass-panel shadow-sm border-white/20 dark:border-white/10"
      )}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

          {/* Brand Logo - Now Interactive Profile Trigger */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSubscriptionModalOpen(true)}
              className="flex items-center gap-3 group cursor-pointer focus:outline-none"
            >
              <div className="relative w-10 h-10 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300 rounded-xl overflow-hidden">
                <img
                  src="/riskora-logo.png"
                  alt="Riskora Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {t('common.app_name')}
                </span>
                <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase group-hover:text-blue-400 transition-colors">
                  {t('common.subtitle')}
                </span>
              </div>
            </button>

            {!isPro && (
              <>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowUpgrade(true)}
                  className="hidden sm:flex bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 text-indigo-700 border-indigo-200 shadow-sm gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  {t('common.go_pro')}
                </Button>
              </>
            )}
          </div>

          {/* User Panel */}
          <div className="flex items-center gap-3">
            <HeaderLanguageSelector />

            {isAdmin && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-100">
                <Crown className="w-3.5 h-3.5" />
                <span>{t('common.admin_mode')}</span>
              </div>
            )}


            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-slate-100 transition-colors">
                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'Kullanıcı'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isPro && (
                    <DropdownMenuItem className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>{t('common.dashboard')}</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="cursor-pointer" onClick={() => setSubscriptionModalOpen(true)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('common.profile')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('common.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-5 shadow-lg shadow-slate-200/50"
                onClick={() => setAuthModalOpen(true)}
              >
                {t('common.login')}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area with Layered UI */}
      <div className="pt-32 pb-20 px-4 md:px-8 bg-dot-pattern min-h-screen">

        {/* Progress & Title Section (Only visible on steps < 3) */}
        {currentStep < 3 && (
          <div className="max-w-3xl mx-auto mb-12 text-center space-y-6">
            <div className="inline-flex items-center justify-center p-1 rounded-full bg-white/50 border border-slate-200 backdrop-blur-sm shadow-sm mb-4">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={cn(
                    "flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
                    currentStep + 1 === step
                      ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                      : currentStep + 1 > step
                        ? "text-slate-400"
                        : "text-slate-400 opacity-50"
                  )}
                >
                  <span className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] mr-2 border transition-colors",
                    currentStep + 1 >= step ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300"
                  )}>
                    {step}
                  </span>
                  {step === 1 && t('common.step1')}
                  {step === 2 && t('common.step2')}
                  {step === 3 && t('common.step3')}
                </div>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              {currentStep === 0 && (
                <>
                  {t('home.title_1')} <span className="text-blue-600">{t('home.title_1_highlight')}</span>.
                </>
              )}
              {currentStep === 1 && (
                <>
                  {t('home.title_2')} <span className="text-green-600">{t('home.title_2_highlight')}</span>.
                </>
              )}
              {currentStep === 2 && (
                <>
                  {t('home.title_3')} <span className="text-purple-600">{t('home.title_3_highlight')}</span>.
                </>
              )}
            </h1>

            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              {t('home.description')}
            </p>
          </div>
        )}

        {/* Dynamic Content - Wrappers applied inside components, or we apply a general style here if needed */}
        <div className="w-full max-w-7xl mx-auto transition-all duration-500 ease-out">
          {currentStep === 0 && (
            <div className="card-premium p-1">
              <Step1Business />
            </div>
          )}
          {currentStep === 1 && (
            <div className="card-premium p-1">
              <Step2Revenue />
            </div>
          )}
          {currentStep === 2 && (
            <div className="card-premium p-1">
              <Step3Expenses />
            </div>
          )}
          {currentStep === 3 && <Step4Dashboard />} {/* Dashboard usually has its own layout */}
        </div>
      </div>

      {/* Country Selector Modal (Hidden/Background) */}
      <CountrySelector
        open={false}
        onClose={() => { }}
        onSelect={(country) => {
          console.log('Country selected:', country);
        }}
      />

      {/* Upgrade to Pro Modal */}
      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
      />


      {/* Subscription & Profile Modal */}
      <SubscriptionModal
        open={subscriptionModalOpen}
        onOpenChange={setSubscriptionModalOpen}
      />

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          // Optional: Reload or fetch profile
        }}
      />
    </main>
  );
}
