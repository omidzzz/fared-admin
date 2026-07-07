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
import { getTourById, updateTour, deleteTour } from "@/lib/services/tours";

const schema = z.object({
  titleFa: z.string().min(2, "نام فارسی الزامی است"),
  titleEn: z.string().optional().default(""),
  descriptionFa: z.string().optional().default(""),
  price: z.coerce.number().min(0),
  duration: z.string().optional().default(""),
  maxCapacity: z.coerce.number().min(0).optional().default(0),
  featured: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
});

type FormData = z.infer<typeof schema>;

export default function EditTourPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: tour, isLoading } = useQuery({ queryKey: ["tour", id], queryFn: () => getTourById(id) });

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: tour ? { titleFa: tour.titleFa, titleEn: tour.titleEn, descriptionFa: tour.descriptionFa, price: tour.price, duration: tour.duration, maxCapacity: tour.maxCapacity, featured: false, active: tour.active } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => updateTour(id, { ...data, location: "", image: "" } as Partial<import("@/lib/types").Tour>),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tours"] }); Toast.success("تور با موفقیت بروزرسانی شد"); router.push("/tours"); },
    onError: (err) => Toast.error(err instanceof Error ? err.message : "خطا در بروزرسانی"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTour(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tours"] }); Toast.success("تور حذف شد"); router.push("/tours"); },
    onError: () => Toast.error("خطا در حذف تور"),
  });

  if (isLoading) return <AdminLayout><div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader title="ویرایش تور" breadcrumbs={[{ label: "تورها", href: "/tours" }, { label: tour?.titleFa ?? "..." }, { label: "ویرایش" }]} actions={<Button variant="secondary" onClick={() => router.push("/tours")}><ArrowRight size={18} />بازگشت</Button>} />
        <div className="card max-w-2xl">
          <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-5">
            <FormField label="نام فارسی" required error={errors.titleFa?.message}><Input placeholder="نام تور" {...register("titleFa")} /></FormField>
            <FormField label="نام انگلیسی" error={errors.titleEn?.message}><Input placeholder="Tour name" {...register("titleEn")} /></FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="قیمت (تومان)" required error={errors.price?.message}><Input type="number" {...register("price")} /></FormField>
              <FormField label="مدت" error={errors.duration?.message}><Input placeholder="مثال: ۳ روز" {...register("duration")} /></FormField>
            </div>
            <FormField label="حداکثر ظرفیت"><Input type="number" {...register("maxCapacity")} /></FormField>
            <FormField label="توضیحات"><textarea rows={4} className="form-input" placeholder="توضیحات تور..." {...register("descriptionFa")} /></FormField>
            <FormField label="تصویر"><ImageUpload value={tour?.image} endpoint="/api/media/upload" onChange={() => {}} /></FormField>
            <div className="flex items-center gap-8">
              <Controller name="featured" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="ویژه" />} />
              <Controller name="active" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="فعال" />} />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-default)]">
              <div className="flex items-center gap-3">
                <Button type="submit" variant="primary" loading={updateMutation.isPending}>ذخیره تغییرات</Button>
                <Button type="button" variant="secondary" onClick={() => router.push("/tours")}>لغو</Button>
              </div>
              <Button type="button" variant="danger" onClick={() => setDeleteOpen(true)}>حذف تور</Button>
            </div>
          </form>
        </div>
      </div>
      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={() => deleteMutation.mutate()} title="حذف تور" description={`آیا از حذف "${tour?.titleFa ?? ""}" اطمینان دارید؟`} confirmLabel="حذف" loading={deleteMutation.isPending} />
    </AdminLayout>
  );
}
