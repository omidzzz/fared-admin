"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  User,
  Mail,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Toast } from "@/components/ui/Toast";
import { getOrderById, updateOrderStatus } from "@/lib/services/orders";

const STATUS_OPTIONS = [
  { label: "در انتظار", value: "PENDING" },
  { label: "تایید شده", value: "CONFIRMED" },
  { label: "ارسال شده", value: "SHIPPED" },
  { label: "تحویل داده شده", value: "DELIVERED" },
  { label: "لغو شده", value: "CANCELLED" },
];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [newStatus, setNewStatus] = useState("");

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      Toast.success("وضعیت سفارش با موفقیت بروزرسانی شد");
      setNewStatus("");
    },
    onError: (err) => {
      Toast.error(err instanceof Error ? err.message : "خطا در بروزرسانی وضعیت");
    },
  });

  const formatPrice = (price: number) =>
    price.toLocaleString("fa-IR") + " تومان";

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fa-IR");

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="page-container text-center py-16">
          <p className="text-lg text-[var(--text-secondary)]">
            سفارش یافت نشد
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="page-container">
        <PageHeader
          title={`جزئیات سفارش ${order.orderNumber ?? order.id?.slice(0, 8)}`}
          breadcrumbs={[
            { label: "سفارشات", href: "/orders" },
            { label: order.orderNumber ?? order.id?.slice(0, 8) ?? "" },
          ]}
          actions={
            <Button
              variant="secondary"
              onClick={() => router.push("/orders")}
            >
              <ArrowRight size={18} />
              بازگشت
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order items table */}
            <div className="card">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
                آیتم‌های سفارش
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead>
                    <tr className="border-b border-[var(--border-default)] bg-subtle">
                      <th className="px-3 py-2 font-medium text-[var(--text-secondary)]">
                        تصویر
                      </th>
                      <th className="px-3 py-2 font-medium text-[var(--text-secondary)]">
                        نام محصول
                      </th>
                      <th className="px-3 py-2 font-medium text-[var(--text-secondary)]">
                        تعداد
                      </th>
                      <th className="px-3 py-2 font-medium text-[var(--text-secondary)]">
                        قیمت واحد
                      </th>
                      <th className="px-3 py-2 font-medium text-[var(--text-secondary)]">
                        جمع
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, index) => (
                      <tr
                        key={item.productId ?? index}
                        className="border-b border-[var(--border-default)]"
                      >
                        <td className="px-3 py-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.nameFa ?? ""}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-subtle" />
                          )}
                        </td>
                        <td className="px-3 py-3 text-[var(--text-primary)] font-medium">
                          {item.nameFa ?? "—"}
                        </td>
                        <td className="px-3 py-3 text-[var(--text-primary)]">
                          {(item.quantity ?? 0).toLocaleString("fa-IR")}
                        </td>
                        <td className="px-3 py-3 text-[var(--text-secondary)]">
                          {formatPrice(item.price ?? 0)}
                        </td>
                        <td className="px-3 py-3 text-[var(--text-primary)] font-medium">
                          {formatPrice((item.price ?? 0) * (item.quantity ?? 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="flex justify-end mt-4 pt-4 border-t border-[var(--border-default)]">
                <div className="text-left">
                  <p className="text-sm text-[var(--text-secondary)]">جمع کل</p>
                  <p className="text-xl font-bold text-[var(--text-primary)]">
                    {formatPrice(order.totalPrice ?? 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping address */}
            {order.shippingAddress && (
              <div className="card">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                  آدرس ارسال
                </h3>
                <div className="space-y-1 text-sm text-[var(--text-primary)]">
                  <p>{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.phone}</p>
                  <p>
                    {[
                      order.shippingAddress.province,
                      order.shippingAddress.city,
                      order.shippingAddress.street,
                    ]
                      .filter(Boolean)
                      .join("، ")}
                  </p>
                  {order.shippingAddress.postalCode && (
                    <p className="text-[var(--text-muted)]">
                      کد پستی: {order.shippingAddress.postalCode}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="card">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                  یادداشت
                </h3>
                <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">
                  {order.notes}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Customer info */}
            <div className="card space-y-3">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                اطلاعات مشتری
              </h3>

              <div className="flex items-center gap-3">
                <User size={16} className="text-[var(--text-muted)]" />
                <span className="text-sm text-[var(--text-primary)]">
                  {order.customer?.name ?? "—"}
                </span>
              </div>

              {order.customer?.email && (
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-primary)] dir-ltr">
                    {order.customer.email}
                  </span>
                </div>
              )}

              {order.customer?.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-primary)] dir-ltr">
                    {order.customer.phone}
                  </span>
                </div>
              )}
            </div>

            {/* Order info */}
            <div className="card space-y-3">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                اطلاعات سفارش
              </h3>

              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-[var(--text-muted)]" />
                <span className="text-sm text-[var(--text-primary)]">
                  {formatDate(order.createdAt ?? "")}
                </span>
              </div>

              {order.paymentMethod && (
                <div className="flex items-center gap-3">
                  <CreditCard size={16} className="text-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-primary)]">
                    {order.paymentMethod}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-[var(--text-muted)]" />
                <span className="text-sm text-[var(--text-primary)]">
                  {order.shippingAddress?.city ?? "—"}
                </span>
              </div>
            </div>

            {/* Status update */}
            <div className="card space-y-4">
              <h3 className="text-sm font-medium text-[var(--text-secondary)]">
                وضعیت فعلی
              </h3>
              <StatusBadge status={order.status ?? ""} />

              <div className="border-t border-[var(--border-default)] pt-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                  تغییر وضعیت
                </h3>
                <Select
                  value={newStatus}
                  onChange={setNewStatus}
                  options={STATUS_OPTIONS.filter(
                    (opt) => opt.value !== (order.status ?? "").toUpperCase()
                  )}
                  placeholder="انتخاب وضعیت جدید"
                />
                <Button
                  className="w-full mt-3"
                  disabled={!newStatus}
                  loading={statusMutation.isPending}
                  onClick={() => newStatus && statusMutation.mutate(newStatus)}
                >
                  بروزرسانی وضعیت
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
