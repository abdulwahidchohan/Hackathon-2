"use client";

import { useState, useEffect } from "react";
import { type Task } from "@/lib/api";

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
            // Format for datetime-local input: YYYY-MM-DDTHH:mm
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 border rounded-lg bg-white shadow-sm">
            <h3 className="text-lg font-semibold">{initialTask ? "Edit Task" : "New Task"}</h3>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Title *</label>
                <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border p-2 rounded"
                    placeholder="Buy groceries"
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border p-2 rounded"
                    placeholder="Details..."
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Priority</label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="border p-2 rounded"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Recurring</label>
                    <select
                        value={recurringRule}
                        onChange={(e) => setRecurringRule(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="">None</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Due Date</label>
                    <input
                        type="datetime-local"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="border p-2 rounded"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Tags (comma separated)</label>
                    <input
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="border p-2 rounded"
                        placeholder="work, urgent"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Save Task"}
                </button>
            </div>
        </form>
    );
}
