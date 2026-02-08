"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black text-white overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-[10%] right-[20%] w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      </div>

      <Card className="max-w-md w-full z-10 glass border-white/10 relative">
        <div className="absolute -top-px -left-px w-[calc(100%+2px)] h-[calc(100%+2px)] rounded-xl bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity hover:opacity-100 pointer-events-none" />
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Enter your credentials to access the nexus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="cyber@punk.nav"
                required
                className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus:ring-primary/50"
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                value={email}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline text-primary hover:text-primary/80"
                >
                  Forgot password?
                </Link>
              </div>

              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus:ring-primary/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                onClick={() => {
                  setRememberMe(!rememberMe);
                }}
              />
              <Label htmlFor="remember" className="text-gray-300">Remember me</Label>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all hover:shadow-[0_0_25px_rgba(6,182,212,0.7)]"
              disabled={loading}
              onClick={async () => {
                await signIn.email({
                  email,
                  password,
                  rememberMe,
                  fetchOptions: {
                    onRequest: () => {
                      setLoading(true);
                    },
                    onResponse: () => {
                      setLoading(false);
                    },
                  },
                });
              }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <p>Initiate Login</p>
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-center w-full border-t border-white/10 py-4">
            <p className="text-center text-xs text-gray-500">
              New to the system?{" "}
              <Link href="/signup" className="underline text-primary hover:text-primary/80">
                Initialize Account
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
