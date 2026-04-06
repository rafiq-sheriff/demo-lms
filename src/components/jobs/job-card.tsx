import { MapPin, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { JobListing } from "@/lib/jobs-data";

export type JobCardProps = {
  job: JobListing;
  onViewDetails: (job: JobListing) => void;
};

export function JobCard({ job, onViewDetails }: JobCardProps) {
  return (
    <Card
      className={cn(
        "group flex h-full flex-col rounded-xl border-border/80 bg-card shadow-sm ring-1 ring-foreground/[0.03]",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      )}
    >
      <CardHeader className="space-y-2 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-snug text-foreground transition group-hover:text-primary">
              {job.title}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {job.company}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground ring-1 ring-border/80">
            {job.type}
          </span>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {job.location}
        </p>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{job.shortDescription}</p>
      </CardContent>
      <CardFooter className="border-t border-border/60 bg-muted/20">
        <Button
          type="button"
          className="w-full rounded-xl shadow-sm transition hover:shadow-md"
          onClick={() => onViewDetails(job)}
        >
          Apply
        </Button>
      </CardFooter>
    </Card>
  );
}
