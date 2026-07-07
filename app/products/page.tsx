"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Toast } from "@/components/ui/Toast";
import {
  getProducts,
  updateProduct,
  deleteProduct,
} from "@/lib/services/products";
import type { Product } from "@/lib/types";

const PAGE_SIZE = 10;

const CATEGORY_OPTIONS = [
  { label: "همه", value: "" },
  { label: "سنگ", value: "stones" },
  { label: "شمع", value: "candles" },
  { label: "اکسسوری", value: "accessories" },
  { label: "پوشاک", value: "clothes" },
  { label: "دوره", value: "courses" },
  { label: "تور", value: "mentorship" },
];

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, search, category],
    queryFn: () =>
      getProducts({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        category: category || undefined,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      Toast.success("محصول با موفقیت به‌روزرسانی شد");
    },
    onError: () => {
      Toast.error("خطا در به‌روزرسانی محصول");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      Toast.success("محصول با موفقیت حذف شد");
      setDeleteTarget(null);
    },
    onError: () => {
      Toast.error("خطا در حذف محصول");
    },
  });

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  const columns: Column<Product>[] = [
    {
      key: "images",
      label: "تصویر",
      render: (value) => {
        const images = value as string[] | undefined;
        const src = images?.[0];
        return src ? (
          <img
            src={src}
            alt=""
            className="w-10 h-10 rounded-lg object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-subtle" />
        );
      },
    },
    {
      key: "nameFa",
      label: "نام",
    },
    {
      key: "category",
      label: "دسته‌بندی",
      render: (value) => (
        <StatusBadge
          status={((value as string) ?? "UNCATEGORIZED").toUpperCase()}
        />
      ),
    },
    {
      key: "price",
      label: "قیمت",
      render: (value) =>
        `${(value as number).toLocaleString("fa-IR")} تومان`,
    },
    {
      key: "stock",
      label: "موجودی",
    },
    {
      key: "featured",
      label: "ویژه",
      render: (value, row) => (
        <Toggle
          checked={value as boolean}
          onChange={(checked) =>
            updateMutation.mutate({ id: row.id!, data: { featured: checked } })
          }
        />
      ),
    },
    {
      key: "isBestSeller",
      label: "پرفروش",
      render: (value, row) => (
        <Toggle
          checked={value as boolean}
          onChange={(checked) =>
            updateMutation.mutate({ id: row.id!, data: { isBestSeller: checked } })
          }
        />
      ),
    },
    {
      key: "active",
      label: "فعال",
      render: (value, row) => (
        <Toggle
          checked={value as boolean}
          onChange={(checked) =>
            updateMutation.mutate({ id: row.id!, data: { active: checked } })
          }
        />
      ),
    },
    {
      key: "actions",
      label: "عملیات",
      render: (_value, row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/products/${row.id}/edit`);
            }}
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
          >
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader
          title="محصولات"
          description="مدیریت محصولات فروشگاه"
          actions={
            <Button onClick={() => router.push("/products/create")}>
              <Plus size={18} />
              افزودن محصول
            </Button>
          }
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="جستجوی محصول..."
            className="sm:w-72"
          />
          <Select
            value={category}
            onChange={(v) => {
              setCategory(v);
              setPage(1);
            }}
            options={CATEGORY_OPTIONS}
            placeholder="دسته‌بندی"
          />
        </div>

        {/* Table */}
        <div className="card">
          <DataTable
            columns={columns}
            data={data?.products ?? []}
            isLoading={isLoading}
            emptyMessage="محصولی یافت نشد"
          />
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id!)}
        title="حذف محصول"
        description={`آیا از حذف محصول "${deleteTarget?.nameFa ?? ""}" اطمینان دارید؟ این عملیات قابل بازگشت نیست.`}
        confirmLabel="حذف"
        loading={deleteMutation.isPending}
      />
    </AdminLayout>
  );
}
