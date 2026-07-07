import { apiClient } from "@/lib/api/client";
import type { Customer } from "@/lib/types";

type UsersResponse = {
  success: boolean;
  data: {
    users: Customer[];
    total: number;
    page: number;
    limit: number;
  };
};

type UserResponse = { success: boolean; data: { user: Customer } };

type GetCustomersParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getCustomers(
  params: GetCustomersParams = {}
): Promise<{ users: Customer[]; total: number }> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);

  const res = await apiClient.get<UsersResponse>(
    `/api/admin/users?${query}`
  );
  return { users: res.data.users, total: res.data.total };
}

export async function getCustomerById(id: string): Promise<Customer> {
  const res = await apiClient.get<UserResponse>(`/api/admin/users/${id}`);
  return res.data.user;
}
