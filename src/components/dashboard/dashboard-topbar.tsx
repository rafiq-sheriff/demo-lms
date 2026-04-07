"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Menu, Search } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { getDashboardPageTitle } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

type DashboardTopbarProps = {
  onMenuOpen: () => void;
};

function SearchField({ id }: { id: string }) {
  return (
    <div className="relative w-full">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        placeholder="Search courses, tasks…"
        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-500 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const initials = user?.full_name
    ? user.full_name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("")
    : "—";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "gap-2 rounded-xl border-slate-200 bg-white px-2 sm:px-3"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 text-xs font-semibold text-white">
          {initials}
        </span>
        <span className="hidden max-w-[8rem] truncate text-left text-sm font-medium md:inline">
          {user?.full_name ?? "Account"}
        </span>
        <ChevronDown className="h-4 w-4 opacity-60" aria-hidden />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <Link
            href="/dashboard/profile"
            role="menuitem"
            className="block px-3 py-2 text-sm text-slate-900 hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            Profile & account
          </Link>
          <hr className="my-1 border-slate-200" />
          <button
            type="button"
            role="menuitem"
            className="w-full px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function DashboardTopbar({ onMenuOpen }: DashboardTopbarProps) {
  const pathname = usePathname();
  const title = getDashboardPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="flex h-14 items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: "outline", size: "icon-sm" }),
            "shrink-0 lg:hidden"
          )}
          aria-label="Open navigation menu"
          onClick={onMenuOpen}
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight text-foreground transition-colors sm:text-xl">
          {title}
        </h1>

        <div className="hidden min-w-0 max-w-md flex-1 sm:flex lg:max-w-xl">
          <label htmlFor="dashboard-search" className="sr-only">
            Search
          </label>
          <SearchField id="dashboard-search" />
        </div>

        <button
          type="button"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-sm" }),
            "relative shrink-0 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          )}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        </button>

        <UserMenu />
      </div>

      <div className="border-t border-border/60 px-4 pb-3 pt-2 sm:hidden">
        <label htmlFor="dashboard-search-mobile" className="sr-only">
          Search
        </label>
        <SearchField id="dashboard-search-mobile" />
      </div>
    </header>
  );
}
