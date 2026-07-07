"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getCustomerById } from "@/lib/services/customers";

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomerById(id),
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fa-IR");

  const formatPrice = (price: number) =>
    price.toLocaleString("fa-IR") + " تومان";

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (!customer) {
    return (
      <AdminLayout>
        <div className="page-container text-center py-16">
          <p className="text-lg text-[var(--text-secondary)]">
            مشتری یافت نشد
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader
          title={customer.name ?? "مشتری"}
          breadcrumbs={[
            { label: "مشتریان", href: "/customers" },
            { label: customer.name ?? "" },
          ]}
          actions={
            <Button
              variant="secondary"
              onClick={() => router.push("/customers")}
            >
              <ArrowRight size={18} />
              بازگشت
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
                اطلاعات تماس
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User size={18} className="text-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-primary)] font-medium">
                    {customer.name ?? "—"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-primary)] dir-ltr">
                    {customer.email ?? "—"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-primary)] dir-ltr">
                    {customer.phone ?? "—"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-primary)]">
                    تاریخ عضویت: {formatDate(customer.createdAt ?? "")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar stats */}
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ShoppingBag size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">
                    تعداد سفارشات
                  </p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">
                    {(customer.totalOrders ?? 0).toLocaleString("fa-IR")}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Wallet size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">
                    ارزش کل خرید
                  </p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">
                    {formatPrice(customer.lifetimeValue ?? 0)}
                  </p>
                </div>
              </div>
            </div>

            {customer.lastOrderAt && (
              <div className="card">
                <p className="text-xs text-[var(--text-muted)]">
                  آخرین سفارش
                </p>
                <p className="text-sm text-[var(--text-primary)] mt-1">
                  {formatDate(customer.lastOrderAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
