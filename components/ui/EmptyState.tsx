import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="mb-4 text-[var(--text-muted)]">
          <Icon size={48} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-md">{description}</p>
      )}
      {action}
    </div>
  );
}
