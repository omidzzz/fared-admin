"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getOrders } from "@/lib/services/orders";
import type { Order } from "@/lib/types";

const PAGE_SIZE = 10;

const STATUS_TABS = [
  { label: "همه", value: "" },
  { label: "در انتظار", value: "PENDING" },
  { label: "تایید شده", value: "CONFIRMED" },
  { label: "ارسال شده", value: "SHIPPED" },
  { label: "تحویل داده شده", value: "DELIVERED" },
  { label: "لغو شده", value: "CANCELLED" },
];

export default function OrdersPage() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["orders", page, status, search],
    queryFn: () =>
      getOrders({
        page,
        limit: PAGE_SIZE,
        status: status || undefined,
        search: search || undefined,
      }),
  });

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  const formatPrice = (price: number) =>
    price.toLocaleString("fa-IR") + " تومان";

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fa-IR");

  const columns: Column<Order>[] = [
    {
      key: "id",
      label: "شماره سفارش",
      render: (value) => {
        const id = String(value ?? "");
        return (
          <span className="font-medium text-brand">
            {id.slice(0, 8)}
          </span>
        );
      },
    },
    {
      key: "customer",
      label: "مشتری",
      render: (value) => {
        const customer = value as Order["customer"] | undefined;
        return customer?.name ?? "—";
      },
    },
    {
      key: "totalPrice",
      label: "مبلغ",
      render: (value) => formatPrice(value as number),
    },
    {
      key: "status",
      label: "وضعیت",
      render: (value) => <StatusBadge status={String(value ?? "")} />,
    },
    {
      key: "createdAt",
      label: "تاریخ",
      render: (value) => formatDate(String(value ?? "")),
    },
    {
      key: "actions",
      label: "جزئیات",
      render: (_value, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/orders/${row.id}`);
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
        <PageHeader
          title="سفارشات"
          description="مدیریت سفارشات فروشگاه"
        />

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-1 mb-4">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === tab.value
                  ? "bg-brand text-white"
                  : "bg-white text-[var(--text-secondary)] hover:bg-subtle border border-[var(--border-default)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="جستجوی سفارش (شماره یا نام مشتری)..."
            className="sm:w-72"
          />
        </div>

        {/* Table */}
        <div className="card">
          <DataTable
            columns={columns}
            data={data?.orders ?? []}
            isLoading={isLoading}
            emptyMessage="سفارشی یافت نشد"
            onRowClick={(row) => router.push(`/orders/${row.id}`)}
          />
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </AdminLayout>
  );
}
