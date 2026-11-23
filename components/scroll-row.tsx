"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const maskClassNames = {
  none: "",
  start: "mask-l-from-85%",
  end: "mask-r-from-85%",
  both: "mask-l-from-85% mask-r-from-85%",
} as const;

export function ScrollRow({ className, children }: { className: string; children: ReactNode }) {
  const rowRef = useRef<HTMLUListElement>(null);
  const [overflow, setOverflow] = useState<keyof typeof maskClassNames>("none");

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const sync = () => {
      const maxScroll = row.scrollWidth - row.clientWidth;
      const hasStart = row.scrollLeft > 1;
      const hasEnd = row.scrollLeft < maxScroll - 1;
      setOverflow(hasStart && hasEnd ? "both" : hasStart ? "start" : hasEnd ? "end" : "none");
    };

    const scrollWithWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const maxScroll = row.scrollWidth - row.clientWidth;
      const canScroll = event.deltaY > 0 ? row.scrollLeft < maxScroll - 1 : row.scrollLeft > 1;
      if (!canScroll) return;
      event.preventDefault();
      row.scrollLeft += event.deltaY;
    };

    sync();
    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(row);
    row.addEventListener("scroll", sync, { passive: true });
    row.addEventListener("wheel", scrollWithWheel, { passive: false });
    return () => {
      resizeObserver.disconnect();
      row.removeEventListener("scroll", sync);
      row.removeEventListener("wheel", scrollWithWheel);
    };
  }, []);

  return (
    <ul ref={rowRef} className={`flex overflow-x-auto overscroll-x-contain scrollbar-none [&::-webkit-scrollbar]:hidden ${maskClassNames[overflow]} ${className}`}>
      {children}
    </ul>
  );
}
