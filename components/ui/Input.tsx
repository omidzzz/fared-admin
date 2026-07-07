"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, className = "", id, ...props },
  ref
) {
  const inputId = id || label;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={`form-input ${error ? "border-red-500 focus:ring-red-300 focus:border-red-500" : ""} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-[var(--text-muted)]">{helperText}</p>
      )}
    </div>
  );
});
