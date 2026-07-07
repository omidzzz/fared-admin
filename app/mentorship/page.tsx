"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { getSessions, updateSession, deleteSession, getBookings, updateBookingStatus } from "@/lib/services/mentorship";

const PAGE_SIZE = 10;
const STATUS_OPTIONS = [
  { label: "همه", value: "" },
  { label: "در انتظار", value: "PENDING" },
  { label: "تایید شده", value: "CONFIRMED" },
  { label: "تکمیل شده", value: "COMPLETED" },
  { label: "لغو شده", value: "CANCELLED" },
];
const BOOKING_STATUS_OPTIONS = STATUS_OPTIONS.filter((o) => o.value !== "");

type Session = { id: string; name: string; description?: string; duration: number; price: number; active: boolean };
type Booking = { id: string; customerName: string; sessionName: string; date: string; status: string };

export default function MentorshipPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"sessions" | "bookings">("sessions");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null);

  // Sessions
  const { data: sessionsData, isLoading: sLoading } = useQuery({
    queryKey: ["sessions", page],
    queryFn: () => getSessions({ page, limit: PAGE_SIZE }),
    enabled: tab === "sessions",
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Session> }) => updateSession(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sessions"] }); Toast.success("جلسه حذف شد"); setDeleteTarget(null); },
    onError: () => Toast.error("خطا در حذف جلسه"),
  });

  const sessionColumns: Column<Session>[] = [
    { key: "name", label: "نام" },
    { key: "duration", label: "مدت (دقیقه)", render: (v) => (v as number).toLocaleString("fa-IR") },
    { key: "price", label: "قیمت", render: (v) => `${(v as number).toLocaleString("fa-IR")} تومان` },
    { key: "active", label: "فعال", render: (v, row) => <Toggle checked={v as boolean} onChange={(c) => toggleMutation.mutate({ id: row.id, data: { active: c } })} /> },
    { key: "actions", label: "عملیات", render: (_v, row) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/mentorship/${row.id}/edit`); }}><Pencil size={16} /></Button>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}><Trash2 size={16} className="text-red-500" /></Button>
      </div>
    )},
  ];

  // Bookings
  const { data: bookingsData, isLoading: bLoading } = useQuery({
    queryKey: ["bookings", page, status],
    queryFn: () => getBookings({ page, limit: PAGE_SIZE, status: status || undefined }),
    enabled: tab === "bookings",
  });

  const bookingMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateBookingStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["bookings"] }); Toast.success("وضعیت رزرو بروزرسانی شد"); },
    onError: () => Toast.error("خطا در بروزرسانی"),
  });

  const bookingColumns: Column<Booking>[] = [
    { key: "customerName", label: "مشتری" },
    { key: "sessionName", label: "نوع جلسه" },
    { key: "date", label: "تاریخ", render: (v) => new Date(String(v ?? "")).toLocaleDateString("fa-IR") },
    { key: "status", label: "وضعیت", render: (v) => <StatusBadge status={String(v ?? "")} /> },
    { key: "actions", label: "تغییر وضعیت", render: (_v, row) => (
      <div className="flex items-center gap-2">
        <Select value="" onChange={(v) => v && bookingMutation.mutate({ id: row.id, status: v })} options={BOOKING_STATUS_OPTIONS} placeholder="انتخاب..." />
      </div>
    )},
  ];

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader title="منتورشیپ" description="مدیریت جلسات و رزروها" actions={tab === "sessions" ? <Button onClick={() => router.push("/mentorship/create")}><Plus size={18} />افزودن جلسه</Button> : undefined} />

        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          <button onClick={() => { setTab("sessions"); setPage(1); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "sessions" ? "bg-brand text-white" : "bg-white text-[var(--text-secondary)] hover:bg-subtle border"}`}>انواع جلسات</button>
          <button onClick={() => { setTab("bookings"); setPage(1); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "bookings" ? "bg-brand text-white" : "bg-white text-[var(--text-secondary)] hover:bg-subtle border"}`}>رزروها</button>
        </div>

        {tab === "sessions" && (
          <>
            <div className="card"><DataTable columns={sessionColumns} data={sessionsData?.sessions ?? []} isLoading={sLoading} emptyMessage="جلسه‌ای یافت نشد" /></div>
            <Pagination page={page} totalPages={Math.ceil((sessionsData?.total ?? 0) / PAGE_SIZE)} onPageChange={setPage} />
          </>
        )}

        {tab === "bookings" && (
          <>
            <div className="flex flex-wrap gap-1 mb-4">
              {STATUS_OPTIONS.map((s) => (
                <button key={s.value} onClick={() => { setStatus(s.value); setPage(1); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status === s.value ? "bg-brand text-white" : "bg-white text-[var(--text-secondary)] hover:bg-subtle border"}`}>{s.label}</button>
              ))}
            </div>
            <div className="card"><DataTable columns={bookingColumns} data={bookingsData?.bookings ?? []} isLoading={bLoading} emptyMessage="رزروی یافت نشد" /></div>
            <Pagination page={page} totalPages={Math.ceil((bookingsData?.total ?? 0) / PAGE_SIZE)} onPageChange={setPage} />
          </>
        )}
      </div>

      <ConfirmDialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} title="حذف جلسه" description={`آیا از حذف "${deleteTarget?.name ?? ""}" اطمینان دارید؟`} confirmLabel="حذف" loading={deleteMutation.isPending} />
    </AdminLayout>
  );
}
