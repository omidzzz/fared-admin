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
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Toast } from "@/components/ui/Toast";
import { RichTextEditor } from "@/components/editors/RichTextEditor";
import { createArticle } from "@/lib/services/cms";

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

export default function CreateArticlePage() {
  const router = useRouter();

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", slug: "", excerpt: "", category: "", published: false, body: "", image: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => createArticle(data),
    onSuccess: () => { Toast.success("مقاله با موفقیت ذخیره شد"); router.push("/cms"); },
    onError: (err) => Toast.error(err instanceof Error ? err.message : "خطا در ذخیره مقاله"),
  });

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setValue("title", title);
    if (!watch("slug")) {
      const slug = title
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();
      setValue("slug", slug);
    }
  };

  const onSubmit = (data: FormData, publish: boolean) => {
    mutation.mutate({ ...data, published: publish });
  };

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader title="مقاله جدید" breadcrumbs={[{ label: "مدیریت محتوا", href: "/cms" }, { label: "مقاله جدید" }]} actions={<Button variant="secondary" onClick={() => router.push("/cms")}><ArrowRight size={18} />بازگشت</Button>} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-5">
            <FormField label="عنوان" required error={errors.title?.message}>
              <Input placeholder="عنوان مقاله" {...register("title")} onChange={handleTitleChange} />
            </FormField>

            <FormField label="خلاصه" error={errors.excerpt?.message} hint="حداکثر ۳۰۰ کاراکتر">
              <textarea rows={3} className="form-input" placeholder="خلاصه کوتاه از مقاله..." {...register("excerpt")} />
            </FormField>

            <FormField label="محتوا">
              <Controller name="body" control={control} render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} placeholder="متن مقاله..." />} />
            </FormField>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="card space-y-4">
              <FormField label="اسلاگ" hint="اگر خالی بماند خودکار تولید می‌شود">
                <Input placeholder="article-slug" {...register("slug")} />
              </FormField>

              <FormField label="دسته‌بندی" required error={errors.category?.message}>
                <Controller name="category" control={control} render={({ field }) => <Select value={field.value} onChange={field.onChange} options={CATEGORY_OPTIONS} placeholder="انتخاب دسته‌بندی" />} />
              </FormField>

              <FormField label="تصویر شاخص">
                <Controller name="image" control={control} render={({ field }) => <ImageUpload value={field.value} onChange={(url) => setValue("image", url)} endpoint="/api/media/upload" />} />
              </FormField>

              <Controller name="published" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="منتشر شده" />} />
            </div>

            {/* Action buttons */}
            <div className="card space-y-3">
              <Button type="button" variant="primary" className="w-full" loading={mutation.isPending && watch("published")} onClick={handleSubmit((d) => onSubmit(d, true))}>
                انتشار
              </Button>
              <Button type="button" variant="secondary" className="w-full" loading={mutation.isPending && !watch("published")} onClick={handleSubmit((d) => onSubmit(d, false))}>
                ذخیره پیش‌نویس
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
