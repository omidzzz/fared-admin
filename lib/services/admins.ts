import { apiClient } from "@/lib/api/client";
import type { AdminUser } from "@/lib/types";

type AdminsResponse = { success: boolean; data: { users: AdminUser[] } };
type AdminResponse = { success: boolean; data: { user: AdminUser } };

export async function getAdmins(): Promise<AdminUser[]> {
  const res = await apiClient.get<AdminsResponse>(
    "/api/admin/users?role=ADMIN"
  );
  return res.data.users;
}

export async function createAdmin(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<AdminUser> {
  const res = await apiClient.post<AdminResponse>("/api/admin/users", data);
  return res.data.user;
}

export async function updateAdminRole(
  id: string,
  role: string
): Promise<AdminUser> {
  const res = await apiClient.put<AdminResponse>(
    `/api/admin/users/${id}`,
    { role }
  );
  return res.data.user;
}

export async function deleteAdmin(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/users/${id}`);
}
