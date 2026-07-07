import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}

export function FormField({ label, error, required = false, children, hint }: FormFieldProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
        {label}
        {required && <span className="text-red-500 mr-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-[var(--text-muted)]">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
