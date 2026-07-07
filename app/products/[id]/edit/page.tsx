"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Trash2, Plus } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/lib/services/products";
import type { ProductCategory } from "@/lib/types";
import { useState, useEffect } from "react";

const productSchema = z.object({
  nameFa: z.string().min(2, "نام فارسی الزامی است"),
  nameEn: z.string().optional().default(""),
  price: z.coerce.number().min(0, "قیمت نمی‌تواند منفی باشد"),
  comparePrice: z.coerce.number().min(0).optional().default(0),
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
  isBestSeller: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  tagsFA: z.string().optional().default(""),
  tagsEN: z.string().optional().default(""),
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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<{url: string; isFeatured?: boolean}[]>([]);
  const [newVariantSize, setNewVariantSize] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [localVariants, setLocalVariants] = useState<{id: string; name: string}[]>([]);
  const [localColors, setLocalColors] = useState<{id: string; name: string; hex: string}[]>([]);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  });

  useEffect(() => {
    if (product) {
      setGalleryImages((product.images || []).map((url: string) => ({ url, isFeatured: false })));
      setLocalVariants((product.variants || []).map((v: { id: string; name: string }) => ({ id: v.id, name: v.name })));
      setLocalColors((product.colorOptions || []).map((c: { id: string; name: string; hex: string }) => ({ id: c.id, name: c.name, hex: c.hex })));
    }
  }, [product]);

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
      comparePrice: 0,
      stock: 0,
      category: "stones",
      descriptionFa: "",
      descriptionEn: "",
      featured: false,
      isBestSeller: false,
      active: true,
      tagsFA: "",
      tagsEN: "",
    },
    values: product
      ? {
          nameFa: product.nameFa,
          nameEn: product.nameEn,
          price: product.price,
          comparePrice: product.comparePrice ?? 0,
          stock: product.stock,
          category: product.category as ProductFormData["category"],
          descriptionFa: product.descriptionFa,
          descriptionEn: product.descriptionEn,
          featured: product.featured,
          isBestSeller: product.isBestSeller,
          active: product.active,
          tagsFA: Array.isArray(product.tagsFA) ? product.tagsFA.join(", ") : (product.tagsFA ?? ""),
          tagsEN: Array.isArray(product.tagsEN) ? product.tagsEN.join(", ") : (product.tagsEN ?? ""),
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData) =>
      updateProduct(id, {
        ...data,
        category: data.category as ProductCategory,
        tagsFA: data.tagsFA.split(",").map(t => t.trim()).filter(Boolean),
        tagsEN: data.tagsEN.split(",").map(t => t.trim()).filter(Boolean),
        variants: localVariants,
        colorOptions: localColors,
        images: galleryImages.map(img => img.url),
      } as Partial<import("@/lib/types").Product> & { category: ProductCategory }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      Toast.success("محصول با موفقیت به‌روزرسانی شد");
      router.push("/products");
    },
    onError: (err) => {
      Toast.error(err instanceof Error ? err.message : "خطا در به‌روزرسانی محصول");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      Toast.success("محصول با موفقیت حذف شد");
      router.push("/products");
    },
    onError: () => {
      Toast.error("خطا در حذف محصول");
    },
  });

  const onSubmit = (data: ProductFormData) => {
    updateMutation.mutate(data);
  };

  const handleAddVariant = () => {
    if (newVariantSize.trim()) {
      setLocalVariants([...localVariants, { id: `new_${Date.now()}`, name: newVariantSize.trim() }]);
      setNewVariantSize("");
    }
  };

  const handleRemoveVariant = (id: string) => {
    setLocalVariants(localVariants.filter(v => v.id !== id));
  };

  const handleAddColor = () => {
    if (newColorName.trim()) {
      setLocalColors([...localColors, { id: `new_${Date.now()}`, name: newColorName.trim(), hex: newColorHex }]);
      setNewColorName("");
      setNewColorHex("#000000");
    }
  };

  const handleRemoveColor = (id: string) => {
    setLocalColors(localColors.filter(c => c.id !== id));
  };

  const handleHexChange = (hex: string) => {
    setNewColorHex(hex);
  };

  const handleColorNameChange = (name: string) => {
    setNewColorName(name);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader
          title="ویرایش محصول"
          breadcrumbs={[
            { label: "محصولات", href: "/products" },
            { label: product?.nameFa ?? "..." },
            { label: "ویرایش" },
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

            {/* Compare Price + Stock row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="قیمت مقایسه‌ای (تومان)" error={errors.comparePrice?.message}>
                <Input
                  type="number"
                  placeholder="قیمت قبل از تخفیف"
                  {...register("comparePrice")}
                />
              </FormField>

              <FormField label="موجودی" error={errors.stock?.message}>
                <Input
                  type="number"
                  placeholder="تعداد موجودی"
                  {...register("stock")}
                />
              </FormField>
            </div>

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

            {/* Image gallery */}
            <FormField label="تصاویر">
              <ImageGallery
                images={galleryImages}
                endpoint="/api/media/upload"
                onChange={setGalleryImages}
              />
            </FormField>

            {/* Featured + Best Seller + Active toggles */}
            <div className="flex items-center gap-8">
              <Controller
                name="featured"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col items-center gap-1">
                    <Toggle
                      checked={field.value}
                      onChange={field.onChange}
                      label="محصول ویژه"
                    />
                  </div>
                )}
              />
              <Controller
                name="isBestSeller"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col items-center gap-1">
                    <Toggle
                      checked={field.value}
                      onChange={field.onChange}
                      label="پرفروش"
                    />
                  </div>
                )}
              />
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col items-center gap-1">
                    <Toggle
                      checked={field.value}
                      onChange={field.onChange}
                      label="فعال"
                    />
                  </div>
                )}
              />
            </div>

            {/* Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="تگ‌های فارسی (جدا شده با ویرگول)" error={errors.tagsFA?.message}>
                <Input
                  placeholder="مثال: سنگی، تزئینی، دست‌ساز"
                  {...register("tagsFA")}
                />
              </FormField>
              <FormField label="تگ‌های انگلیسی (جدا شده با ویرگول)" error={errors.tagsEN?.message}>
                <Input
                  placeholder="Example: stone, decorative, handmade"
                  {...register("tagsEN")}
                />
              </FormField>
            </div>

            {/* Variants (for clothes) */}
            {product?.category === "clothes" && (
              <div className="space-y-4 p-4 border border-[var(--border-default)] rounded-lg">
                <h3 className="text-lg font-medium">تنوع‌ها (سایزها)</h3>
                {localVariants.map((variant) => (
                  <div key={variant.id} className="flex items-center gap-2">
                    <Input value={variant.name} readOnly className="flex-1" />
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveVariant(variant.id)}>
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="مثال: M, L, XL"
                    value={newVariantSize}
                    onChange={(e) => setNewVariantSize(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddVariant())}
                    className="flex-1"
                  />
                  <Button type="button" size="sm" onClick={handleAddVariant}>
                    <Plus size={16} />
                    افزودن
                  </Button>
                </div>
              </div>
            )}

            {/* Color Options (for clothes) */}
            {product?.category === "clothes" && (
              <div className="space-y-4 p-4 border border-[var(--border-default)] rounded-lg">
                <h3 className="text-lg font-medium">رنگ‌ها</h3>
                {localColors.map((color) => (
                  <div key={color.id} className="flex items-center gap-2">
                    <Input value={color.name} readOnly className="flex-1" />
                    <div className="w-10 h-10 rounded border" style={{ backgroundColor: color.hex }} />
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveColor(color.id)}>
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="نام رنگ"
                    value={newColorName}
                    onChange={(e) => handleColorNameChange(e.target.value)}
                    className="flex-1"
                  />
                  <div className="relative">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => handleHexChange(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border border-[var(--border-default)]"
                    />
                  </div>
                  <Input
                    placeholder="#000000"
                    value={newColorHex}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="w-28"
                  />
                  <Button type="button" size="sm" onClick={handleAddColor}>
                    <Plus size={16} />
                    افزودن
                  </Button>
                </div>
              </div>
            )}

            {/* Submit + Delete */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-default)]">
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={updateMutation.isPending}
                >
                  ذخیره تغییرات
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push("/products")}
                >
                  لغو
                </Button>
              </div>

              <Button
                type="button"
                variant="danger"
                onClick={() => setDeleteOpen(true)}
              >
                حذف محصول
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="حذف محصول"
        description={`آیا از حذف محصول "${product?.nameFa ?? ""}" اطمینان دارید؟`}
        confirmLabel="حذف"
        loading={deleteMutation.isPending}
      />
    </AdminLayout>
  );
}