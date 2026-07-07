"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Toast } from "@/components/ui/Toast";
import { createSession } from "@/lib/services/mentorship";

const schema = z.object({
  name: z.string().min(2, "نام الزامی است"),
  description: z.string().optional().default(""),
  duration: z.coerce.number().min(15, "حداقل ۱۵ دقیقه"),
  price: z.coerce.number().min(0),
  active: z.boolean().optional().default(true),
});

type FormData = z.infer<typeof schema>;

export default function CreateMentorshipPage() {
  const router = useRouter();
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { name: "", description: "", duration: 60, price: 0, active: true } });

  const mutation = useMutation({
    mutationFn: createSession,
    onSuccess: () => { Toast.success("جلسه با موفقیت ایجاد شد"); router.push("/mentorship"); },
    onError: (err) => Toast.error(err instanceof Error ? err.message : "خطا در ایجاد جلسه"),
  });

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader title="افزودن جلسه" breadcrumbs={[{ label: "منتورشیپ", href: "/mentorship" }, { label: "افزودن جلسه" }]} actions={<Button variant="secondary" onClick={() => router.push("/mentorship")}><ArrowRight size={18} />بازگشت</Button>} />
        <div className="card max-w-lg">
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
            <FormField label="نام" required error={errors.name?.message}><Input placeholder="نام جلسه" {...register("name")} /></FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="مدت (دقیقه)" required error={errors.duration?.message}><Input type="number" {...register("duration")} /></FormField>
              <FormField label="قیمت (تومان)" required error={errors.price?.message}><Input type="number" {...register("price")} /></FormField>
            </div>
            <FormField label="توضیحات"><textarea rows={4} className="form-input" placeholder="توضیحات جلسه..." {...register("description")} /></FormField>
            <Controller name="active" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="فعال" />} />
            <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-default)]">
              <Button type="submit" variant="primary" loading={mutation.isPending}>ذخیره جلسه</Button>
              <Button type="button" variant="secondary" onClick={() => router.push("/mentorship")}>لغو</Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
