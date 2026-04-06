"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { dashboardNavItems } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

type DashboardSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      <button
        type="button"
        aria-label="Close sidebar"
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/80 bg-card shadow-lg transition-transform duration-200 ease-out",
          "lg:sticky lg:top-0 lg:z-0 lg:h-screen lg:translate-x-0 lg:self-start lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-border/80 px-4 lg:h-16">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-2 font-semibold tracking-tight text-foreground"
            onClick={onClose}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">
              AA
            </span>
            <span className="truncate">Analytics Avenue</span>
          </Link>
          <button
            type="button"
            className="inline-flex rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Dashboard navigation">
          <ul className="space-y-1">
            {dashboardNavItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href === "/dashboard/my-courses" &&
                  pathname.startsWith("/dashboard/course/")) ||
                (item.href !== "/dashboard" &&
                  item.href !== "/dashboard/my-courses" &&
                  pathname.startsWith(`${item.href}/`));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-primary text-primary-foreground shadow-md ring-1 ring-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
