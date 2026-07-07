"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNavDrawer } from "./MobileNavDrawer";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not authenticated → redirect
  if (!user) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Desktop Sidebar — fixed on the right edge, above everything */}
      <aside className="hidden md:block fixed right-0 top-0 h-full w-64 z-40">
        <Sidebar />
      </aside>

      {/* Main content area — pushed left of the sidebar via margin-right */}
      <div className="min-h-screen flex flex-col md:mr-64">
        {/* Topbar — sticky, spans the main content area */}
        <Topbar onMenuClick={() => setMobileDrawerOpen(true)} />

        {/* Page content — scrollable */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      <MobileNavDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />
    </div>
  );
}
