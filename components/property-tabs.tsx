"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";

export type PropertyTab = { id: string; label: string; icon: ReactNode; panel: ReactNode };

export function PropertyTabs({ tabs, label }: { tabs: PropertyTab[]; label: string }) {
  const [activeId, setActiveId] = useState(tabs[0].id);
  const activeIndex = tabs.findIndex((tab) => tab.id === activeId);

  function moveWithArrows(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = tabs[(activeIndex + step + tabs.length) % tabs.length];
    setActiveId(next.id);
    document.getElementById(`aba-${next.id}`)?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={moveWithArrows}
        className="flex overflow-x-auto rounded-2xl border border-(--border) bg-(--surface) p-1 scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab, index) => {
          const active = index === activeIndex;
          const showDivider = index > 0 && !active && index - 1 !== activeIndex;
          return (
            <button
              key={tab.id}
              id={`aba-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`painel-${tab.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              className={`relative inline-flex min-h-13 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-xs font-bold whitespace-nowrap transition-colors sm:min-h-11 sm:flex-row sm:gap-2 sm:px-3 sm:text-sm before:absolute before:top-1/2 before:left-0 before:h-5 before:w-px before:-translate-y-1/2 before:bg-(--border) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--focus-ring) md:min-h-12 md:text-[15px] ${
                showDivider ? "" : "before:hidden"
              } ${active ? "bg-(--primary) text-(--on-primary)" : "text-(--text-secondary) hover:bg-(--primary-soft) hover:text-(--text-primary)"}`}
            >
              <span aria-hidden="true" className="inline-flex">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div key={tab.id} id={`painel-${tab.id}`} role="tabpanel" aria-labelledby={`aba-${tab.id}`} hidden={tab.id !== activeId} className="pt-4">
          {tab.panel}
        </div>
      ))}
    </div>
  );
}
