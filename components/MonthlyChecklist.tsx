"use client";

import { useState, useEffect } from "react";
import { useFinancialStore } from "@/lib/store";
import { format } from "date-fns";
import { Check, Loader2, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface ChecklistTask {
    id: string;
    title: string;
    completed: boolean;
}

interface MonthlyChecklistData {
    id?: string;
    tasks: ChecklistTask[];
    completed_count: number;
    total_count: number;
}

export function MonthlyChecklist({ modelId }: { modelId: string }) {
    const [checklist, setChecklist] = useState<MonthlyChecklistData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentMonth] = useState(format(new Date(), 'yyyy-MM-dd'));
    const { user } = useFinancialStore();

    useEffect(() => {
        if (modelId && user) {
            fetchChecklist();
        }
    }, [modelId, user]);

    async function fetchChecklist() {
        setLoading(true);
        try {
            const res = await fetch(`/api/model/${modelId}/checklist/${currentMonth}`, {
                headers: { 'Authorization': `Bearer ${user?.id}` } // Note: In real app use session token
                // Here we rely on cookie auth for RLS if using browser client
            });
            const data = await res.json();
            if (data.success) {
                setChecklist(data.checklist);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleToggleTask(taskId: string) {
        if (!checklist) return;

        // Optimistic update
        const newTasks = checklist.tasks.map(t =>
            t.id === taskId ? { ...t, completed: true } : t
        );
        const newCompletedCount = newTasks.filter(t => t.completed).length;

        setChecklist({
            ...checklist,
            tasks: newTasks,
            completed_count: newCompletedCount
        });

        try {
            await fetch(`/api/model/${modelId}/checklist/${currentMonth}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': ... (cookie handled automatically)
                },
                body: JSON.stringify({ taskId })
            });
        } catch (error) {
            console.error('Error updating task:', error);
            fetchChecklist(); // Revert on error
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    if (!checklist) return null;

    const progress = (checklist.completed_count / checklist.total_count) * 100;
    const isComplete = progress === 100;

    return (
        <Card className={cn("border-2", isComplete ? "border-green-500/50 bg-green-50/10" : "border-border")}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            📅 Aylık Kontrol Listesi
                            {isComplete && <Award className="w-5 h-5 text-yellow-500" />}
                        </CardTitle>
                        <CardDescription>
                            {format(new Date(currentMonth), 'MMMM yyyy')} için yapılması gerekenler
                        </CardDescription>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                        {checklist.completed_count}/{checklist.total_count}
                    </div>
                </div>
                <Progress value={progress} className="h-2" />
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    {checklist.tasks.map((task) => (
                        <div
                            key={task.id}
                            onClick={() => !task.completed && handleToggleTask(task.id)}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer",
                                task.completed
                                    ? "bg-primary/5 text-muted-foreground line-through"
                                    : "hover:bg-accent"
                            )}
                        >
                            <div className={cn(
                                "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                task.completed
                                    ? "bg-green-500 border-green-500 text-white"
                                    : "border-muted-foreground"
                            )}>
                                {task.completed && <Check className="w-3 h-3" />}
                            </div>
                            <span className="text-sm font-medium">{task.title}</span>
                        </div>
                    ))}
                </div>

                {isComplete && (
                    <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm text-center font-medium animate-in fade-in zoom-in">
                        🎉 Harika! Bu ayki hedeflerini tamamladın.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
