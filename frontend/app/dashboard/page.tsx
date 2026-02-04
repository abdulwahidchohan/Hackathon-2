"use client";
// Phase II — Task list + add/update/delete/complete
// [From]: specs/features/task-crud.md

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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await authClient.getSession();
      if (!data?.user) {
        router.replace("/login");
        return;
      }
      setUser(data.user as { id: string });
    })();
  }, [router]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      try {
        const list = await getTasks(user.id);
        setTasks(list);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id || !newTitle.trim()) return;
    setError("");
    try {
      const task = await createTask(user.id, newTitle.trim(), newDesc.trim());
      setTasks((prev) => [...prev, task]);
      setNewTitle("");
      setNewDesc("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add");
    }
  }

  async function handleUpdate(e: React.FormEvent, taskId: number) {
    e.preventDefault();
    if (!user?.id) return;
    setError("");
    try {
      const updated = await updateTask(user.id, taskId, {
        title: editTitle.trim() || undefined,
        description: editDesc !== undefined ? editDesc : undefined,
      });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    }
  }

  async function handleDelete(taskId: number) {
    if (!user?.id) return;
    setError("");
    try {
      await deleteTask(user.id, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  async function handleToggleComplete(taskId: number) {
    if (!user?.id) return;
    setError("");
    try {
      const updated = await toggleComplete(user.id, taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    }
  }

  function startEdit(t: Task) {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditDesc(t.description);
  }

  if (!user) return <p style={{ padding: "2rem" }}>Loading…</p>;

  return (
    <main style={{ maxWidth: 640, margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1>Evolution of Todo</h1>
        <div>
          <span style={{ marginRight: "0.5rem" }}>{user.id}</span>
          <button
            type="button"
            className="secondary"
            onClick={async () => {
              await authClient.signOut({ callbackURL: "/login" });
              router.push("/login");
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <input
          placeholder="New task title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          required
        />
        <input
          placeholder="Description (optional)"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
        />
        <button type="submit">Add task</button>
      </form>

      {error && <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p>}

      {loading ? (
        <p>Loading tasks…</p>
      ) : tasks.length === 0 ? (
        <p>No tasks yet. Add one above.</p>
      ) : (
        <ul style={{ listStyle: "none" }}>
          {tasks.map((t) => (
            <li
              key={t.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "0.75rem 1rem",
                marginBottom: "0.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {editingId === t.id ? (
                <form onSubmit={(e) => handleUpdate(e, t.id)} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                  <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Description" />
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="submit">Save</button>
                    <button type="button" className="secondary" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => handleToggleComplete(t.id)}
                      style={{ width: "1rem", height: "1rem" }}
                    />
                    <strong style={{ textDecoration: t.completed ? "line-through" : "none" }}>{t.title}</strong>
                  </div>
                  {t.description && <p style={{ fontSize: "0.875rem", color: "#666" }}>{t.description}</p>}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="button" className="secondary" onClick={() => startEdit(t)}>Edit</button>
                    <button type="button" className="danger" onClick={() => handleDelete(t.id)}>Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
