"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Mail, User, Calendar } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { getLeads, markAsRead, type Message } from "@/lib/services/leads";

const PAGE_SIZE = 10;

const FILTER_TABS = [
  { label: "همه", value: "all" },
  { label: "خوانده نشده", value: "unread" },
  { label: "خوانده شده", value: "read" },
];

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Message | null>(null);

  const readParam =
    filter === "all" ? undefined : filter === "unread" ? false : true;

  const { data, isLoading } = useQuery({
    queryKey: ["leads", page, filter],
    queryFn: () =>
      getLeads({ page, limit: PAGE_SIZE, read: readParam }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const handleViewLead = (lead: Message) => {
    setSelectedLead(lead);
    if (!lead.read) {
      markReadMutation.mutate(lead.id);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fa-IR");

  const columns: Column<Message>[] = [
    {
      key: "name",
      label: "نام",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {!row.read && (
            <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
          )}
          <span className="font-medium text-[var(--text-primary)]">
            {String(value ?? "")}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      label: "ایمیل",
      render: (value) => (
        <span className="dir-ltr text-[var(--text-secondary)]">
          {String(value ?? "—")}
        </span>
      ),
    },
    {
      key: "subject",
      label: "موضوع",
      render: (value) => {
        const s = String(value ?? "");
        return s ? (
          <span className="text-[var(--text-secondary)]">{s}</span>
        ) : (
          <span className="text-[var(--text-muted)]">—</span>
        );
      },
    },
    {
      key: "read",
      label: "وضعیت",
      render: (value) =>
        value ? (
          <Badge variant="default">خوانده شده</Badge>
        ) : (
          <Badge variant="warning">خوانده نشده</Badge>
        ),
    },
    {
      key: "createdAt",
      label: "تاریخ",
      render: (value) => formatDate(String(value ?? "")),
    },
    {
      key: "actions",
      label: "مشاهده",
      render: (_value, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleViewLead(row);
          }}
        >
          <Eye size={16} />
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader title="پیام‌ها و لیدها" description="مدیریت پیام‌های دریافتی و لیدها" />

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-1 mb-6">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setFilter(tab.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.value
                  ? "bg-brand text-white"
                  : "bg-white text-[var(--text-secondary)] hover:bg-subtle border border-[var(--border-default)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card">
          <DataTable
            columns={columns}
            data={data?.messages ?? []}
            isLoading={isLoading}
            emptyMessage="پیامی یافت نشد"
            onRowClick={(row) => handleViewLead(row)}
          />
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={Math.ceil((data?.total ?? 0) / PAGE_SIZE)}
          onPageChange={setPage}
        />
      </div>

      {/* Detail Modal */}
      <Modal
        open={selectedLead !== null}
        onClose={() => setSelectedLead(null)}
        title={selectedLead?.subject ?? "جزئیات پیام"}
      >
        {selectedLead && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center">
                <User size={18} className="text-brand" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {selectedLead.name}
                </p>
                <p className="text-xs text-[var(--text-muted)] dir-ltr">
                  {selectedLead.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Calendar size={14} />
              <span>{formatDate(selectedLead.createdAt)}</span>
              {!selectedLead.read ? (
                <Badge variant="warning">خوانده نشده</Badge>
              ) : (
                <Badge variant="default">خوانده شده</Badge>
              )}
            </div>

            {selectedLead.subject && (
              <div className="p-3 rounded-lg bg-subtle">
                <p className="text-xs text-[var(--text-muted)] mb-1">موضوع</p>
                <p className="text-sm text-[var(--text-primary)] font-medium">
                  {selectedLead.subject}
                </p>
              </div>
            )}

            <div className="p-3 rounded-lg bg-subtle">
              <p className="text-xs text-[var(--text-muted)] mb-1">متن پیام</p>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                {selectedLead.message}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Mail size={14} />
              <span className="dir-ltr">{selectedLead.email}</span>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
