"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-[var(--text-muted)] hover:bg-subtle transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border-default)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
