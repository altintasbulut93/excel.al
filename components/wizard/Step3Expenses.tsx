
"use client";

import { useFinancialStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { formatCurrency } from "@/lib/utils";

export function Step3Expenses() {
    const { data, setData, setStep } = useFinancialStore();

    const [team, setTeam] = useState(data.team);
    const [fixedExpenses, setFixedExpenses] = useState(data.fixedExpenses);
    const [marketingBudget, setMarketingBudget] = useState(data.marketing.value);
    const [marketingType, setMarketingType] = useState(data.marketing.type);

    // Add Team Member
    const addTeamMember = () => {
        setTeam([...team, { id: uuidv4(), role: "Yeni Rol", count: 1, salary: 20002.50, isNetSalary: false }]);
    };

    const updateTeamMember = (id: string, field: string, value: any) => {
        setTeam(team.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const removeTeamMember = (id: string) => {
        setTeam(team.filter(t => t.id !== id));
    };

    // Add Expense
    const addExpense = () => {
        setFixedExpenses([...fixedExpenses, { id: uuidv4(), name: "Yeni Gider", amount: 1000, currency: 'TRY' }]);
    };

    const updateExpense = (id: string, field: string, value: any) => {
        setFixedExpenses(fixedExpenses.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const removeExpense = (id: string) => {
        setFixedExpenses(fixedExpenses.filter(e => e.id !== id));
    };

    const handleNext = () => {
        setData({
            team,
            fixedExpenses,
            marketing: { type: marketingType, value: marketingBudget }
        });
        setStep(3); // Result/Preview Step
    };

    const handleBack = () => setStep(1);

    return (
        <Card className="w-full max-w-3xl mx-auto shadow-lg border-primary/20">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Giderler & Ekip</CardTitle>
                <CardDescription>Maliyet yapınızı oluşturun. SGK ve vergileri biz hesaplayacağız.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">

                {/* TEAM SECTION */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-lg flex items-center gap-2"><Users className="w-4 h-4" /> Ekip Planı</Label>
                        <Button size="sm" variant="secondary" onClick={addTeamMember}><Plus className="w-4 h-4 mr-1" /> Ekle</Button>
                    </div>

                    {team.length === 0 && <p className="text-sm text-muted-foreground italic">Henüz ekip üyesi eklemediniz.</p>}

                    <div className="grid gap-3">
                        {team.map((member) => (
                            <div key={member.id} className="grid grid-cols-12 gap-2 items-center bg-muted/30 p-2 rounded-md">
                                <div className="col-span-5">
                                    <Input
                                        value={member.role}
                                        onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                                        placeholder="Rol (Örn: Yazılımcı)"
                                        className="h-8"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Input
                                        type="number"
                                        value={member.count}
                                        onChange={(e) => updateTeamMember(member.id, 'count', Number(e.target.value))}
                                        className="h-8 text-center"
                                    />
                                </div>
                                <div className="col-span-4">
                                    <Input
                                        type="number"
                                        value={member.salary}
                                        onChange={(e) => updateTeamMember(member.id, 'salary', Number(e.target.value))}
                                        placeholder="Maaş"
                                        className="h-8"
                                    />
                                    <span className="text-[10px] text-muted-foreground ml-1">Brüt TL</span>
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeTeamMember(member.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* EXPENSES SECTION */}
                <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <Label className="text-lg">Sabit Giderler</Label>
                        <Button size="sm" variant="secondary" onClick={addExpense}><Plus className="w-4 h-4 mr-1" /> Ekle</Button>
                    </div>

                    <div className="grid gap-3">
                        {fixedExpenses.map((expense) => (
                            <div key={expense.id} className="grid grid-cols-12 gap-2 items-center bg-muted/30 p-2 rounded-md">
                                <div className="col-span-7">
                                    <Input
                                        value={expense.name}
                                        onChange={(e) => updateExpense(expense.id, 'name', e.target.value)}
                                        placeholder="Gider Adı (Örn: Ofis Kirası)"
                                        className="h-8"
                                    />
                                </div>
                                <div className="col-span-4">
                                    <Input
                                        type="number"
                                        value={expense.amount}
                                        onChange={(e) => updateExpense(expense.id, 'amount', Number(e.target.value))}
                                        placeholder="Tutar"
                                        className="h-8"
                                    />
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeExpense(expense.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MARKETING */}
                <div className="space-y-4 pt-4 border-t">
                    <Label className="text-lg">Pazarlama Bütçesi</Label>
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <Label className="text-xs mb-1 block">Tür</Label>
                            <div className="flex gap-1 h-9 rounded-md bg-muted p-1">
                                <button
                                    className={`flex-1 text-sm rounded-sm ${marketingType === 'percentage' ? 'bg-background shadow-sm' : ''}`}
                                    onClick={() => setMarketingType('percentage')}
                                >
                                    % Ciro
                                </button>
                                <button
                                    className={`flex-1 text-sm rounded-sm ${marketingType === 'fixed' ? 'bg-background shadow-sm' : ''}`}
                                    onClick={() => setMarketingType('fixed')}
                                >
                                    Sabit (TL)
                                </button>
                            </div>
                        </div>
                        <div className="flex-[2]">
                            <Label className="text-xs mb-1 block">Değer</Label>
                            <Input
                                type="number"
                                value={marketingBudget}
                                onChange={(e) => setMarketingBudget(Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {marketingType === 'percentage'
                            ? `Her ay cironun %${(marketingBudget * 100).toFixed(0)}'si pazarlamaya ayrılacak.`
                            : `Her ay sabit ${formatCurrency(marketingBudget)} pazarlamaya harcanacak.`}
                    </p>
                </div>

            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={handleBack}>&larr; Geri</Button>
                <Button onClick={handleNext} size="lg">Hesapla & Önizle &rarr;</Button>
            </CardFooter>
        </Card>
    );
}
