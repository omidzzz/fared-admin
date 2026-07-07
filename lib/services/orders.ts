import { apiClient } from "@/lib/api/client";
import type { Order } from "@/lib/types";

type OrdersResponse = {
  success: boolean;
  data: {
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  };
};

type OrderResponse = { success: boolean; data: { order: Order } };

type GetOrdersParams = {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
};

export async function getOrders(
  params: GetOrdersParams = {}
): Promise<{ orders: Order[]; total: number }> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);

  const res = await apiClient.get<OrdersResponse>(
    `/api/admin/orders?${query}`
  );
  return { orders: res.data.orders, total: res.data.total };
}

export async function getOrderById(id: string): Promise<Order> {
  const res = await apiClient.get<OrderResponse>(`/api/admin/orders/${id}`);
  return res.data.order;
}

export async function updateOrderStatus(
  id: string,
  status: string
): Promise<Order> {
  const res = await apiClient.put<OrderResponse>(
    `/api/admin/orders/${id}`,
    { status }
  );
  return res.data.order;
}
