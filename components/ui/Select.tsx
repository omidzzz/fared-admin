"use client";

import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-shad";

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  disabled?: boolean;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "انتخاب کنید...",
  disabled = false,
}: SelectProps) {
  return (
    <SelectRoot
      value={value}
      onValueChange={(newValue: string | null) => {
        if (newValue !== null) onChange(newValue);
      }}
      disabled={disabled}
    >
      <SelectTrigger className="w-full text-right min-h-11">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent align="start">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}
