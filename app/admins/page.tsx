"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { getAdmins, deleteAdmin } from "@/lib/services/admins";
import type { AdminUser } from "@/lib/types";

const ROLE_BADGE: Record<string, { label: string; variant: "warning" | "info" | "default" }> = {
  SUPER_ADMIN: { label: "سوپر ادمین", variant: "warning" },
  ADMIN: { label: "ادمین", variant: "info" },
  STAFF: { label: "کارمند", variant: "default" },
};

export default function AdminsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const { data: admins, isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: getAdmins,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      Toast.success("ادمین با موفقیت حذف شد");
      setDeleteTarget(null);
    },
    onError: () => Toast.error("خطا در حذف ادمین"),
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fa-IR");

  const columns: Column<AdminUser>[] = [
    { key: "name", label: "نام" },
    { key: "email", label: "ایمیل" },
    {
      key: "role",
      label: "نقش",
      render: (value) => {
        const r = ROLE_BADGE[String(value ?? "")] ?? ROLE_BADGE.STAFF;
        return <Badge variant={r.variant}>{r.label}</Badge>;
      },
    },
    {
      key: "createdAt",
      label: "تاریخ عضویت",
      render: (value) => formatDate(String(value ?? "")),
    },
    {
      key: "actions",
      label: "عملیات",
      render: (_value, row) =>
        isSuperAdmin ? (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admins/${row.id}/edit`);
              }}
            >
              <Pencil size={16} />
            </Button>
            {row.id !== currentUser?.id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(row);
                }}
              >
                <Trash2 size={16} className="text-red-500" />
              </Button>
            )}
          </div>
        ) : null,
    },
  ];

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader
          title="ادمین‌ها"
          description="مدیریت ادمین‌های پنل"
          actions={
            isSuperAdmin ? (
              <Button onClick={() => router.push("/admins/create")}>
                <Plus size={18} />
                افزودن ادمین
              </Button>
            ) : undefined
          }
        />

        <div className="card">
          <DataTable
            columns={columns}
            data={admins ?? []}
            isLoading={isLoading}
            emptyMessage="ادمینی یافت نشد"
          />
        </div>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id!)}
        title="حذف ادمین"
        description={`آیا از حذف "${deleteTarget?.name ?? ""}" اطمینان دارید؟`}
        confirmLabel="حذف"
        loading={deleteMutation.isPending}
      />
    </AdminLayout>
  );
}
