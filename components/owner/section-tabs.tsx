import Link from "next/link";

export function SectionTabs({
  label,
  tabs,
  current,
}: {
  label: string;
  tabs: { id: string; label: string; href: string }[];
  current: string;
}) {
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
      <ul className="flex min-w-max gap-2 border-b border-(--line) py-4">
        {tabs.map((tab) => {
          const active = tab.id === current;
          return (
            <li key={tab.id}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light) ${active ? "bg-(--blue) text-white" : "text-(--gray) hover:bg-white/5 hover:text-white"}`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
