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
            "flex w-full items-center gap-2.5 rounded-xl bg-(--white) px-4 py-3 text-sm font-semibold text-(--navy-deep) shadow-[0_8px_24px_color-mix(in_srgb,var(--black)_45%,transparent)]",
          icon: "shrink-0",
          success: "[&_svg]:text-(--success)",
          error: "[&_svg]:text-(--danger)",
          warning: "[&_svg]:text-(--danger)",
        },
      }}
    />
  );
}
