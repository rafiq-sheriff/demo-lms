"use client";

import { useState } from "react";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <DashboardTopbar onMenuOpen={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
