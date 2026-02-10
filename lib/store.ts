
import { FinancialInput } from "./engine/types";
import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

// Extending FinancialInput since we might need UI specific state
export interface FinancialState extends FinancialInput {
    // UI States
    currentStep: number;
}

const defaultState: FinancialInput = {
    businessName: '',
    sector: '',
    revenueModel: 'subscription',
    pricing: { amount: 0, currency: 'TRY', period: 'monthly' },
    growth: { initialCustomers: 0, monthlyGrowthRate: 0.10 },
    team: [],
    fixedExpenses: [],
    marketing: { type: 'percentage', value: 0.20 },
    startingCapital: 0
};

interface FinancialStore {
    data: FinancialInput;
    currentStep: number;
    user: User | null;
    setData: (data: Partial<FinancialInput>) => void;
    setStep: (step: number) => void;
    setUser: (user: User | null) => void;
    reset: () => void;
}

export const useFinancialStore = create<FinancialStore>((set) => ({
    data: defaultState,
    currentStep: 0,
    user: null,
    setData: (newData) => set((state) => ({ data: { ...state.data, ...newData } })),
    setStep: (step) => set({ currentStep: step }),
    setUser: (user) => set({ user }),
    reset: () => set({ data: defaultState, currentStep: 0 }),
}));
