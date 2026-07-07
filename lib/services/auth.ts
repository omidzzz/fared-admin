import { apiClient } from "@/lib/api/client";
import type { AdminUser } from "@/lib/types";

type LoginInput = { email: string; password: string };

// Backend returns: { success: true, data: { accessToken, refreshToken, user } }
type LoginResponse = {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      phone: string | null;
      role: string;
      nameFA: string | null;
      email: string;
    };
  };
};

// Backend /me returns: { success: true, data: user }
type MeResponse = {
  success: boolean;
  data: {
    id: string;
    nameFA: string | null;
    name: string | null;
    phone: string | null;
    email: string | null;
    avatar: string | null;
    role: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

function mapUserToAdminUser(user: LoginResponse["data"]["user"] | MeResponse["data"]): AdminUser {
  return {
    id: user.id,
    name: user.nameFA || (user as MeResponse["data"]).name || "Admin",
    email: user.email || "",
    role: (user.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : user.role === "ADMIN" ? "ADMIN" : "STAFF") as AdminUser["role"],
    status: (user as MeResponse["data"]).isActive ? "active" : "inactive",
    createdAt: (user as MeResponse["data"]).createdAt || new Date().toISOString(),
  };
}

// Set auth token in both localStorage and cookie
function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth-token", token);
    // Also set cookie for middleware
    document.cookie = `auth-token=${token}; path=/; max-age=1296000`; // 15 days
  }
}

function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth-token");
  }
  return null;
}

function clearAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth-token");
    document.cookie = "auth-token=; path=/; max-age=0";
  }
}

export async function loginAdmin(input: LoginInput): Promise<AdminUser> {
  const res = await apiClient.post<LoginResponse>("/api/auth/login", input);
  // Store the access token for subsequent requests
  setAuthToken(res.data.accessToken);
  return mapUserToAdminUser(res.data.user);
}

export async function logoutAdmin(): Promise<void> {
  const token = getAuthToken();
  if (token) {
    try {
      await apiClient.post("/api/auth/logout", { refreshToken: token });
    } catch {
      // Ignore errors on logout
    }
  }
  clearAuthToken();
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const token = getAuthToken();
  if (!token) {
    return null;
  }
  try {
    const res = await apiClient.get<MeResponse>("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return mapUserToAdminUser(res.data);
  } catch {
    clearAuthToken();
    return null;
  }
}
