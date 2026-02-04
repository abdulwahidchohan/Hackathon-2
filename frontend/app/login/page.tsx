"use client";
// Phase II — Login page (Better Auth)
// [From]: specs Phase II authentication

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });
    setLoading(false);
    if (err) setError(err.message || "Login failed");
  }

  return (
    <main style={{ maxWidth: 400, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Evolution of Todo</h1>
      <h2 style={{ fontSize: "1.125rem", marginTop: "0.5rem", color: "#666" }}>
        Sign in
      </h2>
      <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: "#dc2626", fontSize: "0.875rem" }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p style={{ marginTop: "1rem" }}>
        No account? <Link href="/signup">Sign up</Link>
      </p>
    </main>
  );
}
