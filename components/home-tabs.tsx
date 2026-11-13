"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";

export type HomeTab = { id: string; label: string; icon: ReactNode; panel: ReactNode };

export function HomeTabs({ tabs, children }: { tabs: HomeTab[]; children: ReactNode }) {
  const [activeId, setActiveId] = useState(tabs[0].id);

  function moveWithArrows(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const index = tabs.findIndex((tab) => tab.id === activeId);
    const next = tabs[(index + step + tabs.length) % tabs.length];
    setActiveId(next.id);
    document.getElementById(`aba-${next.id}`)?.focus();
  }

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        {children}
        <div
          role="tablist"
          aria-label="Seções da home"
          onKeyDown={moveWithArrows}
          className={`w-full shrink-0 gap-1 rounded-[1.625rem] border border-(--border) bg-(--surface) p-1 sm:flex lg:w-auto ${tabs.length > 3 ? "grid grid-cols-2" : "flex"}`}
        >
          {tabs.map((tab) => {
            const active = tab.id === activeId;
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
                className={`inline-flex min-h-11 flex-auto items-center justify-center gap-2 rounded-full px-2 text-center text-[13px] leading-tight font-bold transition-colors sm:px-4 sm:text-sm sm:whitespace-nowrap lg:flex-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) ${active ? "bg-(--primary) text-(--on-primary)" : "text-(--text-secondary) hover:bg-(--primary-soft) hover:text-(--text-primary)"}`}
              >
                <span className="hidden sm:inline-flex">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`painel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`aba-${tab.id}`}
          hidden={tab.id !== activeId}
          className="flex min-h-0 flex-1 flex-col"
        >
          {tab.panel}
        </div>
      ))}
    </>
  );
}
