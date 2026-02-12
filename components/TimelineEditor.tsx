"use client";

import { useState, useEffect } from "react";
import { useFinancialStore } from "@/lib/store";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon, Plus, Trash2, Edit2, Loader2, Save } from "lucide-react";

import { cn } from "@/lib/utils";
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
            const res = await fetch(`/api/model/${modelId}/events`);
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

    async function handleSaveEvent() {
        try {
            const payload = {
                amount: newEvent.amount,
                description: newEvent.description
            };

            const res = await fetch(`/api/model/${modelId}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            }
        } catch (error) {
            console.error('Error saving event:', error);
        }
    }

    async function handleDeleteEvent(id: string) {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            await fetch(`/api/model/${modelId}/events/${id}`, { method: 'DELETE' });
            fetchEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    }

    if (!modelId) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Timeline Events</h3>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Event</DialogTitle>
                            <DialogDescription>
                                Add a significant event that impacts your financial model.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Type</Label>
                                <Select
                                    value={newEvent.event_type}
                                    onValueChange={(val: any) => setNewEvent({ ...newEvent, event_type: val })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hire">Hire Employee</SelectItem>
                                        <SelectItem value="salary_change">Salary Change</SelectItem>
                                        <SelectItem value="price_change">Price Change</SelectItem>
                                        <SelectItem value="one_time_cost">One-time Cost</SelectItem>
                                        <SelectItem value="product_launch">Product Launch</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Name</Label>
                                <Input
                                    value={newEvent.event_name}
                                    onChange={(e) => setNewEvent({ ...newEvent, event_name: e.target.value })}
                                    className="col-span-3"
                                    placeholder="e.g. Hire Senior Dev"
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Date</Label>
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
                                            {newEvent.effective_date ? format(newEvent.effective_date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={newEvent.effective_date}
                                            onSelect={(date) => date && setNewEvent({ ...newEvent, effective_date: date })}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Amount</Label>
                                <Input
                                    type="number"
                                    value={newEvent.amount}
                                    onChange={(e) => setNewEvent({ ...newEvent, amount: parseFloat(e.target.value) })}
                                    className="col-span-3"
                                    placeholder="Impact amount"
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Notes</Label>
                                <Textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button onClick={handleSaveEvent}>Save Event</Button>
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
                            No events found. Add events to see impact on your model.
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
                                        {format(new Date(event.effective_date), 'PPP')} • {event.event_type.replace('_', ' ')}
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
