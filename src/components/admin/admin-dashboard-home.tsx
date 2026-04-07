"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Activity,
  BookOpen,
  Briefcase,
  Calendar,
  CircleHelp,
  ClipboardList,
  GraduationCap,
  ListTodo,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { ChartSkeleton, CardGridSkeleton } from "@/components/admin/loading-skeleton";
import { StatCard } from "@/components/admin/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { ApiError, getAdminActivity, getAdminCharts, getAdminStats } from "@/lib/api";
import { cn } from "@/lib/utils";

function formatShortDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function AdminDashboardHome() {
  const stats = useQuery({ queryKey: ["admin", "stats"], queryFn: getAdminStats });
  const charts = useQuery({ queryKey: ["admin", "charts"], queryFn: getAdminCharts });
  const activity = useQuery({ queryKey: ["admin", "activity"], queryFn: getAdminActivity });

  const chartData =
    charts.data?.user_signups.map((u, i) => ({
      label: u.date.slice(5),
      users: u.value,
      enrollments: charts.data?.enrollments[i]?.value ?? 0,
      submissions: charts.data?.task_submissions[i]?.value ?? 0,
    })) ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard Overview"
        description="Welcome back! Here's what's happening with your platform today."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/admin/courses"
              className={cn(
                buttonVariants(),
                "rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95",
              )}
            >
              Create course
            </Link>
            <Link
              href="/dashboard/admin/tasks"
              className={cn(buttonVariants({ variant: "outline" }), "rounded-xl border-slate-200 bg-white")}
            >
              Create task
            </Link>
          </div>
        }
      />

      {stats.isLoading ? (
        <CardGridSkeleton count={6} />
      ) : stats.isError ? (
        <EmptyState
          title="Could not load stats"
          description={stats.error instanceof ApiError ? stats.error.detail : "Try again later."}
        />
      ) : (
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total users" value={stats.data?.total_users ?? 0} icon={Users} />
          <StatCard title="Total courses" value={stats.data?.total_courses ?? 0} icon={BookOpen} />
          <StatCard
            title="Active enrollments"
            value={stats.data?.active_enrollments ?? 0}
            icon={GraduationCap}
          />
          <StatCard title="Tasks submitted" value={stats.data?.tasks_submitted ?? 0} icon={ClipboardList} />
          <StatCard title="Open doubts" value={stats.data?.open_doubts ?? 0} icon={CircleHelp} />
          <StatCard
            title="Booked appointments"
            value={stats.data?.booked_appointments ?? 0}
            icon={Calendar}
          />
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Growth & Activity (14 days)</h2>
          <p className="mt-1 text-sm text-slate-500">Signups, enrollments, and submissions per day.</p>
          <div className="mt-6 h-72 w-full">
            {charts.isLoading ? (
              <ChartSkeleton className="h-full w-full" />
            ) : charts.isError ? (
              <p className="text-sm text-destructive">
                {charts.error instanceof ApiError ? charts.error.detail : "Charts unavailable"}
              </p>
            ) : chartData.length === 0 ? (
              <EmptyState title="No chart data yet" description="Activity will appear as users join." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line type="monotone" dataKey="users" name="Signups" stroke="#6366f1" dot={false} strokeWidth={3} />
                  <Line type="monotone" dataKey="enrollments" name="Enrollments" stroke="#8b5cf6" dot={false} strokeWidth={3} />
                  <Line
                    type="monotone"
                    dataKey="submissions"
                    name="Submissions"
                    stroke="#0ea5e9"
                    dot={false}
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-600" aria-hidden />
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">Latest updates from your platform.</p>
          <ul className="modern-scroll mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
            {activity.isLoading ? (
              <li className="text-sm text-muted-foreground">Loading…</li>
            ) : activity.isError ? (
              <li className="text-sm text-destructive">
                {activity.error instanceof ApiError ? activity.error.detail : "Failed to load"}
              </li>
            ) : (activity.data?.items.length ?? 0) === 0 ? (
              <li className="text-sm text-muted-foreground">No recent events.</li>
            ) : (
              activity.data?.items.map((item) => (
                <li
                  key={`${item.type}-${item.id}`}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                >
                  <p className="font-medium text-slate-900">{item.title}</p>
                  {item.subtitle ? <p className="text-xs text-slate-500">{item.subtitle}</p> : null}
                  <p className="mt-1 text-[11px] text-slate-500">{formatShortDate(item.created_at)}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
        <p className="mt-1 text-sm text-slate-500">Fast access to common admin workflows.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Link
            href="/dashboard/admin/courses"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-auto flex-col gap-3 rounded-xl border-indigo-100 bg-indigo-50 px-4 py-4 text-indigo-700 hover:bg-indigo-100",
            )}
          >
            <BookOpen className="h-5 w-5" />
            Create course
          </Link>
          <Link
            href="/dashboard/admin/tasks"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-auto flex-col gap-3 rounded-xl border-purple-100 bg-purple-50 px-4 py-4 text-purple-700 hover:bg-purple-100",
            )}
          >
            <ListTodo className="h-5 w-5" />
            Create task
          </Link>
          <Link
            href="/dashboard/admin/jobs"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-auto flex-col gap-3 rounded-xl border-emerald-100 bg-emerald-50 px-4 py-4 text-emerald-700 hover:bg-emerald-100",
            )}
          >
            <Briefcase className="h-5 w-5" />
            Add job
          </Link>
          <Link
            href="/dashboard/admin/appointments"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-auto flex-col gap-3 rounded-xl border-blue-100 bg-blue-50 px-4 py-4 text-blue-700 hover:bg-blue-100",
            )}
          >
            <Calendar className="h-5 w-5" />
            Create time slot
          </Link>
        </div>
      </section>
    </div>
  );
}
