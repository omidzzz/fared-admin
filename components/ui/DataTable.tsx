"use client";

import type { ReactNode } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";
import { Inbox } from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: unknown, row: T) => ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "داده‌ای یافت نشد",
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title={emptyMessage}
        description="اطلاعات بیشتری برای نمایش وجود ندارد"
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-right">
        <thead>
          <tr className="border-b border-[var(--border-default)] bg-subtle">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-4 py-3 font-medium text-[var(--text-secondary)] whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={(row.id as string) ?? rowIndex}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-[var(--border-default)] hover:bg-subtle/50 transition-colors ${
                onRowClick ? "cursor-pointer" : ""
              }`}
            >
              {columns.map((col) => {
                const rawValue = (row as Record<string, unknown>)[String(col.key)];
                return (
                  <td
                    key={String(col.key)}
                    className="px-4 py-3 text-[var(--text-primary)] whitespace-nowrap"
                  >
                    {col.render ? col.render(rawValue, row) : String(rawValue ?? "")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
