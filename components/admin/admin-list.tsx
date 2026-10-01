import Link from "next/link";
import type { ReactNode } from "react";
import { secondaryButtonClassName } from "@/components/owner/styles";
import { ADMIN_PAGE_SIZE, queryString } from "@/lib/admin";

export function AdminPagination({ path, params, page, total }: { path: string; params: Record<string, string | undefined>; page: number; total: number }) {
  const pageCount = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  if (pageCount <= 1) return null;

  const href = (target: number) => `${path}?${queryString({ ...params, pagina: target })}`;

  return (
    <nav aria-label="Paginação" className="mt-6 flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link href={href(page - 1)} className={secondaryButtonClassName}>
          Anterior
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-(--gray)">
        Página {page} de {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={href(page + 1)} className={secondaryButtonClassName}>
          Próxima
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

export function AdminList({ total, singular, plural, emptyMessage, children }: { total: number; singular: string; plural: string; emptyMessage: string; children: ReactNode }) {
  return (
    <>
      <p className="mt-6 text-sm text-(--gray)" aria-live="polite">
        {total === 1 ? `1 ${singular}` : `${total} ${plural}`}
      </p>
      {total === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-(--line-strong) p-6 text-sm text-(--gray)">{emptyMessage}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">{children}</ul>
      )}
    </>
  );
}
