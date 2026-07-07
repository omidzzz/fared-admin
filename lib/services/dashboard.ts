import { getOrders } from "./orders";
import { getLeads, type Message } from "./leads";
import type { Order } from "@/lib/types";

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  activeProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  productsChange: number;
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function getDashboardStats(): Promise<DashboardStats> {
  await delay(300);
  return {
    totalRevenue: 48750000,
    totalOrders: 142,
    totalCustomers: 89,
    activeProducts: 34,
    revenueChange: 14.2,
    ordersChange: 8.7,
    customersChange: 5.1,
    productsChange: 2.9,
  };
}

export async function getRecentOrders(): Promise<Order[]> {
  const result = await getOrders({ page: 1, limit: 10 });
  return result.orders;
}

export async function getRecentLeads(): Promise<Message[]> {
  const result = await getLeads({ page: 1, limit: 5 });
  return result.messages;
}
