// Phase II — API client with JWT (Better Auth token)
// [From]: Hackathon spec — attach JWT to every API request

import { getToken } from "./auth-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Task = {
  id: number;
  user_id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

async function fetchWithAuth(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}

export async function getTasks(userId: string): Promise<Task[]> {
  const res = await fetchWithAuth(`/api/${encodeURIComponent(userId)}/tasks`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createTask(
  userId: string,
  title: string,
  description = ""
): Promise<Task> {
  const res = await fetchWithAuth(`/api/${encodeURIComponent(userId)}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateTask(
  userId: string,
  taskId: number,
  data: { title?: string; description?: string }
): Promise<Task> {
  const res = await fetchWithAuth(
    `/api/${encodeURIComponent(userId)}/tasks/${taskId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteTask(
  userId: string,
  taskId: number
): Promise<{ ok: boolean; id: number }> {
  const res = await fetchWithAuth(
    `/api/${encodeURIComponent(userId)}/tasks/${taskId}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function toggleComplete(
  userId: string,
  taskId: number
): Promise<Task> {
  const res = await fetchWithAuth(
    `/api/${encodeURIComponent(userId)}/tasks/${taskId}/complete`,
    { method: "PATCH" }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Phase III — Chat API
export type ChatResponse = {
  conversation_id: number;
  response: string;
  tool_calls: Array<{ name?: string; arguments?: Record<string, unknown> }>;
};

export async function sendChatMessage(
  userId: string,
  message: string,
  conversationId: number | null = null
): Promise<ChatResponse> {
  const res = await fetchWithAuth(`/api/${encodeURIComponent(userId)}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, conversation_id: conversationId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
