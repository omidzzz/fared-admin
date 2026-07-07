"use client";

import {
  Sparkles,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MapPin,
  BookOpen,
  UserCheck,
  MessageSquare,
  Image,
  FileText,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { useAuth } from "@/hooks/useAuth";
import type { AdminRole } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "داشبورد", icon: LayoutDashboard },
  { href: "/products", label: "محصولات", icon: Package },
  { href: "/orders", label: "سفارشات", icon: ShoppingCart },
  { href: "/customers", label: "مشتریان", icon: Users },
  { href: "/tours", label: "تورها", icon: MapPin },
  { href: "/courses", label: "دوره‌ها", icon: BookOpen },
  { href: "/mentorship", label: "منتورشیپ", icon: UserCheck },
  { href: "/leads", label: "لیدها", icon: MessageSquare },
];

const MANAGEMENT_ITEMS = [
  { href: "/media", label: "کتابخانه رسانه", icon: Image },
  { href: "/cms", label: "مدیریت محتوا", icon: FileText },
  { href: "/settings", label: "تنظیمات", icon: Settings },
  { href: "/admins", label: "ادمین‌ها", icon: Shield },
];

const ROLE_LABEL: Record<AdminRole, string> = {
  SUPER_ADMIN: "سوپر ادمین",
  ADMIN: "ادمین",
  STAFF: "کارمند",
};

interface SidebarProps {
  onNavClick?: () => void;
}

export function Sidebar({ onNavClick }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <aside className="flex flex-col h-full bg-white border-e border-[var(--border-default)]">
      {/* Logo area — fixed h-16 to align with topbar */}
      <div className="h-16 flex items-center px-5 border-b border-[var(--border-default)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-brand leading-tight">
              اورا میستیک
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] leading-tight">
              پنل مدیریت
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            onClick={onNavClick}
          />
        ))}

        {/* Section divider */}
        <div className="mx-2 my-3 border-t border-[var(--border-default)]" />

        {MANAGEMENT_ITEMS.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="flex-shrink-0 p-3 border-t border-[var(--border-default)]">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-brand">
              {user?.name?.charAt(0) ?? "؟"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {user?.name ?? "ناشناس"}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {user ? ROLE_LABEL[user.role] : ""}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full min-h-11 rounded-lg px-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut size={18} />
          <span>خروج</span>
        </button>
      </div>
    </aside>
  );
}
