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
import { getCourses, updateCourse, deleteCourse } from "@/lib/services/courses";
import type { Course } from "@/lib/types";

const PAGE_SIZE = 10;

export default function CoursesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["courses", page, search],
    queryFn: () => getCourses({ page, limit: PAGE_SIZE, search: search || undefined }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Course> }) => updateCourse(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["courses"] }); Toast.success("دوره با موفقیت حذف شد"); setDeleteTarget(null); },
    onError: () => Toast.error("خطا در حذف دوره"),
  });

  const columns: Column<Course>[] = [
    { key: "image", label: "تصویر", render: (v) => v ? <img src={String(v)} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-subtle" /> },
    { key: "titleFa", label: "عنوان" },
    { key: "price", label: "قیمت", render: (v) => `${(v as number).toLocaleString("fa-IR")} تومان` },
    { key: "instructor", label: "مدرس", render: (v) => String(v ?? "—") },
    { key: "active", label: "وضعیت", render: (v, row) => <Toggle checked={v as boolean} onChange={(c) => toggleMutation.mutate({ id: row.id!, data: { active: c } })} /> },
    { key: "actions", label: "عملیات", render: (_v, row) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/courses/${row.id}/edit`); }}><Pencil size={16} /></Button>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}><Trash2 size={16} className="text-red-500" /></Button>
      </div>
    )},
  ];

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader title="دوره‌ها" description="مدیریت دوره‌های آموزشی" actions={<Button onClick={() => router.push("/courses/create")}><Plus size={18} />افزودن دوره</Button>} />
        <div className="mb-6"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="جستجوی دوره..." className="sm:w-72" /></div>
        <div className="card"><DataTable columns={columns} data={data?.courses ?? []} isLoading={isLoading} emptyMessage="دوره‌ای یافت نشد" /></div>
        <Pagination page={page} totalPages={Math.ceil((data?.total ?? 0) / PAGE_SIZE)} onPageChange={setPage} />
      </div>
      <ConfirmDialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id!)} title="حذف دوره" description={`آیا از حذف "${deleteTarget?.titleFa ?? ""}" اطمینان دارید؟`} confirmLabel="حذف" loading={deleteMutation.isPending} />
    </AdminLayout>
  );
}
