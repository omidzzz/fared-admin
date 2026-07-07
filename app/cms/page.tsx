"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { getArticles, deleteArticle, type Article } from "@/lib/services/cms";

const PAGE_SIZE = 10;

const PUBLISH_FILTERS = [
  { label: "همه", value: "all" },
  { label: "منتشر شده", value: "published" },
  { label: "پیش‌نویس", value: "draft" },
];

const CATEGORY_OPTIONS = [
  { label: "همه", value: "" },
  { label: "معنویت", value: "spirituality" },
  { label: "مدیتیشن", value: "meditation" },
  { label: "کریستال", value: "crystals" },
  { label: "یوگا", value: "yoga" },
  { label: "عمومی", value: "general" },
];

const CATEGORY_LABEL: Record<string, string> = {
  spirituality: "معنویت", meditation: "مدیتیشن", crystals: "کریستال",
  yoga: "یوگا", general: "عمومی",
};

export default function CMSPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [publishFilter, setPublishFilter] = useState("all");
  const [category, setCategory] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);

  const publishedParam = publishFilter === "all" ? undefined : publishFilter === "published";

  const { data, isLoading } = useQuery({
    queryKey: ["articles", page, publishedParam, category],
    queryFn: () => getArticles({ page, limit: PAGE_SIZE, published: publishedParam, category: category || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteArticle(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["articles"] }); Toast.success("مقاله حذف شد"); setDeleteTarget(null); },
    onError: () => Toast.error("خطا در حذف مقاله"),
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString("fa-IR");

  const columns: Column<Article>[] = [
    { key: "image", label: "تصویر", render: (v) => v ? <img src={String(v)} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-subtle" /> },
    { key: "title", label: "عنوان" },
    { key: "category", label: "دسته‌بندی", render: (v) => <Badge variant="info">{CATEGORY_LABEL[String(v)] ?? String(v)}</Badge> },
    { key: "published", label: "وضعیت", render: (v) => v ? <Badge variant="success">منتشر شده</Badge> : <Badge variant="default">پیش‌نویس</Badge> },
    { key: "createdAt", label: "تاریخ", render: (v) => formatDate(String(v ?? "")) },
    { key: "actions", label: "عملیات", render: (_v, row) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/cms/${row.id}/edit`); }}><Pencil size={16} /></Button>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}><Trash2 size={16} className="text-red-500" /></Button>
      </div>
    )},
  ];

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader title="مدیریت محتوا" description="مدیریت مقالات" actions={<Button onClick={() => router.push("/cms/create")}><Plus size={18} />مقاله جدید</Button>} />

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-1">
            {PUBLISH_FILTERS.map((f) => (
              <button key={f.value} onClick={() => { setPublishFilter(f.value); setPage(1); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${publishFilter === f.value ? "bg-brand text-white" : "bg-white text-[var(--text-secondary)] hover:bg-subtle border"}`}>{f.label}</button>
            ))}
          </div>
          <Select value={category} onChange={(v) => { setCategory(v); setPage(1); }} options={CATEGORY_OPTIONS} placeholder="دسته‌بندی" />
        </div>

        <div className="card"><DataTable columns={columns} data={data?.articles ?? []} isLoading={isLoading} emptyMessage="مقاله‌ای یافت نشد" /></div>
        <Pagination page={page} totalPages={Math.ceil((data?.total ?? 0) / PAGE_SIZE)} onPageChange={setPage} />
      </div>
      <ConfirmDialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} title="حذف مقاله" description={`آیا از حذف "${deleteTarget?.title ?? ""}" اطمینان دارید؟`} confirmLabel="حذف" loading={deleteMutation.isPending} />
    </AdminLayout>
  );
}
