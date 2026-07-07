"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Toast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile, updatePassword } from "@/lib/services/settings";

const profileSchema = z.object({
  name: z.string().min(2, "نام الزامی است"),
  email: z.string().email("ایمیل معتبر وارد کنید"),
  avatar: z.string().optional().default(""),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "رمز عبور فعلی الزامی است"),
  newPassword: z.string().min(8, "رمز عبور جدید حداقل ۸ کاراکتر باشد"),
  confirmPassword: z.string().min(1, "تکرار رمز عبور الزامی است"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "رمز عبور جدید با تکرار آن مطابقت ندارد",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const TABS = [
  { key: "profile", label: "پروفایل ادمین" },
  { key: "password", label: "تغییر رمز عبور" },
  { key: "site", label: "تنظیمات سایت" },
];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [tab, setTab] = useState("profile");

  // Profile form
  const { register: regProfile, handleSubmit: hsProfile, control: ctrlProfile, formState: { errors: errProfile } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? "", email: user?.email ?? "", avatar: "" },
  });

  const profileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => updateProfile(data),
    onSuccess: () => { queryClient.invalidateQueries(); Toast.success("پروفایل با موفقیت بروزرسانی شد"); },
    onError: (err) => Toast.error(err instanceof Error ? err.message : "خطا در بروزرسانی پروفایل"),
  });

  // Password form
  const { register: regPw, handleSubmit: hsPw, reset: resetPw, formState: { errors: errPw } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordFormData) => updatePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    onSuccess: () => { Toast.success("رمز عبور با موفقیت تغییر کرد"); resetPw(); },
    onError: (err) => Toast.error(err instanceof Error ? err.message : "خطا در تغییر رمز عبور"),
  });

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader title="تنظیمات" description="مدیریت پروفایل و تنظیمات حساب" />

        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-brand text-white" : "bg-white text-[var(--text-secondary)] hover:bg-subtle border"}`}>{t.label}</button>
          ))}
        </div>

        {/* Tab 1: Profile */}
        {tab === "profile" && (
          <div className="card max-w-lg">
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-5">پروفایل ادمین</h3>
            <form onSubmit={hsProfile((d) => profileMutation.mutate(d))} className="space-y-5">
              <FormField label="آواتار">
                <Controller name="avatar" control={ctrlProfile} render={({ field }) => <ImageUpload value={field.value} onChange={field.onChange} endpoint="/api/media/upload" />} />
              </FormField>
              <FormField label="نام" required error={errProfile.name?.message}>
                <Input {...regProfile("name")} />
              </FormField>
              <FormField label="ایمیل" required error={errProfile.email?.message}>
                <Input type="email" {...regProfile("email")} />
              </FormField>
              <Button type="submit" variant="primary" loading={profileMutation.isPending}>ذخیره تغییرات</Button>
            </form>
          </div>
        )}

        {/* Tab 2: Change Password */}
        {tab === "password" && (
          <div className="card max-w-lg">
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-5">تغییر رمز عبور</h3>
            <form onSubmit={hsPw((d) => passwordMutation.mutate(d))} className="space-y-5">
              <FormField label="رمز عبور فعلی" required error={errPw.currentPassword?.message}>
                <Input type="password" placeholder="••••••••" {...regPw("currentPassword")} />
              </FormField>
              <FormField label="رمز عبور جدید" required error={errPw.newPassword?.message}>
                <Input type="password" placeholder="حداقل ۸ کاراکتر" {...regPw("newPassword")} />
              </FormField>
              <FormField label="تکرار رمز عبور جدید" required error={errPw.confirmPassword?.message}>
                <Input type="password" placeholder="••••••••" {...regPw("confirmPassword")} />
              </FormField>
              <Button type="submit" variant="primary" loading={passwordMutation.isPending}>تغییر رمز عبور</Button>
            </form>
          </div>
        )}

        {/* Tab 3: Site Settings (placeholder) */}
        {tab === "site" && (
          <div className="card max-w-lg text-center py-12">
            <p className="text-lg text-[var(--text-secondary)]">تنظیمات سایت به زودی اضافه می‌شود</p>
            <p className="text-sm text-[var(--text-muted)] mt-2">این بخش در بروزرسانی‌های آینده در دسترس خواهد بود</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
