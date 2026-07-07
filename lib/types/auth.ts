export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "STAFF";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: "active" | "inactive";
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthSession {
  user: AdminUser;
  token: string;
}
