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
import { createProduct } from "@/lib/services/products";
import type { ProductCategory } from "@/lib/types";

const productSchema = z.object({
  nameFa: z.string().min(2, "نام فارسی الزامی است"),
  nameEn: z.string().optional().default(""),
  price: z.coerce.number().min(0, "قیمت نمی‌تواند منفی باشد"),
  stock: z.coerce.number().min(0).optional().default(0),
  category: z.enum([
    "stones",
    "candles",
    "accessories",
    "clothes",
    "courses",
    "mentorship",
  ] as const),
  descriptionFa: z.string().optional().default(""),
  descriptionEn: z.string().optional().default(""),
  featured: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

const CATEGORY_OPTIONS = [
  { label: "سنگ", value: "stones" },
  { label: "شمع", value: "candles" },
  { label: "اکسسوری", value: "accessories" },
  { label: "پوشاک", value: "clothes" },
  { label: "دوره", value: "courses" },
  { label: "منتورشیپ", value: "mentorship" },
];

export default function CreateProductPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nameFa: "",
      nameEn: "",
      price: 0,
      stock: 0,
      category: "stones",
      descriptionFa: "",
      descriptionEn: "",
      featured: false,
      active: true,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ProductFormData) =>
      createProduct({
        ...data,
        category: data.category as ProductCategory,
        images: [],
        comparePrice: undefined,
      } as Partial<import("@/lib/types").Product> & { category: ProductCategory }),
    onSuccess: () => {
      Toast.success("محصول با موفقیت ایجاد شد");
      router.push("/products");
    },
    onError: (err) => {
      Toast.error(err instanceof Error ? err.message : "خطا در ایجاد محصول");
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    mutation.mutate(data);
  };

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader
          title="افزودن محصول"
          breadcrumbs={[
            { label: "محصولات", href: "/products" },
            { label: "افزودن محصول" },
          ]}
          actions={
            <Button
              variant="secondary"
              onClick={() => router.push("/products")}
            >
              <ArrowRight size={18} />
              بازگشت
            </Button>
          }
        />

        <div className="card max-w-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* نام فارسی */}
            <FormField label="نام فارسی" required error={errors.nameFa?.message}>
              <Input
                placeholder="نام محصول به فارسی"
                {...register("nameFa")}
              />
            </FormField>

            {/* نام انگلیسی */}
            <FormField label="نام انگلیسی" error={errors.nameEn?.message}>
              <Input
                placeholder="Product name in English"
                {...register("nameEn")}
              />
            </FormField>

            {/* Category + Price row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="دسته‌بندی"
                required
                error={errors.category?.message}
              >
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      options={CATEGORY_OPTIONS}
                      placeholder="انتخاب دسته‌بندی"
                    />
                  )}
                />
              </FormField>

              <FormField label="قیمت (تومان)" required error={errors.price?.message}>
                <Input
                  type="number"
                  placeholder="مثال: ۲۸۰۰۰۰"
                  {...register("price")}
                />
              </FormField>
            </div>

            {/* Stock */}
            <FormField label="موجودی" error={errors.stock?.message}>
              <Input
                type="number"
                placeholder="تعداد موجودی"
                {...register("stock")}
              />
            </FormField>

            {/* Description FA */}
            <FormField label="توضیحات فارسی">
              <textarea
                rows={4}
                className="form-input"
                placeholder="توضیحات محصول به فارسی..."
                {...register("descriptionFa")}
              />
            </FormField>

            {/* Description EN */}
            <FormField label="توضیحات انگلیسی">
              <textarea
                rows={4}
                className="form-input"
                placeholder="Product description in English..."
                {...register("descriptionEn")}
              />
            </FormField>

            {/* Image upload */}
            <FormField label="تصویر اصلی">
              <Controller
                name="nameFa"
                control={control}
                render={() => (
                  <ImageUpload
                    endpoint="/api/media/upload"
                    onChange={() => {}}
                  />
                )}
              />
            </FormField>

            {/* Featured + Active toggles */}
            <div className="flex items-center gap-8">
              <Controller
                name="featured"
                control={control}
                render={({ field }) => (
                  <Toggle
                    checked={field.value}
                    onChange={field.onChange}
                    label="محصول ویژه"
                  />
                )}
              />
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <Toggle
                    checked={field.value}
                    onChange={field.onChange}
                    label="فعال"
                  />
                )}
              />
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-default)]">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={mutation.isPending}
              >
                ذخیره محصول
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/products")}
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
