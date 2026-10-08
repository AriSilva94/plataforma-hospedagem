import Link from "next/link";
import type { IconType } from "react-icons";

export function SectionTabs({
  label,
  tabs,
  current,
}: {
  label: string;
  tabs: { id: string; label: string; href: string; icon?: IconType; pending?: boolean }[];
  current: string;
}) {
  return (
    <nav aria-label={label} className="-mx-4 mt-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
      <ul className="flex min-w-max gap-6 shadow-[inset_0_-1px_0_var(--line)]">
        {tabs.map((tab) => {
          const active = tab.id === current;
          const Icon = tab.icon;
          return (
            <li key={tab.id}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center gap-2 border-b-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--blue-light) ${active ? "border-(--blue-light) text-white" : "border-transparent text-(--gray) hover:text-white"}`}
              >
                {Icon ? <Icon aria-hidden="true" size={16} className={active ? "text-(--blue-light)" : undefined} /> : null}
                {tab.label}
                {tab.pending ? (
                  <>
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-(--warning)" />
                    <span className="sr-only">(com pendências)</span>
                  </>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
