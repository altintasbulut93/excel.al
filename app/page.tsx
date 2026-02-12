
"use client";

import { useState } from "react";
import { useFinancialStore } from "@/lib/store";
import { Step1Business } from "@/components/wizard/Step1Business";
import { Step2Revenue } from "@/components/wizard/Step2Revenue";
import { Step3Expenses } from "@/components/wizard/Step3Expenses";
import { Step4Dashboard } from "@/components/wizard/Step4Dashboard";
import { CountrySelector } from "@/components/CountrySelector";
import { cn } from "@/lib/utils";

export default function Home() {
  const { currentStep, isAdmin, user } = useFinancialStore();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col items-center py-10 px-4">

      {/* HEADER */}
      {currentStep < 3 && (
        <div className="w-full max-w-2xl text-center mb-10 space-y-4">
          <div className="inline-block p-3 rounded-2xl bg-white shadow-xl mb-4">
            <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              excel.al
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
            Yatırımcıya Hazır Finansal Modelinizi Oluşturun
          </h2>
          <p className="text-muted-foreground">
            5 dakika içinde gelir modelinizi, giderlerinizi ve nakit akışınızı hesaplayın.
          </p>

          {/* Admin Badge */}
          {isAdmin && user && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-semibold shadow-lg">
              <span>👑</span>
              <span>Admin Mode</span>
              <span className="text-xs opacity-80">({user.email})</span>
            </div>
          )}

          {/* PROGRESS STEPS */}
          <div className="flex justify-center items-center mt-8 gap-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300",
                  currentStep + 1 >= step
                    ? "bg-primary border-primary text-white scale-110 shadow-md"
                    : "bg-background border-muted text-muted-foreground"
                )}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={cn(
                    "w-12 h-1 bg-muted rounded mx-2",
                    currentStep + 1 > step && "bg-primary"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="w-full transition-all duration-500 ease-in-out">
        {currentStep === 0 && <Step1Business />}
        {currentStep === 1 && <Step2Revenue />}
        {currentStep === 2 && <Step3Expenses />}
        {currentStep === 3 && <Step4Dashboard />}
      </div>

      {/* Country Selector Modal */}
      <CountrySelector
        open={false}
        onClose={() => { }}
        onSelect={(country) => {
          console.log('Country selected:', country);
        }}
      />

    </main>
  );
}
