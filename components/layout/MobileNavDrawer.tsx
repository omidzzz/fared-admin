"use client";

import { Sidebar } from "./Sidebar";

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 md:hidden"
        onClick={onClose}
      />
      {/* Panel — slides in from right */}
      <div
        className={`fixed right-0 top-0 h-full w-72 bg-white z-50 md:hidden shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <Sidebar onNavClick={onClose} />
      </div>
    </>
  );
}
