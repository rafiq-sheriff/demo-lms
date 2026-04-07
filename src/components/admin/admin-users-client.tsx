"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { DataTable, type Column } from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/loading-skeleton";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  listUsers,
  updateUserAdmin,
  type UserPublic,
  type UserRole,
} from "@/lib/api";

export function AdminUsersClient() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "users"], queryFn: listUsers });

  const mut = useMutation({
    mutationFn: async ({ id, role, is_active }: { id: string; role?: UserRole; is_active?: boolean }) => {
      return updateUserAdmin(id, { role, is_active });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "users"] });
      await qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("User updated");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.detail : "Update failed"),
  });

  const columns: Column<UserPublic>[] = [
    { key: "name", header: "Name", cell: (u) => u.full_name },
    { key: "email", header: "Email", cell: (u) => u.email },
    {
      key: "role",
      header: "Role",
      cell: (u) => <span className="capitalize">{u.role}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (u) => (
        <span className={u.is_active ? "text-emerald-700" : "text-destructive"}>
          {u.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-[220px]",
      cell: (u) => (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-lg"
            disabled={mut.isPending}
            onClick={() =>
              mut.mutate({
                id: u.id,
                role: u.role === "admin" ? "student" : "admin",
              })
            }
          >
            {u.role === "admin" ? "Make student" : "Make admin"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-lg"
            disabled={mut.isPending}
            onClick={() => mut.mutate({ id: u.id, is_active: !u.is_active })}
          >
            {u.is_active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ];

  if (q.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Users" description="Manage accounts and roles." />
        <TableSkeleton rows={8} />
      </div>
    );
  }

  if (q.isError) {
    return (
      <EmptyState
        title="Could not load users"
        description={q.error instanceof ApiError ? q.error.detail : "Try again later."}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage accounts and roles." />
      <DataTable columns={columns} rows={q.data ?? []} getRowKey={(u) => u.id} emptyMessage="No users yet." />
    </div>
  );
}
