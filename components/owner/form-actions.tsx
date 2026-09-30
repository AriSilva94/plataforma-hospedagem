import type { ReactNode } from "react";

export function FormActions({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-20 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-(--line) bg-(--navy)/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-t-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
      {children}
    </div>
  );
}
