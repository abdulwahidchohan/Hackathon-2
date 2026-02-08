"use client";
// Phase III — Todo chatbot UI (chat endpoint)
// [From]: Hackathon Phase III — conversational interface

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { sendChatMessage } from "@/lib/api";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id || !input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    setError("");
    try {
      const res = await sendChatMessage(user.id, text, conversationId);
      setConversationId(res.conversation_id);
      setMessages((prev) => [...prev, { role: "assistant", content: res.response }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return <p style={{ padding: "2rem" }}>Loading…</p>;

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "1rem", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1>Todo Chat</h1>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Link href="/dashboard">Tasks</Link>
          <button
            type="button"
            className="secondary"
            onClick={async () => {
              await authClient.signOut();
              router.push("/login");
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <p style={{ fontSize: "0.875rem", color: "#666", marginBottom: "1rem" }}>
        Ask in plain language: &quot;Add a task to buy groceries&quot;, &quot;Show my tasks&quot;, &quot;Mark task 3 complete&quot;, etc.
      </p>

      <div style={{ flex: 1, overflow: "auto", marginBottom: "1rem" }}>
        {messages.length === 0 && (
          <p style={{ color: "#888" }}>No messages yet. Say something like &quot;Show me all my tasks&quot; or &quot;Add a task: call mom&quot;.</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              marginBottom: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: 8,
              backgroundColor: m.role === "user" ? "#eff6ff" : "#f3f4f6",
              marginLeft: m.role === "user" ? "2rem" : 0,
              marginRight: m.role === "assistant" ? "2rem" : 0,
            }}
          >
            <strong style={{ fontSize: "0.75rem", color: "#666" }}>{m.role === "user" ? "You" : "Assistant"}</strong>
            <div style={{ marginTop: "0.25rem", whiteSpace: "pre-wrap" }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ padding: "0.75rem", color: "#666" }}>Thinking…</div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginBottom: "0.5rem" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </main>
  );
}
