"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  createTask,
  updateTask,
  deleteTask,
  toggleComplete,
  type Task,
} from "@/lib/api";
import TaskForm from "@/components/TaskForm";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, LogOut, Calendar, Repeat, Tag, Trash2, Edit2, CheckCircle, Circle, ChevronDown, ChevronRight, Filter } from "lucide-react";
import { toast } from "sonner";

type Props = {
  initialUser: { id: string; email: string };
  initialTasks: Task[];
};

export default function DashboardClient({ initialUser, initialTasks }: Props) {
  const router = useRouter();
  const [user] = useState(initialUser);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // View state
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [showCompleted, setShowCompleted] = useState(false);

  async function loadTasks() {
    if (!user?.id) return;
    try {
      const { data } = await authClient.getSession();
      const token = data?.session?.token;
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/${user.id}/tasks`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const list = await res.json();
        setTasks(list);
      }
    } catch (e) {
      console.error("Background sync failed", e);
    }
  }

  async function handleFormSubmit(data: any) {
    if (!user?.id) return;
    try {
      if (editingTask) {
        const updated = await updateTask(user.id, editingTask.id, data);
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
        toast.success("Task updated successfully");
      } else {
        const created = await createTask(
          user.id,
          data.title,
          data.description,
          data.priority,
          data.tags,
          data.due_date,
          data.recurring_rule
        );
        setTasks((prev) => [...prev, created]);
        toast.success("Task created successfully");
      }
      setShowForm(false);
      setEditingTask(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Operation failed");
    }
  }





  async function handleDelete(taskId: number) {
    if (!user?.id) return;
    try {
      await deleteTask(user.id, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success("Task deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  async function handleToggleComplete(taskId: number) {
    if (!user?.id) return;
    try {
      const updated = await toggleComplete(user.id, taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));

      if (updated.completed) {
        toast.success("Task completed!", { icon: "🎉" });
      }

      if (updated.recurring_rule && updated.completed) {
        loadTasks();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  }

  function startEdit(t: Task) {
    setEditingTask(t);
    setShowForm(true);
  }

  function openNewTask() {
    setEditingTask(null);
    setShowForm(true);
  }

  function getPriorityColor(p: string) {
    switch (p) {
      case "high": return "text-red-400 border-red-400/30 bg-red-400/10";
      case "medium": return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
      case "low": return "text-green-400 border-green-400/30 bg-green-400/10";
      default: return "text-gray-400 border-gray-400/30 bg-gray-400/10";
    }
  }

  const pendingTasks = tasks.filter(t => !t.completed && (filter === "all" || filter === "pending"));
  const completedTasks = tasks.filter(t => t.completed && (filter === "all" || filter === "completed"));

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-t-2 border-primary animate-spin"></div>
        <p className="text-gray-400">Loading Nexus...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black text-white overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 glass rounded-2xl p-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Mission Control
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Welcome back, <span className="text-primary">{user.email || user.id}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/chat">
              <Button variant="outline" className="border-white/10 hover:bg-white/5 hover:text-white hover:border-primary/50 transition-all">
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Assistant
              </Button>
            </Link>
            <Button
              onClick={openNewTask}
              className="bg-primary hover:bg-primary/90 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                await authClient.signOut();
                router.push("/login");
              }}
              className="text-gray-400 hover:text-white hover:bg-white/5"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-primary text-black" : "border-white/10 text-gray-400 hover:text-white"}
          >
            All
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("pending")}
            className={filter === "pending" ? "bg-primary text-black" : "border-white/10 text-gray-400 hover:text-white"}
          >
            Pending
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
            className={filter === "completed" ? "bg-primary text-black" : "border-white/10 text-gray-400 hover:text-white"}
          >
            Completed
          </Button>
        </div>

        {/* Task List */}
        {loading && !tasks.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
            <div className="h-8 w-8 rounded-full border-t-2 border-primary animate-spin"></div>
            <p>Syncing Tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center border-dashed border-2 border-white/10">
            <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">All Clear</h3>
            <p className="text-gray-400 mb-6">You have no pending tasks. Enjoy your free time!</p>
            <Button onClick={openNewTask} variant="link" className="text-primary hover:text-primary/80">
              Create your first task
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Pending Tasks Section */}
            {(filter === "all" || filter === "pending") && (
              <div className="grid gap-4">
                {pendingTasks.map((t) => (
                  <div
                    key={t.id}
                    className="group relative glass rounded-xl p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        aria-label="Toggle completion status"
                        onClick={() => handleToggleComplete(t.id)}
                        className="mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all border-gray-500 hover:border-primary text-transparent"
                      >
                        <CheckCircle className="w-4 h-4 opacity-0" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h3 className="text-lg font-medium transition-all text-gray-100">
                            {t.title}
                          </h3>
                          <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              aria-label="Edit task"
                              onClick={() => startEdit(t)}
                              className="p-2 text-gray-400 hover:text-primary hover:bg-white/5 rounded-full transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              aria-label="Delete task"
                              onClick={(e) => {
                                if (window.confirm("Are you sure you want to delete this task?")) {
                                  handleDelete(t.id);
                                }
                              }}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {t.description && (
                          <p className="mt-2 text-sm text-gray-400">
                            {t.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 mt-4">
                          {/* Priority Badge */}
                          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(t.priority)}`}>
                            {t.priority}
                          </span>

                          {/* Recurring Badge */}
                          {t.recurring_rule && (
                            <span className="px-2.5 py-0.5 text-xs font-medium text-purple-400 bg-purple-400/10 border border-purple-400/30 rounded-full flex items-center gap-1">
                              <Repeat className="w-3 h-3" /> {t.recurring_rule}
                            </span>
                          )}

                          {/* Due Date Badge */}
                          {t.due_date && (
                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border flex items-center gap-1 ${new Date(t.due_date) < new Date() && !t.completed
                              ? "text-red-400 bg-red-400/10 border-red-400/30"
                              : "text-blue-400 bg-blue-400/10 border-blue-400/30"
                              }`}>
                              <Calendar className="w-3 h-3" /> {new Date(t.due_date).toLocaleDateString()}
                            </span>
                          )}

                          {/* Tags */}
                          {t.tags && t.tags.split(',').map(tag => (
                            <span key={tag} className="px-2.5 py-0.5 text-xs text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 rounded-full flex items-center gap-1">
                              <Tag className="w-3 h-3" /> {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Completed Tasks Accordion */}
            {(filter === "all" || filter === "completed") && completedTasks.length > 0 && (
              <div className="mt-8">
                <button
                  aria-label="Toggle completed tasks visibility"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="w-full flex items-center justify-between p-4 glass rounded-xl border-white/5 hover:border-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-3 text-gray-400 group-hover:text-gray-300">
                    {showCompleted ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    <span className="font-medium">Completed Tasks ({completedTasks.length})</span>
                  </div>
                </button>

                {showCompleted && (
                  <div className="grid gap-3 mt-4 animate-in slide-in-from-top-4 duration-300 opacity-60">
                    {completedTasks.map((t) => (
                      <div
                        key={t.id}
                        className="group relative glass rounded-xl p-4 transition-all duration-300 border-white/5 grayscale-[0.8]"
                      >
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <button
                            aria-label="Toggle completion status"
                            onClick={() => handleToggleComplete(t.id)}
                            className="mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all bg-green-500 border-green-500 text-black"
                          >
                            <CheckCircle className="w-3 h-3 opacity-100" />
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <h3 className="text-base font-medium transition-all text-gray-500 line-through">
                                {t.title}
                              </h3>
                              <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                  aria-label="Delete completed task"
                                  onClick={(e) => {
                                    if (window.confirm("Are you sure you want to permanently delete this completed task?")) {
                                      handleDelete(t.id);
                                    }
                                  }}
                                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Empty state for filtered views */}
            {filter === "pending" && pendingTasks.length === 0 && (
              <div className="text-center py-10 text-gray-500">No pending tasks matching your criteria.</div>
            )}
            {filter === "completed" && completedTasks.length === 0 && (
              <div className="text-center py-10 text-gray-500">No completed tasks yet. Keep up the good work!</div>
            )}
          </div>
        )}
      </div>

      {/* Modal for Add/Edit using direct glass overlay */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-lg animate-in zoom-in-95 duration-200">
            <TaskForm
              initialTask={editingTask}
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingTask(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
