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
import { createCourse } from "@/lib/services/courses";

const schema = z.object({
  titleFa: z.string().min(2, "عنوان الزامی است"),
  titleEn: z.string().optional().default(""),
  descriptionFa: z.string().optional().default(""),
  price: z.coerce.number().min(0),
  durationHours: z.coerce.number().min(0).optional().default(0),
  instructor: z.string().optional().default(""),
  featured: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
});

type FormData = z.infer<typeof schema>;

export default function CreateCoursePage() {
  const router = useRouter();
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { titleFa: "", titleEn: "", descriptionFa: "", price: 0, durationHours: 0, instructor: "", featured: false, active: true } });

  const mutation = useMutation({
    mutationFn: (data: FormData) => createCourse({ ...data, instructorImage: "", image: "" } as Partial<import("@/lib/types").Course>),
    onSuccess: () => { Toast.success("دوره با موفقیت ایجاد شد"); router.push("/courses"); },
    onError: (err) => Toast.error(err instanceof Error ? err.message : "خطا در ایجاد دوره"),
  });

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader title="افزودن دوره" breadcrumbs={[{ label: "دوره‌ها", href: "/courses" }, { label: "افزودن دوره" }]} actions={<Button variant="secondary" onClick={() => router.push("/courses")}><ArrowRight size={18} />بازگشت</Button>} />
        <div className="card max-w-2xl">
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
            <FormField label="عنوان" required error={errors.titleFa?.message}><Input placeholder="عنوان دوره" {...register("titleFa")} /></FormField>
            <FormField label="نام انگلیسی" error={errors.titleEn?.message}><Input placeholder="Course title" {...register("titleEn")} /></FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="قیمت (تومان)" required error={errors.price?.message}><Input type="number" {...register("price")} /></FormField>
              <FormField label="مدت (ساعت)" error={errors.durationHours?.message}><Input type="number" {...register("durationHours")} /></FormField>
            </div>
            <FormField label="نام مدرس" error={errors.instructor?.message}><Input placeholder="نام مدرس" {...register("instructor")} /></FormField>
            <FormField label="توضیحات"><textarea rows={4} className="form-input" placeholder="توضیحات دوره..." {...register("descriptionFa")} /></FormField>
            <FormField label="تصویر"><ImageUpload endpoint="/api/media/upload" onChange={() => {}} /></FormField>
            <div className="flex items-center gap-8">
              <Controller name="featured" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="ویژه" />} />
              <Controller name="active" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="فعال" />} />
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-default)]">
              <Button type="submit" variant="primary" loading={mutation.isPending}>ذخیره دوره</Button>
              <Button type="button" variant="secondary" onClick={() => router.push("/courses")}>لغو</Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
