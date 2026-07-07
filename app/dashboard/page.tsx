"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  ArrowLeft,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { KPICard } from "@/components/ui/KPICard";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getDashboardStats, getRecentOrders, getRecentLeads } from "@/lib/services/dashboard";
import type { OrderStatus } from "@/lib/types";

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "در انتظار",
  paid: "پرداخت شده",
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  completed: "تکمیل شده",
  cancelled: "لغو شده",
  refunded: "مسترد شده",
};

const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "warning",
  paid: "info",
  processing: "info",
  shipped: "info",
  completed: "success",
  cancelled: "danger",
  refunded: "default",
};


export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["dashboard-recent-orders"],
    queryFn: getRecentOrders,
  });

  const { data: recentLeads, isLoading: leadsLoading } = useQuery({
    queryKey: ["dashboard-recent-leads"],
    queryFn: getRecentLeads,
  });

  const formatPrice = (price: number) => {
    return price.toLocaleString("fa-IR") + " تومان";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fa-IR");
  };

  return (
    <AdminLayout>
      <div className="page-container">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
            داشبورد
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            خلاصه عملکرد فروشگاه
          </p>
        </div>

        {/* KPI Cards */}
        {statsLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              title="درآمد کل"
              value={formatPrice(stats.totalRevenue)}
              change={stats.revenueChange}
              icon={TrendingUp}
              iconBgColor="bg-green-100"
              iconTextColor="text-green-600"
            />
            <KPICard
              title="تعداد سفارشات"
              value={stats.totalOrders.toLocaleString("fa-IR")}
              change={stats.ordersChange}
              icon={ShoppingCart}
              iconBgColor="bg-blue-100"
              iconTextColor="text-blue-600"
            />
            <KPICard
              title="تعداد مشتریان"
              value={stats.totalCustomers.toLocaleString("fa-IR")}
              change={stats.customersChange}
              icon={Users}
              iconBgColor="bg-purple-100"
              iconTextColor="text-purple-600"
            />
            <KPICard
              title="محصولات فعال"
              value={stats.activeProducts.toLocaleString("fa-IR")}
              change={stats.productsChange}
              icon={Package}
              iconBgColor="bg-orange-100"
              iconTextColor="text-orange-600"
            />
          </div>
        ) : null}

        {/* Recent Orders */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              سفارشات اخیر
            </h2>
            <Link
              href="/orders"
              className="flex items-center gap-1 text-sm text-brand hover:text-brand-hover transition-colors"
            >
              مشاهده همه
              <ArrowLeft size={16} />
            </Link>
          </div>

          <div className="card overflow-hidden">
            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead>
                    <tr className="border-b border-[var(--border-default)] bg-subtle">
                      <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">
                        شماره سفارش
                      </th>
                      <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">
                        مشتری
                      </th>
                      <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">
                        مبلغ
                      </th>
                      <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">
                        وضعیت
                      </th>
                      <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">
                        تاریخ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-[var(--border-default)] hover:bg-subtle/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-brand">
                          {order.orderNumber}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-primary)]">
                          {order.customer.name}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-primary)]">
                          {formatPrice(order.totalPrice)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={ORDER_STATUS_COLOR[order.status] as "success" | "warning" | "danger" | "info" | "default"}>
                            {ORDER_STATUS_LABEL[order.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-[var(--text-muted)] text-sm">
                سفارشی یافت نشد
              </div>
            )}
          </div>
        </div>

        {/* Recent Leads */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              لیدهای اخیر
            </h2>
            <Link
              href="/leads"
              className="flex items-center gap-1 text-sm text-brand hover:text-brand-hover transition-colors"
            >
              مشاهده همه
              <ArrowLeft size={16} />
            </Link>
          </div>

          <div className="card overflow-hidden">
            {leadsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : recentLeads && recentLeads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead>
                    <tr className="border-b border-[var(--border-default)] bg-subtle">
                      <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">
                        نام
                      </th>
                      <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">
                        ایمیل
                      </th>
                      <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">
                        موضوع
                      </th>
                      <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">
                        وضعیت
                      </th>
                      <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">
                        تاریخ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-[var(--border-default)] hover:bg-subtle/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-[var(--text-primary)] font-medium">
                          {lead.name}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)] dir-ltr">
                          {lead.email}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">
                          {lead.subject ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={lead.read ? "default" : "warning"}>
                            {lead.read ? "خوانده شده" : "خوانده نشده"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">
                          {formatDate(lead.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-[var(--text-muted)] text-sm">
                لیدی یافت نشد
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
