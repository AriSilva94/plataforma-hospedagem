"use client";

import { LuMoon, LuSun } from "react-icons/lu";
import { parseTheme, themeCookieName, type Theme } from "@/lib/theme";

const themeCookieMaxAge = 60 * 60 * 24 * 365;

function resolveCurrentTheme(): Theme {
  return parseTheme(document.documentElement.dataset.theme) ?? "light";
}

export function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const next: Theme = resolveCurrentTheme() === "dark" ? "light" : "dark";
    root.classList.add("theme-switching");
    root.dataset.theme = next;
    document.cookie = `${themeCookieName}=${next}; path=/; max-age=${themeCookieMaxAge}; samesite=lax`;
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Alternar entre tema claro e escuro"
      className="flex size-10 items-center justify-center rounded-xl text-(--text-primary)/85 transition-colors hover:bg-(--primary-soft) hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
    >
      <LuMoon aria-hidden="true" size={19} className="dark:hidden" />
      <LuSun aria-hidden="true" size={19} className="hidden dark:block" />
    </button>
  );
}
