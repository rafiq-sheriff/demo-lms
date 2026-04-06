"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AnnouncementBar } from "@/components/home/announcement-bar";
import { Navbar } from "@/components/home/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionContainer } from "@/components/layout/section-container";
import { formatClientError } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

export default function SignupPage() {
  const { register, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setPending(true);
    try {
      await register({ email: email.trim(), password, full_name: fullName.trim() });
      toast.success("Account created");
    } catch (err) {
      toast.error(formatClientError(err));
    } finally {
      setPending(false);
    }
  }

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-full flex-col bg-muted/30">
        <AnnouncementBar />
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-muted/30">
      <AnnouncementBar />
      <Navbar />
      <main className="flex flex-1 flex-col py-12 sm:py-16">
        <SectionContainer>
          <nav className="text-sm text-muted-foreground">
            <Link href="/" className="font-medium text-foreground hover:underline">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span>Sign up</span>
          </nav>
          <div className="mx-auto mt-10 w-full max-w-md">
            <Card className="rounded-2xl border-border/80 shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-semibold tracking-tight">Create account</CardTitle>
                <CardDescription>Join the LMS with your email and a secure password.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="su-name" className="text-sm font-medium text-foreground">
                      Full name
                    </label>
                    <input
                      id="su-name"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-11 w-full rounded-xl border border-border/80 bg-background px-3 text-sm outline-none ring-0 transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="su-email" className="text-sm font-medium text-foreground">
                      Email
                    </label>
                    <input
                      id="su-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 w-full rounded-xl border border-border/80 bg-background px-3 text-sm outline-none ring-0 transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="su-password" className="text-sm font-medium text-foreground">
                      Password
                    </label>
                    <input
                      id="su-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 w-full rounded-xl border border-border/80 bg-background px-3 text-sm outline-none ring-0 transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="text-xs text-muted-foreground">At least 8 characters.</p>
                  </div>
                  <Button type="submit" className="h-11 w-full rounded-xl" disabled={pending}>
                    {pending ? "Creating…" : "Create account"}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </SectionContainer>
      </main>
    </div>
  );
}
