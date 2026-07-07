"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Pencil, ArrowRight, Package, Tag, Hash } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getProductById } from "@/lib/services/products";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="page-container text-center py-16">
          <p className="text-lg text-[var(--text-secondary)]">
            محصول یافت نشد
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader
          title={product.nameFa}
          description={`${product.nameEn}`}
          breadcrumbs={[
            { label: "محصولات", href: "/products" },
            { label: product.nameFa },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => router.push("/products")}
              >
                <ArrowRight size={18} />
                بازگشت
              </Button>
              <Button
                onClick={() => router.push(`/products/${id}/edit`)}
              >
                <Pencil size={18} />
                ویرایش
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {product.images.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                  تصاویر
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {product.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${product.nameFa} ${i + 1}`}
                      className="w-24 h-24 rounded-xl object-cover border border-[var(--border-default)]"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Descriptions */}
            <div className="card">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                توضیحات فارسی
              </h3>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                {product.descriptionFa || "—"}
              </p>
            </div>

            <div className="card">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                English Description
              </h3>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                {product.descriptionEn || "—"}
              </p>
            </div>
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            {/* Price & Stock */}
            <div className="card space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Tag size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">قیمت</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">
                    {product.price.toLocaleString("fa-IR")} تومان
                  </p>
                  {product.comparePrice && (
                    <p className="text-sm text-[var(--text-muted)] line-through">
                      {product.comparePrice.toLocaleString("fa-IR")} تومان
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Package size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">موجودی</p>
                  <p className="font-bold text-[var(--text-primary)]">
                    {product.stock.toLocaleString("fa-IR")} عدد
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Hash size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">دسته‌بندی</p>
                  <Badge variant="info">{product.category}</Badge>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">وضعیت</span>
                <Badge variant={product.active ? "success" : "default"}>
                  {product.active ? "فعال" : "غیرفعال"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">ویژه</span>
                <Badge variant={product.featured ? "warning" : "default"}>
                  {product.featured ? "بله" : "خیر"}
                </Badge>
              </div>
            </div>

            {/* Meta */}
            <div className="card space-y-2 text-xs text-[var(--text-muted)]">
              <p>
                Slug: {product.slug}
              </p>
              <p>
                تاریخ ایجاد:{" "}
                {new Date(product.createdAt).toLocaleDateString("fa-IR")}
              </p>
              <p>
                آخرین بروزرسانی:{" "}
                {new Date(product.updatedAt).toLocaleDateString("fa-IR")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
