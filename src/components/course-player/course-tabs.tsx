"use client";

import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CourseResource } from "@/lib/course-detail";

type TabId = "overview" | "resources" | "discussion";

const tabs: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "resources", label: "Resources" },
  { id: "discussion", label: "Discussion" },
];

export type CourseTabsProps = {
  overview: string;
  resources: CourseResource[];
};

export function CourseTabs({ overview, resources }: CourseTabsProps) {
  const [active, setActive] = useState<TabId>("overview");

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Course content"
        className="flex flex-wrap gap-1 rounded-xl border border-border/80 bg-muted/40 p-1"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            className={cn(
              "min-h-10 flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active === t.id
                ? "bg-card text-foreground shadow-sm ring-1 ring-border/80"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="rounded-xl border-border/80 shadow-sm transition-shadow duration-200">
        <CardContent className="pt-6">
          {active === "overview" ? (
            <div role="tabpanel" className="text-pretty text-sm leading-relaxed text-muted-foreground">
              <p>{overview}</p>
            </div>
          ) : null}

          {active === "resources" ? (
            <div role="tabpanel" className="space-y-2">
              <p className="text-sm text-muted-foreground">Downloads and links for this course.</p>
              <ul className="space-y-2">
                {resources.map((r) => (
                  <li key={r.label}>
                    <a
                      href={r.href}
                      className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm font-medium text-primary transition hover:bg-muted hover:underline"
                    >
                      {r.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {active === "discussion" ? (
            <div
              role="tabpanel"
              className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center"
            >
              <p className="text-sm font-medium text-foreground">Discussion</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Threaded Q&amp;A and peer chat will appear here.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
