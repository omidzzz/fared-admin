"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export function SidebarItem({ href, label, icon: Icon, onClick }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 min-h-11 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
        isActive
          ? "bg-brand/10 text-brand"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}
