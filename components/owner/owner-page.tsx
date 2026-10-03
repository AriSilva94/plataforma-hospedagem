import Link from "next/link";
import type { ReactNode } from "react";
import { LuArrowLeft } from "react-icons/lu";

export function OwnerPage({
  title,
  badge,
  description,
  back,
  actions,
  wide = false,
  divider = true,
  children,
}: {
  title: string;
  badge?: ReactNode;
  description?: string;
  back?: { href: string; label: string };
  actions?: ReactNode;
  wide?: boolean;
  divider?: boolean;
  children: ReactNode;
}) {
  return (
    <main className="min-h-[calc(100vh-72px)] px-4 pt-4 pb-28 sm:px-6 md:pt-8 md:pb-16">
      <div className={`mx-auto ${wide ? "max-w-6xl" : "max-w-5xl"}`}>
        {back ? (
          <Link
            href={back.href}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-(--gray) transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--blue-light)"
          >
            <LuArrowLeft aria-hidden="true" size={16} />
            {back.label}
          </Link>
        ) : null}
        <header className={`mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${divider ? "border-b border-(--line) pb-5" : ""}`}>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 className="wrap-break-word text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{title}</h1>
              {badge}
            </div>
            {description ? <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-(--gray)">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
        </header>
        {children}
      </div>
    </main>
  );
}
