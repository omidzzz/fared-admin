"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Toast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { createAdmin } from "@/lib/services/admins";

const adminSchema = z.object({
  name: z.string().min(2, "نام الزامی است"),
  email: z.string().email("ایمیل معتبر وارد کنید"),
  password: z.string().min(6, "رمز عبور حداقل ۶ کاراکتر باشد"),
  role: z.enum(["ADMIN", "STAFF"]),
});

type AdminFormData = z.infer<typeof adminSchema>;

const ROLE_OPTIONS = [
  { label: "ادمین", value: "ADMIN" },
  { label: "کارمند", value: "STAFF" },
];

export default function CreateAdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "ADMIN",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: AdminFormData) => createAdmin(data),
    onSuccess: () => {
      Toast.success("ادمین با موفقیت ایجاد شد");
      router.push("/admins");
    },
    onError: (err) =>
      Toast.error(err instanceof Error ? err.message : "خطا در ایجاد ادمین"),
  });

  // SUPER_ADMIN guard — runs after hooks so hook order stays stable across renders
  useEffect(() => {
    if (user && !isSuperAdmin) {
      router.replace("/admins");
    }
  }, [user, isSuperAdmin, router]);

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader
          title="افزودن ادمین"
          breadcrumbs={[
            { label: "ادمین‌ها", href: "/admins" },
            { label: "افزودن ادمین" },
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

        <div className="card max-w-lg">
          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="space-y-5"
          >
            <FormField label="نام" required error={errors.name?.message}>
              <Input placeholder="نام کامل" {...register("name")} />
            </FormField>

            <FormField label="ایمیل" required error={errors.email?.message}>
              <Input
                type="email"
                placeholder="email@example.com"
                {...register("email")}
              />
            </FormField>

            <FormField label="رمز عبور" required error={errors.password?.message}>
              <Input
                type="password"
                placeholder="حداقل ۶ کاراکتر"
                {...register("password")}
              />
            </FormField>

            <FormField label="نقش" required error={errors.role?.message}>
              <Select
                value={watch("role")}
                onChange={(v) => setValue("role", v as "ADMIN" | "STAFF")}
                options={ROLE_OPTIONS}
                placeholder="انتخاب نقش"
              />
            </FormField>

            <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-default)]">
              <Button type="submit" variant="primary" loading={mutation.isPending}>
                ذخیره
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/admins")}
              >
                لغو
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
