"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Brain, X } from "lucide-react";
import { useState } from "react";

import { adminNavItems } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const groupedItems = {
    Main: adminNavItems.slice(0, 4),
    Management: adminNavItems.slice(4, 7),
    Settings: adminNavItems.slice(7),
  } as const;

  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar"
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-slate-50 shadow-lg transition-all duration-200 ease-out",
          collapsed ? "w-20" : "w-64",
          "lg:sticky lg:top-0 lg:z-0 lg:h-screen lg:translate-x-0 lg:self-start lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className={cn("flex h-16 items-center border-b border-slate-200", collapsed ? "justify-center px-3" : "justify-between px-4")}>
          <Link
            href="/dashboard/admin"
            className="flex min-w-0 items-center gap-2 font-semibold tracking-tight text-foreground"
            onClick={onClose}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-primary-foreground">
              <Brain className="h-5 w-5" />
            </span>
            {!collapsed ? <span className="truncate text-sm">Control Panel</span> : null}
          </Link>
          {!collapsed ? (
            <button
              type="button"
              className="inline-flex rounded-lg p-2 text-muted-foreground hover:bg-slate-100 lg:hidden"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Admin navigation">
          {Object.entries(groupedItems).map(([section, items]) => (
            <div key={section} className="mb-6">
              {!collapsed ? (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {section}
                </p>
              ) : null}
              <ul className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard/admin" && pathname.startsWith(`${item.href}/`));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                          collapsed ? "justify-center gap-0" : "gap-3",
                          active
                            ? "bg-indigo-50 text-indigo-600 shadow-sm"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        {!collapsed ? item.label : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          {!collapsed ? (
            <Link
              href="/"
              className="block rounded-xl px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              ← Back to site
            </Link>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:shadow md:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>
    </>
  );
}
