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
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { getTours, updateTour, deleteTour } from "@/lib/services/tours";
import type { Tour } from "@/lib/types";

const PAGE_SIZE = 10;

export default function ToursPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Tour | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["tours", page, search],
    queryFn: () => getTours({ page, limit: PAGE_SIZE, search: search || undefined }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Tour> }) => updateTour(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tours"] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTour(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tours"] }); Toast.success("تور با موفقیت حذف شد"); setDeleteTarget(null); },
    onError: () => Toast.error("خطا در حذف تور"),
  });

  const columns: Column<Tour>[] = [
    { key: "image", label: "تصویر", render: (v) => v ? <img src={String(v)} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-subtle" /> },
    { key: "titleFa", label: "نام" },
    { key: "price", label: "قیمت", render: (v) => `${(v as number).toLocaleString("fa-IR")} تومان` },
    { key: "maxCapacity", label: "ظرفیت", render: (v) => (v as number).toLocaleString("fa-IR") },
    { key: "active", label: "وضعیت", render: (v, row) => <Toggle checked={v as boolean} onChange={(c) => toggleMutation.mutate({ id: row.id!, data: { active: c } })} /> },
    { key: "actions", label: "عملیات", render: (_v, row) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/tours/${row.id}/edit`); }}><Pencil size={16} /></Button>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}><Trash2 size={16} className="text-red-500" /></Button>
      </div>
    )},
  ];

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader title="تورها" description="مدیریت تورهای معنوی" actions={<Button onClick={() => router.push("/tours/create")}><Plus size={18} />افزودن تور</Button>} />
        <div className="mb-6"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="جستجوی تور..." className="sm:w-72" /></div>
        <div className="card"><DataTable columns={columns} data={data?.tours ?? []} isLoading={isLoading} emptyMessage="توری یافت نشد" /></div>
        <Pagination page={page} totalPages={Math.ceil((data?.total ?? 0) / PAGE_SIZE)} onPageChange={setPage} />
      </div>
      <ConfirmDialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id!)} title="حذف تور" description={`آیا از حذف "${deleteTarget?.titleFa ?? ""}" اطمینان دارید؟`} confirmLabel="حذف" loading={deleteMutation.isPending} />
    </AdminLayout>
  );
}
