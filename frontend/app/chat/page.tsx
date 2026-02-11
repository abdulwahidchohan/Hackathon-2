"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { sendChatMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, Bot, User, Trash2, LogOut } from "lucide-react";
import { toast } from "sonner";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
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

    try {
      const res = await sendChatMessage(user.id, text, conversationId);
      setConversationId(res.conversation_id);
      setMessages((prev) => [...prev, { role: "assistant", content: res.response }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Send failed");
      setMessages((prev) => prev.slice(0, -1)); // Remove failed message
      setInput(text); // Restore input
    } finally {
      setLoading(false);
    }
  }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-t-2 border-primary animate-spin"></div>
        <p className="text-gray-400">Establishing Link...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black text-white overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[30%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px] animate-pulse-slow delay-2000"></div>
      </div>

      {/* Header */}
      <header className="flex-none glass border-b border-white/5 p-4 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                AI Assistant
              </h1>
              <p className="text-xs text-green-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await authClient.signOut();
              router.push("/login");
            }}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-primary/30">
                <Bot className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">How can I help you today?</h3>
              <p className="text-gray-400 max-w-sm">
                Try asking: <br /> "Add a task to buy groceries"<br /> "Show my high priority tasks"<br /> "Mark task 3 as complete"
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ring-1
                ${m.role === "user" ? "bg-accent/20 ring-accent/50 text-accent" : "bg-primary/20 ring-primary/50 text-primary"}
              `}>
                {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`
                relative px-5 py-3.5 max-w-[80%] rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-sm
                ${m.role === "user"
                  ? "bg-accent/10 border border-accent/20 text-blue-100 rounded-tr-none"
                  : "bg-white/5 border border-white/10 text-gray-200 rounded-tl-none"
                }
              `}>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 ring-1 ring-primary/50 flex items-center justify-center text-primary">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 glass border-t border-white/10 z-20">
        <div className="max-w-3xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
            <Input
              placeholder="Type your command..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="pr-12 bg-black/50 border-white/10 text-white placeholder:text-gray-500 focus:ring-primary/50 focus:border-primary/50 h-12 rounded-full shadow-inner"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-1 top-1 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all p-0 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-center text-[10px] text-gray-600 mt-2 uppercase tracking-widest opacity-50">
            AI Powered Task Management System v2.0
          </p>
        </div>
      </div>
    </div>
  );
}
