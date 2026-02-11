"use client";

import { useState, useEffect } from "react";
import { type Task } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have this or use native
import { Label } from "@/components/ui/label";
import { Loader2, Calendar, Tag, Repeat, AlertCircle } from "lucide-react";

type TaskFormProps = {
    initialTask?: Task | null;
    onSubmit: (data: {
        title: string;
        description: string;
        priority: "low" | "medium" | "high";
        tags: string | null;
        due_date: string | null;
        recurring_rule: string | null;
    }) => Promise<void>;
    onCancel: () => void;
};

export default function TaskForm({ initialTask, onSubmit, onCancel }: TaskFormProps) {
    const [title, setTitle] = useState(initialTask?.title || "");
    const [description, setDescription] = useState(initialTask?.description || "");
    const [priority, setPriority] = useState<"low" | "medium" | "high">(
        initialTask?.priority || "medium"
    );
    const [tags, setTags] = useState(initialTask?.tags || "");
    const [dueDate, setDueDate] = useState<string>("");
    const [recurringRule, setRecurringRule] = useState(initialTask?.recurring_rule || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (initialTask?.due_date) {
            const dt = new Date(initialTask.due_date);
            dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
            setDueDate(dt.toISOString().slice(0, 16));
        } else {
            setDueDate("");
        }
    }, [initialTask]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await onSubmit({
                title,
                description,
                priority,
                tags: tags.trim() || null,
                due_date: dueDate ? new Date(dueDate).toISOString() : null,
                recurring_rule: recurringRule || null,
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to save task");
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="glass border-white/10 rounded-xl p-6 relative overflow-hidden">
            {/* Gradient Border Overlay */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>

            <div className="mb-6">
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    {initialTask ? "Update Mission" : "New Directive"}
                </h3>
                <p className="text-sm text-gray-400">
                    {initialTask ? "Modify existing parameters." : "Define a new task for the system."}
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-300">Title</Label>
                    <Input
                        id="title"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus:ring-primary/50 focus:border-primary/50"
                        placeholder="e.g. Calibrate sensors"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="desc" className="text-gray-300">Description</Label>
                    <textarea
                        id="desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="flex min-h-[80px] w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Providing additional context..."
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-gray-300">Priority Level</Label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as any)}
                            className="w-full h-10 rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                        >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-300 flex items-center gap-2">
                            <Repeat className="w-3 h-3" /> Recurrence
                        </Label>
                        <select
                            value={recurringRule}
                            onChange={(e) => setRecurringRule(e.target.value)}
                            className="w-full h-10 rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                        >
                            <option value="">One-time Mission</option>
                            <option value="daily">Daily Cycle</option>
                            <option value="weekly">Weekly Cycle</option>
                            <option value="monthly">Monthly Cycle</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-gray-300 flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Due Date
                        </Label>
                        <Input
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus:ring-primary/50 focus:border-primary/50 [color-scheme:dark]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-300 flex items-center gap-2">
                            <Tag className="w-3 h-3" /> Tags
                        </Label>
                        <Input
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus:ring-primary/50 focus:border-primary/50"
                            placeholder="work, urgent"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={loading}
                    className="text-gray-400 hover:text-white hover:bg-white/5"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all"
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> saving...
                        </div>
                    ) : (
                        initialTask ? "Update Mission" : "Initiate Task"
                    )}
                </Button>
            </div>
        </form>
    );
}
