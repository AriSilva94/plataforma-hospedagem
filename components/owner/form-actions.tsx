import type { ReactNode } from "react";
import { LuCircleAlert, LuCircleCheck } from "react-icons/lu";

export function FormActions({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-18 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-(--line) bg-(--navy)/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 md:bottom-0">
      {children}
    </div>
  );
}

export function FormStatus({ error, saved, dirty }: { error?: string; saved?: string; dirty?: boolean }) {
  if (error) {
    return (
      <p role="alert" className="flex min-w-0 items-center gap-1.5 text-sm text-[#ff9b8a]">
        <LuCircleAlert aria-hidden="true" size={16} className="shrink-0" />
        {error}
      </p>
    );
  }
  if (dirty) {
    return (
      <p role="status" className="text-sm text-(--warning)">
        Alterações não salvas
      </p>
    );
  }
  if (saved) {
    return (
      <p role="status" className="flex items-center gap-1.5 text-sm text-(--success)">
        <LuCircleCheck aria-hidden="true" size={16} className="shrink-0" />
        {saved}
      </p>
    );
  }
  return null;
}
