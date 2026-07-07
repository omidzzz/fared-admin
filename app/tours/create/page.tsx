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
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Toast } from "@/components/ui/Toast";
import { createTour } from "@/lib/services/tours";

const schema = z.object({
  titleFa: z.string().min(2, "نام فارسی الزامی است"),
  titleEn: z.string().optional().default(""),
  descriptionFa: z.string().optional().default(""),
  price: z.coerce.number().min(0, "قیمت نمی‌تواند منفی باشد"),
  duration: z.string().optional().default(""),
  maxCapacity: z.coerce.number().min(0).optional().default(0),
  featured: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
});

type FormData = z.infer<typeof schema>;

export default function CreateTourPage() {
  const router = useRouter();
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { titleFa: "", titleEn: "", descriptionFa: "", price: 0, duration: "", maxCapacity: 0, featured: false, active: true } });

  const mutation = useMutation({
    mutationFn: (data: FormData) => createTour({ ...data, location: "", image: "" } as Partial<import("@/lib/types").Tour>),
    onSuccess: () => { Toast.success("تور با موفقیت ایجاد شد"); router.push("/tours"); },
    onError: (err) => Toast.error(err instanceof Error ? err.message : "خطا در ایجاد تور"),
  });

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader title="افزودن تور" breadcrumbs={[{ label: "تورها", href: "/tours" }, { label: "افزودن تور" }]} actions={<Button variant="secondary" onClick={() => router.push("/tours")}><ArrowRight size={18} />بازگشت</Button>} />
        <div className="card max-w-2xl">
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
            <FormField label="نام فارسی" required error={errors.titleFa?.message}><Input placeholder="نام تور" {...register("titleFa")} /></FormField>
            <FormField label="نام انگلیسی" error={errors.titleEn?.message}><Input placeholder="Tour name" {...register("titleEn")} /></FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="قیمت (تومان)" required error={errors.price?.message}><Input type="number" placeholder="مثال: ۴۵۰۰۰۰۰" {...register("price")} /></FormField>
              <FormField label="مدت" error={errors.duration?.message}><Input placeholder="مثال: ۳ روز" {...register("duration")} /></FormField>
            </div>
            <FormField label="حداکثر ظرفیت"><Input type="number" {...register("maxCapacity")} /></FormField>
            <FormField label="توضیحات"><textarea rows={4} className="form-input" placeholder="توضیحات تور..." {...register("descriptionFa")} /></FormField>
            <FormField label="تصویر"><ImageUpload endpoint="/api/media/upload" onChange={() => {}} /></FormField>
            <div className="flex items-center gap-8">
              <Controller name="featured" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="ویژه" />} />
              <Controller name="active" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="فعال" />} />
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-default)]">
              <Button type="submit" variant="primary" loading={mutation.isPending}>ذخیره تور</Button>
              <Button type="button" variant="secondary" onClick={() => router.push("/tours")}>لغو</Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
