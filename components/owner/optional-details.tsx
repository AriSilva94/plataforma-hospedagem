"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { LuChevronDown } from "react-icons/lu";

export function OptionalDetails({
  title,
  description,
  tag = "opcional",
  defaultOpen = false,
  forceOpen = false,
  children,
}: {
  title: string;
  description: string;
  tag?: string;
  defaultOpen?: boolean;
  forceOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function revealHashTarget() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target || !detailsRef.current?.contains(target)) return;
      setOpen(true);
      requestAnimationFrame(() => {
        target.scrollIntoView({ block: "center" });
        const field = target.matches("input, textarea, select") ? target : target.querySelector<HTMLElement>("input, textarea, select");
        field?.focus({ preventScroll: true });
      });
    }
    revealHashTarget();
    window.addEventListener("hashchange", revealHashTarget);
    return () => window.removeEventListener("hashchange", revealHashTarget);
  }, []);

  return (
    <details
      ref={detailsRef}
      suppressHydrationWarning
      open={open || forceOpen}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group rounded-2xl border border-(--line-strong) bg-(--surface)"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl p-4 font-bold sm:p-5 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light) [&::-webkit-details-marker]:hidden">
        <span>
          {title} <span className="font-normal text-(--gray)">({tag})</span>
          <span className="mt-1 block text-sm font-normal text-(--gray)">{description}</span>
        </span>
        <LuChevronDown aria-hidden="true" size={20} className="shrink-0 text-(--gray) transition-transform group-open:rotate-180" />
      </summary>
      <div className="flex flex-col gap-5 border-t border-(--line) p-4 sm:p-5">{children}</div>
    </details>
  );
}
