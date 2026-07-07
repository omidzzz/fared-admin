"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, Bell, ChevronDown, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { AdminRole } from "@/lib/types";

const ROLE_LABEL: Record<AdminRole, string> = {
  SUPER_ADMIN: "سوپر ادمین",
  ADMIN: "ادمین",
  STAFF: "کارمند",
};

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "داشبورد",
  "/products": "محصولات",
  "/orders": "سفارشات",
  "/customers": "مشتریان",
  "/tours": "تورها",
  "/courses": "دوره‌ها",
  "/mentorship": "منتورشیپ",
  "/leads": "لیدها",
  "/media": "کتابخانه رسانه",
  "/cms": "مدیریت محتوا",
  "/settings": "تنظیمات",
  "/admins": "ادمین‌ها",
};

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pageTitle = PAGE_TITLES[pathname] ?? "";

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-[var(--border-default)] flex items-center justify-between px-4 md:px-6">
      {/* Right side (RTL) — hamburger + page title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-subtle transition-colors flex-shrink-0"
          aria-label="منو"
        >
          <Menu size={22} />
        </button>
        {pageTitle && (
          <h1 className="text-base md:text-lg font-semibold text-[var(--text-primary)] truncate">
            {pageTitle}
          </h1>
        )}
      </div>

      {/* Left side (RTL) — notifications + user */}
      <div className="flex items-center gap-1">
        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:bg-subtle transition-colors"
          aria-label="اعلان‌ها"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* Vertical divider */}
        <div className="w-px h-6 bg-[var(--border-default)] mx-2 hidden sm:block" />

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-subtle transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center">
              <span className="text-sm font-semibold text-brand">
                {user?.name?.charAt(0) ?? "؟"}
              </span>
            </div>
            <span className="hidden md:block text-sm font-medium text-[var(--text-primary)]">
              {user?.name ?? "ناشناس"}
            </span>
            <ChevronDown size={16} className="hidden md:block text-[var(--text-muted)]" />
          </button>

          {dropdownOpen && (
            <div className="absolute end-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-[var(--border-default)] py-1 z-50">
              <div className="px-4 py-3 border-b border-[var(--border-default)]">
                <p className="text-sm font-medium text-[var(--text-primary)]">{user?.name}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {user ? ROLE_LABEL[user.role] : ""}
                </p>
              </div>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-subtle transition-colors"
                disabled
              >
                <User size={18} />
                <span>پروفایل</span>
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                <span>خروج</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
