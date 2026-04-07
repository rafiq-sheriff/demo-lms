import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Calendar,
  CircleHelp,
  LayoutDashboard,
  ListTodo,
  Settings,
  Users,
  BookOpen,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Users", href: "/dashboard/admin/users", icon: Users },
  { label: "Courses", href: "/dashboard/admin/courses", icon: BookOpen },
  { label: "Tasks", href: "/dashboard/admin/tasks", icon: ListTodo },
  { label: "Doubts", href: "/dashboard/admin/doubts", icon: CircleHelp },
  { label: "Appointments", href: "/dashboard/admin/appointments", icon: Calendar },
  { label: "Jobs", href: "/dashboard/admin/jobs", icon: Briefcase },
  { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
];

export function getAdminPageTitle(pathname: string): string {
  const exact = adminNavItems.find((item) => item.href === pathname);
  if (exact) return exact.label;
  return "Admin";
}
