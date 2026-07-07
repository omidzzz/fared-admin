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
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { RichTextEditor } from "@/components/editors/RichTextEditor";
import { getArticleById, updateArticle, deleteArticle } from "@/lib/services/cms";

const schema = z.object({
  title: z.string().min(2, "عنوان الزامی است"),
  slug: z.string().optional().default(""),
  excerpt: z.string().max(300, "حداکثر ۳۰۰ کاراکتر").optional().default(""),
  category: z.string().min(1, "دسته‌بندی الزامی است"),
  published: z.boolean().optional().default(false),
  body: z.string().optional().default(""),
  image: z.string().optional().default(""),
});

type FormData = z.infer<typeof schema>;

const CATEGORY_OPTIONS = [
  { label: "معنویت", value: "spirituality" },
  { label: "مدیتیشن", value: "meditation" },
  { label: "کریستال", value: "crystals" },
  { label: "یوگا", value: "yoga" },
  { label: "عمومی", value: "general" },
];

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: article, isLoading } = useQuery({ queryKey: ["article", id], queryFn: () => getArticleById(id) });

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: article ? { title: article.title, slug: article.slug, excerpt: article.excerpt ?? "", category: article.category, published: article.published, body: article.body, image: article.image ?? "" } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => updateArticle(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["articles"] }); Toast.success("مقاله بروزرسانی شد"); router.push("/cms"); },
    onError: (err) => Toast.error(err instanceof Error ? err.message : "خطا در بروزرسانی"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteArticle(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["articles"] }); Toast.success("مقاله حذف شد"); router.push("/cms"); },
    onError: () => Toast.error("خطا در حذف مقاله"),
  });

  const onSubmit = (data: FormData) => updateMutation.mutate(data);

  if (isLoading) return <AdminLayout><div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader title="ویرایش مقاله" breadcrumbs={[{ label: "مدیریت محتوا", href: "/cms" }, { label: article?.title ?? "..." }, { label: "ویرایش" }]} actions={<Button variant="secondary" onClick={() => router.push("/cms")}><ArrowRight size={18} />بازگشت</Button>} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <FormField label="عنوان" required error={errors.title?.message}><Input placeholder="عنوان مقاله" {...register("title")} /></FormField>
            <FormField label="خلاصه" error={errors.excerpt?.message} hint="حداکثر ۳۰۰ کاراکتر"><textarea rows={3} className="form-input" placeholder="خلاصه کوتاه..." {...register("excerpt")} /></FormField>
            <FormField label="محتوا"><Controller name="body" control={control} render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} placeholder="متن مقاله..." />} /></FormField>
          </div>

          <div className="space-y-5">
            <div className="card space-y-4">
              <FormField label="اسلاگ"><Input placeholder="article-slug" {...register("slug")} /></FormField>
              <FormField label="دسته‌بندی" required error={errors.category?.message}>
                <Controller name="category" control={control} render={({ field }) => <Select value={field.value} onChange={field.onChange} options={CATEGORY_OPTIONS} />} />
              </FormField>
              <FormField label="تصویر شاخص">
                <Controller name="image" control={control} render={({ field }) => <ImageUpload value={field.value} onChange={(url) => setValue("image", url)} endpoint="/api/media/upload" />} />
              </FormField>
              <Controller name="published" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="منتشر شده" />} />
            </div>

            <div className="card space-y-3">
              <Button type="button" variant="primary" className="w-full" loading={updateMutation.isPending} onClick={handleSubmit(onSubmit)}>ذخیره تغییرات</Button>
              <Button type="button" variant="danger" className="w-full" onClick={() => setDeleteOpen(true)}>حذف مقاله</Button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={() => deleteMutation.mutate()} title="حذف مقاله" description={`آیا از حذف "${article?.title ?? ""}" اطمینان دارید؟`} confirmLabel="حذف" loading={deleteMutation.isPending} />
    </AdminLayout>
  );
}
