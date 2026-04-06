"use client";

import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { SectionContainer } from "@/components/layout/section-container";
import { features, featuresPreviewCount } from "@/lib/home-data";
import { cn } from "@/lib/utils";

function CheckIcon() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/15">
      <svg
        className="h-4 w-4 text-primary"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 01.143 1.052l-7.5 9.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 6.948-8.758a.75.75 0 011.052-.143z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

export function FeaturesSection() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? features : features.slice(0, featuresPreviewCount);
  const hasMore = features.length > featuresPreviewCount;

  return (
    <section className="relative border-b border-border/80 bg-background">
      <div className="py-14 sm:py-16 lg:py-20">
        <SectionContainer>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-[2rem]">
              Features
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
              Sixteen capabilities designed for outcomes—learning, projects, mentorship, and hiring
              signal.
            </p>
          </div>
          <ul className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {visible.map((feature) => (
              <li key={feature.title}>
                <Card
                  className={cn(
                    "group h-full rounded-xl border-border/80 bg-muted/30 shadow-sm ring-1 ring-foreground/[0.04] transition duration-200",
                    "hover:-translate-y-0.5 hover:border-primary/15 hover:bg-card hover:shadow-md"
                  )}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3.5">
                      <CheckIcon />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-foreground">
                          {feature.title}
                        </h3>
                        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
          {hasMore && !showAll ? (
            <div className="mt-10 flex justify-center sm:mt-12">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-border/80 bg-card px-6 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/20 hover:bg-muted/50 hover:shadow-md"
              >
                View All Features
              </button>
            </div>
          ) : null}
        </SectionContainer>
      </div>
    </section>
  );
}
