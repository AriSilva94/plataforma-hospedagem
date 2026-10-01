import type { ReactNode } from "react";

export function Switch({
  checked,
  disabled,
  onChange,
  children,
  className = "",
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`flex min-h-11 cursor-pointer items-center justify-between gap-4 has-disabled:cursor-not-allowed has-disabled:opacity-60 has-focus-visible:ring-2 has-focus-visible:ring-(--blue-light) ${className}`}
    >
      <span className="min-w-0">{children}</span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="relative h-6 w-11 shrink-0 rounded-full bg-(--surface-raised) ring-1 ring-(--line-strong) transition-colors peer-checked:bg-(--blue) after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"
      />
    </label>
  );
}
