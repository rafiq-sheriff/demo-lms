"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}
