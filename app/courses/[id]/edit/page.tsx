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
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { getCourseById, updateCourse, deleteCourse } from "@/lib/services/courses";

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

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: course, isLoading } = useQuery({ queryKey: ["course", id], queryFn: () => getCourseById(id) });

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: course ? { titleFa: course.titleFa, titleEn: course.titleEn, descriptionFa: course.descriptionFa, price: course.price, durationHours: course.durationHours, instructor: course.instructor, featured: false, active: course.active } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => updateCourse(id, { ...data, instructorImage: "", image: "" } as Partial<import("@/lib/types").Course>),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["courses"] }); Toast.success("دوره بروزرسانی شد"); router.push("/courses"); },
    onError: (err) => Toast.error(err instanceof Error ? err.message : "خطا در بروزرسانی"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCourse(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["courses"] }); Toast.success("دوره حذف شد"); router.push("/courses"); },
    onError: () => Toast.error("خطا در حذف دوره"),
  });

  if (isLoading) return <AdminLayout><div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader title="ویرایش دوره" breadcrumbs={[{ label: "دوره‌ها", href: "/courses" }, { label: course?.titleFa ?? "..." }, { label: "ویرایش" }]} actions={<Button variant="secondary" onClick={() => router.push("/courses")}><ArrowRight size={18} />بازگشت</Button>} />
        <div className="card max-w-2xl">
          <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-5">
            <FormField label="عنوان" required error={errors.titleFa?.message}><Input placeholder="عنوان دوره" {...register("titleFa")} /></FormField>
            <FormField label="نام انگلیسی"><Input placeholder="Course title" {...register("titleEn")} /></FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="قیمت (تومان)" required error={errors.price?.message}><Input type="number" {...register("price")} /></FormField>
              <FormField label="مدت (ساعت)"><Input type="number" {...register("durationHours")} /></FormField>
            </div>
            <FormField label="نام مدرس"><Input placeholder="نام مدرس" {...register("instructor")} /></FormField>
            <FormField label="توضیحات"><textarea rows={4} className="form-input" placeholder="توضیحات دوره..." {...register("descriptionFa")} /></FormField>
            <FormField label="تصویر"><ImageUpload value={course?.image} endpoint="/api/media/upload" onChange={() => {}} /></FormField>
            <div className="flex items-center gap-8">
              <Controller name="featured" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="ویژه" />} />
              <Controller name="active" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="فعال" />} />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-default)]">
              <div className="flex items-center gap-3">
                <Button type="submit" variant="primary" loading={updateMutation.isPending}>ذخیره تغییرات</Button>
                <Button type="button" variant="secondary" onClick={() => router.push("/courses")}>لغو</Button>
              </div>
              <Button type="button" variant="danger" onClick={() => setDeleteOpen(true)}>حذف دوره</Button>
            </div>
          </form>
        </div>
      </div>
      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={() => deleteMutation.mutate()} title="حذف دوره" description={`آیا از حذف "${course?.titleFa ?? ""}" اطمینان دارید؟`} confirmLabel="حذف" loading={deleteMutation.isPending} />
    </AdminLayout>
  );
}
