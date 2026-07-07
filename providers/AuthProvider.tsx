"use client";

import { createContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { AdminUser } from "@/lib/types";
import { loginAdmin, logoutAdmin, getCurrentAdmin } from "@/lib/services/auth";

export interface AuthContextValue {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentAdmin()
      .then((admin) => setUser(admin))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const admin = await loginAdmin({ email, password });
    setUser(admin);
  }, []);

  const logout = useCallback(async () => {
    await logoutAdmin();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
