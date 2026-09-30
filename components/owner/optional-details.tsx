"use client";

import { useState, type ReactNode } from "react";
import { LuChevronDown } from "react-icons/lu";

export function OptionalDetails({
  title,
  description,
  defaultOpen = false,
  forceOpen = false,
  children,
}: {
  title: string;
  description: string;
  defaultOpen?: boolean;
  forceOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      open={open || forceOpen}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group rounded-2xl border border-(--line-strong) bg-(--surface)"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl p-5 font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light) [&::-webkit-details-marker]:hidden">
        <span>
          {title} <span className="font-normal text-(--gray)">(opcional)</span>
          <span className="mt-1 block text-sm font-normal text-(--gray)">{description}</span>
        </span>
        <LuChevronDown aria-hidden="true" size={20} className="shrink-0 text-(--gray) transition-transform group-open:rotate-180" />
      </summary>
      <div className="flex flex-col gap-6 border-t border-(--line) p-5">{children}</div>
    </details>
  );
}
