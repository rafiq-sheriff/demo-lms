"use client";

import Link from "next/link";
import { useState } from "react";
import { Brain } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { navLinks } from "@/lib/home-data";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isLoading, user } = useAuth();
  const dashboardHref = user?.role === "admin" ? "/dashboard/admin" : "/dashboard";
  const menuLinks = navLinks.slice(0, 4);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight text-foreground"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-primary-foreground shadow-sm">
            <Brain className="h-5 w-5" />
          </span>
          <span className="hidden text-[15px] sm:inline">Analytics Avenue</span>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {menuLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {!isLoading && isAuthenticated ? (
            <Link
              href={dashboardHref}
              className="hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:shadow-md sm:inline-flex"
            >
              {user?.role === "admin" ? "Admin" : "Dashboard"}
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-xl border border-border/80 bg-card px-4 py-2 text-[13px] font-semibold text-foreground shadow-sm transition hover:bg-muted sm:inline-flex"
            >
              Login
            </Link>
          )}
          <button
            type="button"
            aria-expanded={open}
            aria-label="Toggle menu"
            className="inline-flex rounded-xl border border-border/80 bg-card p-2 text-foreground shadow-sm transition hover:bg-muted md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-border/60 bg-background px-4 py-3 md:hidden">
          <div className="flex flex-col gap-0.5">
            {menuLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-[13px] font-medium text-foreground transition hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!isLoading && isAuthenticated ? (
              <Link
                href={dashboardHref}
                className="mt-2 rounded-xl bg-primary px-3 py-2.5 text-center text-[13px] font-semibold text-primary-foreground transition hover:bg-primary/90"
                onClick={() => setOpen(false)}
              >
                {user?.role === "admin" ? "Admin" : "Dashboard"}
              </Link>
            ) : (
              <Link
                href="/login"
                className="mt-2 rounded-xl bg-primary px-3 py-2.5 text-center text-[13px] font-semibold text-primary-foreground transition hover:bg-primary/90"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
