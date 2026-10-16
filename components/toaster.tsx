"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      offset={{ top: "5.5rem", right: "1rem" }}
      visibleToasts={3}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-center gap-2.5 rounded-xl border border-(--border) bg-(--surface-raised) px-4 py-3 text-sm font-semibold text-(--text-primary) shadow-[0_8px_24px_color-mix(in_srgb,var(--shadow)_45%,transparent)]",
          icon: "shrink-0",
          success: "[&_svg]:text-(--success)",
          error: "[&_svg]:text-(--error)",
          warning: "[&_svg]:text-(--warning)",
        },
      }}
    />
  );
}
