"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ApiError,
  createCourseAdmin,
  deleteCourseAdmin,
  getCourses,
  updateCourseAdmin,
  uploadCourseCover,
  type CourseOut,
} from "@/lib/api";
import { cn } from "@/lib/utils";

function isLikelyYoutubeUrl(s: string): boolean {
  const t = s.trim().toLowerCase();
  return (t.includes("youtube.com/watch") || t.includes("youtu.be/") || t.includes("youtube.com/embed")) && t.length > 12;
}

function formatPriceDisplay(c: CourseOut): string {
  if (c.is_free) return "Free";
  if (c.price == null || c.price === "") return "Paid";
  const n = Number(c.price);
  if (Number.isNaN(n)) return String(c.price);
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
}

export function AdminCoursesClient() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["courses"], queryFn: getCourses });
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; youtube?: string; price?: string }>({});

  useEffect(() => {
    return () => {
      if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  function onPickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller");
      return;
    }
    if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  }

  function clearCover() {
    if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    setCoverFile(null);
    setCoverPreview(null);
  }

  function validateCreate(): boolean {
    const err: { title?: string; youtube?: string; price?: string } = {};
    if (!title.trim()) err.title = "Title is required";
    if (!youtubeUrl.trim()) err.youtube = "YouTube URL is required";
    else if (!isLikelyYoutubeUrl(youtubeUrl)) err.youtube = "Enter a valid YouTube video link";
    if (!isFree) {
      const priceNum = Number.parseFloat(price);
      if (!Number.isFinite(priceNum) || priceNum <= 0) err.price = "Enter a price greater than 0";
    }
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  }

  const createMut = useMutation({
    mutationFn: async () => {
      let image_url: string | null = null;
      if (coverFile) {
        const up = await uploadCourseCover(coverFile);
        image_url = up.url;
      }
      const priceNum = !isFree ? Number.parseFloat(price) : null;
      return createCourseAdmin({
        title: title.trim(),
        description: description.trim() || null,
        youtube_url: youtubeUrl.trim(),
        is_free: isFree,
        price: isFree ? null : priceNum,
        image_url,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["courses"] });
      await qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("Course created");
      setCreating(false);
      setTitle("");
      setDescription("");
      setYoutubeUrl("");
      setIsFree(true);
      setPrice("");
      clearCover();
      setFieldErrors({});
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.detail : "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCourseAdmin(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["courses"] });
      await qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("Course deleted");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.detail : "Failed"),
  });

  const patchMut = useMutation({
    mutationFn: ({ id, is_free }: { id: string; is_free: boolean }) => updateCourseAdmin(id, { is_free }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course updated");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.detail : "Failed"),
  });

  if (q.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Courses" description="Create and manage programs." />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  if (q.isError) {
    return (
      <EmptyState
        title="Could not load courses"
        description={q.error instanceof ApiError ? q.error.detail : "Error"}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="Create and manage programs."
        actions={
          <Button type="button" className="rounded-xl" onClick={() => setCreating((v) => !v)}>
            {creating ? "Close form" : "New course"}
          </Button>
        }
      />

      {creating ? (
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Create course</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="course-title" required>
                    Title
                  </Label>
                  <Input
                    id="course-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Course title"
                    aria-invalid={Boolean(fieldErrors.title)}
                    className={cn(fieldErrors.title && "border-destructive")}
                  />
                  {fieldErrors.title ? <p className="text-xs text-destructive">{fieldErrors.title}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-desc">Description</Label>
                  <textarea
                    id="course-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px] w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"
                    placeholder="Optional overview for learners"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-yt" required>
                    YouTube video URL
                  </Label>
                  <Input
                    id="course-yt"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=…"
                    aria-invalid={Boolean(fieldErrors.youtube)}
                    className={cn(fieldErrors.youtube && "border-destructive")}
                  />
                  {fieldErrors.youtube ? <p className="text-xs text-destructive">{fieldErrors.youtube}</p> : null}
                  <p className="text-xs text-muted-foreground">
                    First lesson is created automatically from this video.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-muted/20 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Free course</p>
                    <p className="text-xs text-muted-foreground">Turn off to set a price</p>
                  </div>
                  <Switch checked={isFree} onCheckedChange={setIsFree} aria-label="Free course" />
                </div>

                {!isFree ? (
                  <div className="space-y-2">
                    <Label htmlFor="course-price" required>
                      Price (USD)
                    </Label>
                    <Input
                      id="course-price"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="29.99"
                      aria-invalid={Boolean(fieldErrors.price)}
                      className={cn(fieldErrors.price && "border-destructive")}
                    />
                    {fieldErrors.price ? <p className="text-xs text-destructive">{fieldErrors.price}</p> : null}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="course-cover">Cover image</Label>
                  <Input id="course-cover" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onPickCover} />
                  <p className="text-xs text-muted-foreground">JPEG, PNG, WebP, or GIF · max 5 MB</p>
                  {coverPreview ? (
                    <div className="relative mt-2 overflow-hidden rounded-xl border border-border/80">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverPreview} alt="" className="aspect-[16/10] w-full object-cover" />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute right-2 top-2 rounded-lg"
                        onClick={clearCover}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2 flex aspect-[16/10] items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/30 text-xs text-muted-foreground">
                      Preview appears here
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={createMut.isPending}
                onClick={() => {
                  if (!validateCreate()) return;
                  createMut.mutate();
                }}
                className="rounded-xl"
              >
                {createMut.isPending ? "Creating…" : "Create course"}
              </Button>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/80 bg-muted/30">
              <th className="px-4 py-3 font-semibold">Cover</th>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Lessons</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(q.data ?? []).map((c: CourseOut) => (
              <tr key={c.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3">
                  <div className="h-11 w-[4.5rem] overflow-hidden rounded-lg bg-muted">
                    {c.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary/25 to-muted" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{c.title}</td>
                <td className="px-4 py-3 tabular-nums">{c.lesson_count}</td>
                <td className="px-4 py-3">{formatPriceDisplay(c)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-lg"
                      disabled={patchMut.isPending}
                      onClick={() => patchMut.mutate({ id: c.id, is_free: !c.is_free })}
                    >
                      Toggle free/paid
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="rounded-lg"
                      disabled={deleteMut.isPending}
                      onClick={() => {
                        if (confirm("Delete this course and all modules?")) deleteMut.mutate(c.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
