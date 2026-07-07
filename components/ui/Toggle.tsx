"use client";

import { Switch } from "@/components/ui/switch-shad";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer">
      <Switch
        checked={checked}
        onCheckedChange={(checked: boolean) => onChange(checked)}
        disabled={disabled}
      />
      {label && (
        <span className="text-sm font-medium text-[var(--text-primary)] select-none">
          {label}
        </span>
      )}
    </label>
  );
}
