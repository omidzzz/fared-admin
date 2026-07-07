"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ArrowRight } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Toast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { getAdmins, updateAdminRole } from "@/lib/services/admins";

const ROLE_OPTIONS = [
  { label: "ادمین", value: "ADMIN" },
  { label: "کارمند", value: "STAFF" },
];

export default function EditAdminPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const id = params.id as string;
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const { data: admins, isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: getAdmins,
  });

  const admin = admins?.find((a) => a.id === id);

  const { setValue, watch } = useForm({
    defaultValues: { role: admin?.role ?? "ADMIN" },
    values: { role: admin?.role ?? "ADMIN" },
  });

  const mutation = useMutation({
    mutationFn: (role: string) => updateAdminRole(id, role as import("@/lib/types").AdminRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      Toast.success("نقش با موفقیت بروزرسانی شد");
      router.push("/admins");
    },
    onError: (err) =>
      Toast.error(err instanceof Error ? err.message : "خطا در بروزرسانی نقش"),
  });

  // SUPER_ADMIN guard — runs after hooks so hook order stays stable across renders
  useEffect(() => {
    if (currentUser && !isSuperAdmin) {
      router.replace("/admins");
    }
  }, [currentUser, isSuperAdmin, router]);

  if (!isSuperAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (!admin) {
    return (
      <AdminLayout>
        <div className="page-container text-center py-16">
          <p className="text-lg text-[var(--text-secondary)]">ادمین یافت نشد</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader
          title="ویرایش نقش ادمین"
          breadcrumbs={[
            { label: "ادمین‌ها", href: "/admins" },
            { label: admin.name ?? "" },
            { label: "ویرایش" },
          ]}
          actions={
            <Button
              variant="secondary"
              onClick={() => router.push("/admins")}
            >
              <ArrowRight size={18} />
              بازگشت
            </Button>
          }
        />

        <div className="card max-w-lg space-y-4">
          {/* Info */}
          <div className="pb-4 border-b border-[var(--border-default)]">
            <p className="text-sm text-[var(--text-secondary)]">
              نام: <span className="text-[var(--text-primary)] font-medium">{admin.name}</span>
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              ایمیل: <span className="text-[var(--text-primary)] font-medium dir-ltr">{admin.email}</span>
            </p>
          </div>

          <FormField label="نقش">
            <Select
              value={watch("role")}
              onChange={(v) => setValue("role", v as "ADMIN" | "STAFF")}
              options={ROLE_OPTIONS}
            />
          </FormField>

          <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-default)]">
            <Button
              onClick={() => mutation.mutate(watch("role") as "ADMIN" | "STAFF")}
              loading={mutation.isPending}
            >
              ذخیره تغییرات
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push("/admins")}
            >
              لغو
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
