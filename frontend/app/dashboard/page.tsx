"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleComplete,
  type Task,
} from "@/lib/api";
import TaskForm from "@/components/TaskForm";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await authClient.getSession();
      if (!data?.user) {
        router.replace("/login");
        return;
      }
      setUser(data.user as { id: string; email: string });
    })();
  }, [router]);

  useEffect(() => {
    if (!user?.id) return;
    loadTasks();
  }, [user?.id]);

  async function loadTasks() {
    if (!user?.id) return;
    setLoading(true);
    try {
      const list = await getTasks(user.id);
      setTasks(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  async function handleFormSubmit(data: any) {
    if (!user?.id) return;
    try {
      if (editingTask) {
        const updated = await updateTask(user.id, editingTask.id, data);
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
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
      }
      setShowForm(false);
      setEditingTask(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Operation failed");
    }
  }

  async function handleDelete(taskId: number) {
    if (!user?.id) return;
    if (!confirm("Are you sure?")) return;
    try {
      await deleteTask(user.id, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  async function handleToggleComplete(taskId: number) {
    if (!user?.id) return;
    try {
      const updated = await toggleComplete(user.id, taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      // If recurring, we might want to reload to see the new task, but simpler to just update the current one for now.
      if (updated.recurring_rule && updated.completed) {
        loadTasks(); // Reload to see the newly created next instance
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
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
      case "high": return "text-red-600 bg-red-50 border-red-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  }

  if (!user) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <main className="max-w-3xl mx-auto p-4 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500">Welcome, {user.email || user.id}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/chat"
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            Chat with AI
          </Link>
          <button
            onClick={openNewTask}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
          >
            + New Task
          </button>
          <button
            onClick={async () => {
              await authClient.signOut();
              router.push("/login");
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border hover:bg-gray-50 rounded-md transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* Modal for Add/Edit */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg">
            <TaskForm
              initialTask={editingTask}
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingTask(null); }}
            />
          </div>
        </div>
      )}

      {loading && !tasks.length ? (
        <div className="text-center py-12 text-gray-500">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">No tasks found.</p>
          <button onClick={openNewTask} className="text-blue-600 hover:underline">Create your first task</button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <div
              key={t.id}
              className={`group flex items-start gap-3 p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${t.completed ? "opacity-75 bg-gray-50" : ""}`}
            >
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => handleToggleComplete(t.id)}
                className="mt-1.5 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <h3 className={`font-medium text-gray-900 ${t.completed ? "line-through text-gray-500" : ""}`}>
                      {t.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {/* Priority Badge */}
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border uppercase ${getPriorityColor(t.priority)}`}>
                        {t.priority}
                      </span>

                      {/* Recurring Badge */}
                      {t.recurring_rule && (
                        <span className="px-2 py-0.5 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-full flex items-center gap-1">
                          ↻ {t.recurring_rule}
                        </span>
                      )}

                      {/* Due Date Badge */}
                      {t.due_date && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${new Date(t.due_date) < new Date() && !t.completed
                          ? "text-red-700 bg-red-50 border-red-200"
                          : "text-gray-600 bg-gray-50 border-gray-200"
                          }`}>
                          📅 {new Date(t.due_date).toLocaleDateString()}
                        </span>
                      )}

                      {/* Tags */}
                      {t.tags && t.tags.split(',').map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-full">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(t)}
                      className="p-1 px-2 text-xs text-gray-600 hover:bg-gray-100 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1 px-2 text-xs text-red-600 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {t.description && (
                  <p className={`mt-2 text-sm text-gray-600 ${t.completed ? "line-through" : ""}`}>
                    {t.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
