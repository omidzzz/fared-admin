"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { getSessionById, updateSession, deleteSession } from "@/lib/services/mentorship";

const schema = z.object({
  name: z.string().min(2, "نام الزامی است"),
  description: z.string().optional().default(""),
  duration: z.coerce.number().min(15, "حداقل ۱۵ دقیقه"),
  price: z.coerce.number().min(0),
  active: z.boolean().optional().default(true),
});

type FormData = z.infer<typeof schema>;

export default function EditMentorshipPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: session, isLoading } = useQuery({ queryKey: ["session", id], queryFn: () => getSessionById(id) });

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: session ? { name: session.name, description: session.description ?? "", duration: session.duration, price: session.price, active: session.active } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => updateSession(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sessions"] }); Toast.success("جلسه بروزرسانی شد"); router.push("/mentorship"); },
    onError: (err) => Toast.error(err instanceof Error ? err.message : "خطا در بروزرسانی"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSession(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sessions"] }); Toast.success("جلسه حذف شد"); router.push("/mentorship"); },
    onError: () => Toast.error("خطا در حذف جلسه"),
  });

  if (isLoading) return <AdminLayout><div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader title="ویرایش جلسه" breadcrumbs={[{ label: "منتورشیپ", href: "/mentorship" }, { label: session?.name ?? "..." }, { label: "ویرایش" }]} actions={<Button variant="secondary" onClick={() => router.push("/mentorship")}><ArrowRight size={18} />بازگشت</Button>} />
        <div className="card max-w-lg">
          <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-5">
            <FormField label="نام" required error={errors.name?.message}><Input placeholder="نام جلسه" {...register("name")} /></FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="مدت (دقیقه)" required error={errors.duration?.message}><Input type="number" {...register("duration")} /></FormField>
              <FormField label="قیمت (تومان)" required error={errors.price?.message}><Input type="number" {...register("price")} /></FormField>
            </div>
            <FormField label="توضیحات"><textarea rows={4} className="form-input" placeholder="توضیحات جلسه..." {...register("description")} /></FormField>
            <Controller name="active" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="فعال" />} />
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-default)]">
              <div className="flex items-center gap-3">
                <Button type="submit" variant="primary" loading={updateMutation.isPending}>ذخیره تغییرات</Button>
                <Button type="button" variant="secondary" onClick={() => router.push("/mentorship")}>لغو</Button>
              </div>
              <Button type="button" variant="danger" onClick={() => setDeleteOpen(true)}>حذف جلسه</Button>
            </div>
          </form>
        </div>
      </div>
      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={() => deleteMutation.mutate()} title="حذف جلسه" description={`آیا از حذف "${session?.name ?? ""}" اطمینان دارید؟`} confirmLabel="حذف" loading={deleteMutation.isPending} />
    </AdminLayout>
  );
}
