import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Briefcase,
  Calendar,
  CircleHelp,
  LayoutDashboard,
  ListTodo,
  UserRound,
} from "lucide-react";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const dashboardNavItems: DashboardNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/dashboard/my-courses", icon: BookOpen },
  { label: "Tasks", href: "/dashboard/tasks", icon: ListTodo },
  { label: "Doubts", href: "/dashboard/doubts", icon: CircleHelp },
  { label: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { label: "Job Updates", href: "/dashboard/jobs", icon: Briefcase },
  { label: "Profile", href: "/dashboard/profile", icon: UserRound },
];

export function getDashboardPageTitle(pathname: string): string {
  if (pathname.startsWith("/dashboard/course/")) {
    return "My Courses";
  }
  const exact = dashboardNavItems.find((item) => item.href === pathname);
  if (exact) return exact.label;
  const prefix = dashboardNavItems.find(
    (item) => item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)
  );
  return prefix?.label ?? "Dashboard";
}
