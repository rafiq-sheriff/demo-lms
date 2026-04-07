"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { ApiError, updateProfile, type UserPublic } from "@/lib/api";
import { cn } from "@/lib/utils";

function ProfileForm({
  user,
  refreshUser,
}: {
  user: UserPublic;
  refreshUser: () => Promise<void>;
}) {
  const [fullName, setFullName] = useState(user.full_name);

  const mut = useMutation({
    mutationFn: () => updateProfile({ full_name: fullName.trim() }),
    onSuccess: async () => {
      await refreshUser();
      toast.success("Profile updated");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.detail : "Could not update profile"),
  });

  return (
    <Card className="rounded-xl border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Account</CardTitle>
        <CardDescription>Email is read-only. Update how your name appears across the LMS.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!fullName.trim()) {
              toast.error("Enter your name");
              return;
            }
            mut.mutate();
          }}
        >
          <div className="space-y-2">
            <label htmlFor="profile-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              readOnly
              value={user.email}
              className="h-11 w-full cursor-not-allowed rounded-xl border border-border/80 bg-muted/50 px-3 text-sm text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="profile-name" className="text-sm font-medium text-foreground">
              Full name
            </label>
            <input
              id="profile-name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-11 w-full rounded-xl border border-border/80 bg-background px-3 text-sm outline-none ring-0 transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <span className="inline-flex items-center rounded-lg bg-muted px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground">
              Role: {user.role}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium",
                user.is_active ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200" : "bg-destructive/15 text-destructive",
              )}
            >
              {user.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <Button type="submit" className="rounded-xl" disabled={mut.isPending}>
            {mut.isPending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function ProfilePageClient() {
  const { user, refreshUser } = useAuth();

  if (!user) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-dashed border-border/80 bg-muted/30 px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <header className="space-y-1">
        <h1 className="lms-page-title">Profile</h1>
        <p className="lms-page-lead mt-1">Your account details and display name.</p>
      </header>

      <ProfileForm key={`${user.id}-${user.full_name}`} user={user} refreshUser={refreshUser} />
    </div>
  );
}
