import type { ComponentProps } from "react";
import type { IconType } from "react-icons";

export const fieldLabelClassName = "mb-2 block text-sm font-semibold text-(--gray)";

export function IconInput({ icon: Icon, ...props }: Omit<ComponentProps<"input">, "className"> & { icon: IconType }) {
  return (
    <div className="group relative">
      <Icon
        aria-hidden="true"
        size={18}
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-(--blue-light) transition-colors group-focus-within:text-(--blue-soft) group-has-disabled:text-(--gray) group-has-disabled:opacity-60"
      />
      <input
        {...props}
        className="w-full rounded-xl border border-(--line-strong) bg-(--navy) py-3 pr-4 pl-11 text-(--white) outline-hidden transition-colors hover:border-(--gray) focus:border-(--blue-light) focus-visible:ring-2 focus-visible:ring-(--blue-light) disabled:cursor-not-allowed disabled:border-(--line) disabled:bg-(--surface) disabled:text-(--gray) aria-invalid:border-(--danger) aria-invalid:focus:border-(--danger) aria-invalid:focus-visible:ring-(--danger)"
      />
    </div>
  );
}
