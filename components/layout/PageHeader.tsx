import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: Breadcrumb[];
}

export function PageHeader({ title, description, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-[var(--text-muted)] mb-2">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronLeft size={14} className="rtl:rotate-180" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-brand transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[var(--text-secondary)]">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}
