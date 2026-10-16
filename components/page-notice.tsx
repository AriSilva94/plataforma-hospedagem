import Link from "next/link";

export function PageNotice({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-6 pb-18 md:pb-0">
      <section className="w-full max-w-md rounded-3xl border border-(--border) bg-(--surface) p-8 shadow-[0_24px_60px_color-mix(in_srgb,var(--shadow)_25%,transparent)]">
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <p className="mt-3 leading-relaxed text-(--text-secondary)">{description}</p>
        <Link
          className="mt-6 inline-flex rounded-2xl bg-(--primary) px-5 py-3 text-sm font-bold text-(--on-primary) transition hover:bg-(--primary-hover)"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      </section>
    </main>
  );
}
