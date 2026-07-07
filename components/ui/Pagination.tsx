"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [1];

    if (page > 3) {
      pages.push("ellipsis");
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push("ellipsis");
    }

    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      {/* Previous button — in RTL, left arrow = forward, right arrow = back */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex items-center justify-center min-h-10 min-w-10 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-subtle text-[var(--text-secondary)]"
        aria-label="صفحه قبل"
      >
        <ChevronRight size={18} />
      </button>

      {pageNumbers.map((p, index) =>
        p === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex items-center justify-center min-h-10 min-w-10 text-sm text-[var(--text-muted)]"
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`inline-flex items-center justify-center min-h-10 min-w-10 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? "bg-brand text-white"
                : "hover:bg-subtle text-[var(--text-secondary)]"
            }`}
          >
            {p.toLocaleString("fa-IR")}
          </button>
        )
      )}

      {/* Next button — in RTL, left arrow = forward */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="inline-flex items-center justify-center min-h-10 min-w-10 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-subtle text-[var(--text-secondary)]"
        aria-label="صفحه بعد"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Page info */}
      <span className="mr-2 text-xs text-[var(--text-muted)]">
        صفحه {page.toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")}
      </span>
    </div>
  );
}
