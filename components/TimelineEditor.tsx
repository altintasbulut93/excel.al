"use client";

import { useState, useEffect } from "react";
import { useFinancialStore } from "@/lib/store";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { Calendar as CalendarIcon, Plus, Trash2, Edit2, Loader2, Save } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";

import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface TimelineEvent {
    id: string;
    event_type: 'hire' | 'salary_change' | 'price_change' | 'one_time_cost' | 'product_launch';
    event_name: string;
    effective_date: string;
    payload: any;
}

export function TimelineEditor({ modelId }: { modelId: string }) {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const { t, language } = useLanguage();
    const dateLocale = language === 'tr' ? tr : enUS;

    // New Event Form State
    const [newEvent, setNewEvent] = useState({
        event_type: 'hire',
        event_name: '',
        effective_date: new Date(),
        amount: 0,
        description: ''
    });

    useEffect(() => {
        if (modelId) {
            fetchEvents();
        }
    }, [modelId]);

    async function fetchEvents() {
        setLoading(true);
        try {
            const { data: { session }, error } = await supabase!.auth.getSession();
            if (error || !session) {
                console.warn("No session found for timeline fetch");
                setLoading(false);
                return;
            }

            const res = await fetch(`/api/model/${modelId}/events`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setEvents(data.events);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    console.log("TimelineEditor Rendered with modelId:", modelId, typeof modelId);

    async function handleSaveEvent() {
        console.log("Saving event for modelId:", modelId);
        if (!modelId || modelId === 'undefined') {
            alert("Model kimliği bulunamadı. Lütfen sayfayı yenileyin.");
            return;
        }

        try {
            const { data: { session }, error } = await supabase!.auth.getSession();

            if (error || !session) {
                alert("İşlem için oturum açmanız gerekiyor. Lütfen sayfayı yenileyip tekrar giriş yapın.");
                return;
            }

            const payload = {
                amount: newEvent.amount,
                description: newEvent.description
            };

            const res = await fetch(`/api/model/${modelId}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    event_type: newEvent.event_type,
                    event_name: newEvent.event_name,
                    effective_date: format(newEvent.effective_date, 'yyyy-MM-dd'),
                    payload
                })
            });

            const data = await res.json();
            if (data.success) {
                fetchEvents();
                setOpen(false);
                setNewEvent({
                    event_type: 'hire',
                    event_name: '',
                    effective_date: new Date(),
                    amount: 0,
                    description: ''
                });
                alert("Olay başarıyla eklendi! / Event saved successfully!");
            } else {
                console.error('Server Error:', data.error);
                if (data.error === "User not found") {
                    alert("Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.");
                } else {
                    alert(`Hata/Error: ${data.error || 'Bilinmeyen hata'}`);
                }
            }
        } catch (error: any) {
            console.error('Error saving event:', error);
            alert(`Beklenmeyen Hata: ${error.message || 'Bağlantı hatası'}`);
        }
    }

    async function handleDeleteEvent(id: string) {
        if (!confirm(t('dashboard.timeline.confirm_delete'))) return;

        try {
            const { data: { session }, error } = await supabase!.auth.getSession();
            if (error || !session) {
                alert("Oturum süreniz dolmuş olabilir. Lütfen sayfayı yenileyin.");
                return;
            }

            await fetch(`/api/model/${modelId}/events/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            fetchEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    }

    if (!modelId) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">{t('dashboard.timeline.title')}</h3>
                    <p className="text-xs text-muted-foreground">Model ID: {modelId || 'YOK'}</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <Plus className="w-4 h-4" />
                            {t('dashboard.timeline.add_event')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('dashboard.timeline.new_event')}</DialogTitle>
                            <DialogDescription>
                                {t('dashboard.timeline.event_desc')}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">{t('dashboard.timeline.type')}</Label>
                                <Select
                                    value={newEvent.event_type}
                                    onValueChange={(val: any) => setNewEvent({ ...newEvent, event_type: val })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hire">{t('dashboard.timeline.types.hire')}</SelectItem>
                                        <SelectItem value="salary_change">{t('dashboard.timeline.types.salary_change')}</SelectItem>
                                        <SelectItem value="price_change">{t('dashboard.timeline.types.price_change')}</SelectItem>
                                        <SelectItem value="one_time_cost">{t('dashboard.timeline.types.one_time_cost')}</SelectItem>
                                        <SelectItem value="product_launch">{t('dashboard.timeline.types.product_launch')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">{t('dashboard.timeline.name')}</Label>
                                <Input
                                    value={newEvent.event_name}
                                    onChange={(e) => setNewEvent({ ...newEvent, event_name: e.target.value })}
                                    className="col-span-3"
                                    placeholder="e.g. Hire Senior Dev"
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">{t('dashboard.timeline.date')}</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "col-span-3 justify-start text-left font-normal",
                                                !newEvent.effective_date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {newEvent.effective_date ? format(newEvent.effective_date, "PPP", { locale: dateLocale }) : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={newEvent.effective_date}
                                            onSelect={(date) => date && setNewEvent({ ...newEvent, effective_date: date })}
                                            initialFocus
                                            locale={dateLocale}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">{t('dashboard.timeline.amount')}</Label>
                                <Input
                                    type="number"
                                    value={newEvent.amount || ''}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setNewEvent({ ...newEvent, amount: isNaN(val) ? 0 : val });
                                    }}
                                    className="col-span-3"
                                    placeholder="Impact amount"
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">{t('dashboard.timeline.notes')}</Label>
                                <Textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button onClick={handleSaveEvent}>{t('dashboard.timeline.save')}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </div>
            ) : (
                <div className="space-y-2">
                    {events.length === 0 && (
                        <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                            {t('dashboard.timeline.no_events')}
                        </div>
                    )}
                    {events.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-full text-primary">
                                    {event.event_type === 'hire' && <span className="text-xs">👤</span>}
                                    {event.event_type === 'salary_change' && <span className="text-xs">💰</span>}
                                    {event.event_type === 'price_change' && <span className="text-xs">🏷️</span>}
                                    {event.event_type === 'one_time_cost' && <span className="text-xs">💸</span>}
                                    {event.event_type === 'product_launch' && <span className="text-xs">🚀</span>}
                                </div>
                                <div>
                                    <p className="font-medium">{event.event_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(event.effective_date), 'PPP', { locale: dateLocale })} • {t(`dashboard.timeline.types.${event.event_type}`)}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
