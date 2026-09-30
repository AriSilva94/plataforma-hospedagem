import Link from "next/link";
import type { ReactNode } from "react";
import { LuArrowLeft } from "react-icons/lu";

export function OwnerPage({
  title,
  eyebrow,
  description,
  back,
  actions,
  children,
}: {
  title: string;
  eyebrow?: ReactNode;
  description?: string;
  back?: { href: string; label: string };
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="min-h-[calc(100vh-72px)] px-4 pt-8 pb-28 sm:px-6 md:pt-12 md:pb-16">
      <div className="mx-auto max-w-5xl">
        {back ? (
          <Link
            href={back.href}
            className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-(--gray) transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--blue-light)"
          >
            <LuArrowLeft aria-hidden="true" size={16} />
            {back.label}
          </Link>
        ) : null}
        <header className="mt-4 flex flex-col gap-4 border-b border-(--line) pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? <div className="mb-2">{eyebrow}</div> : null}
            <h1 className="wrap-break-word text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{title}</h1>
            {description ? <p className="mt-2 max-w-prose text-sm leading-relaxed text-(--gray)">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
        </header>
        {children}
      </div>
    </main>
  );
}
