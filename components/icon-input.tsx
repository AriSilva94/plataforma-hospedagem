import type { ComponentProps } from "react";
import type { IconType } from "react-icons";

export const fieldLabelClassName = "mb-2 block text-sm font-semibold text-(--text-secondary)";

export function IconInput({ icon: Icon, compact = false, ...props }: Omit<ComponentProps<"input">, "className"> & { icon: IconType; compact?: boolean }) {
  return (
    <div className="group relative">
      <Icon
        aria-hidden="true"
        size={18}
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-(--primary-text) transition-colors group-focus-within:text-(--primary-text) group-has-disabled:text-(--text-secondary) group-has-disabled:opacity-60"
      />
      <input
        {...props}
        className={`w-full rounded-xl border border-(--border) bg-(--background) ${compact ? "py-2.25" : "py-3"} pr-4 pl-11 text-(--text-primary) outline-hidden transition-colors placeholder:text-(--text-secondary) hover:border-(--text-secondary) focus:border-(--primary) focus-visible:ring-2 focus-visible:ring-(--focus-ring) disabled:cursor-not-allowed disabled:border-(--border) disabled:bg-(--surface) disabled:text-(--text-secondary) aria-invalid:border-(--error) aria-invalid:focus:border-(--error) aria-invalid:focus-visible:ring-(--error)`}
      />
    </div>
  );
}
