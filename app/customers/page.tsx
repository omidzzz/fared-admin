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
import { getCustomers } from "@/lib/services/customers";
import type { Customer } from "@/lib/types";

const PAGE_SIZE = 10;

export default function CustomersPage() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["customers", page, search],
    queryFn: () =>
      getCustomers({ page, limit: PAGE_SIZE, search: search || undefined }),
  });

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fa-IR");

  const columns: Column<Customer>[] = [
    {
      key: "name",
      label: "نام",
    },
    {
      key: "email",
      label: "ایمیل",
    },
    {
      key: "phone",
      label: "تلفن",
      render: (value) => String(value ?? "—"),
    },
    {
      key: "totalOrders",
      label: "تعداد سفارشات",
      render: (value) => (value as number)?.toLocaleString("fa-IR") ?? "۰",
    },
    {
      key: "createdAt",
      label: "تاریخ عضویت",
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
            router.push(`/customers/${row.id}`);
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
        <PageHeader title="مشتریان" description="مدیریت مشتریان فروشگاه" />

        <div className="mb-6">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="جستجوی مشتری..."
            className="sm:w-72"
          />
        </div>

        <div className="card">
          <DataTable
            columns={columns}
            data={data?.users ?? []}
            isLoading={isLoading}
            emptyMessage="مشتری‌ای یافت نشد"
            onRowClick={(row) => router.push(`/customers/${row.id}`)}
          />
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </AdminLayout>
  );
}
