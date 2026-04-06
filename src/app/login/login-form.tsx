"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { formatClientError } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get("next");
  const nextPath =
    nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(nextPath);
    }
  }, [isAuthenticated, isLoading, nextPath, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await login(email.trim(), password, nextPath);
      toast.success("Welcome back");
    } catch (err) {
      toast.error(formatClientError(err));
    } finally {
      setPending(false);
    }
  }

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-md rounded-2xl border-border/80 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold tracking-tight">Sign in</CardTitle>
        <CardDescription>Use your LMS account to access the dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-border/80 bg-background px-3 text-sm outline-none ring-0 transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="login-password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-xl border border-border/80 bg-background px-3 text-sm outline-none ring-0 transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button type="submit" className="h-11 w-full rounded-xl" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
