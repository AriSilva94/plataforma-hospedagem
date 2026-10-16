"use client";

import { LuMoon, LuSun } from "react-icons/lu";
import { parseTheme, themeCookieName, type Theme } from "@/lib/theme";

const themeCookieMaxAge = 60 * 60 * 24 * 365;

function resolveCurrentTheme(): Theme {
  return (
    parseTheme(document.documentElement.dataset.theme) ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );
}

export function ThemeToggle() {
  function toggleTheme() {
    const next: Theme = resolveCurrentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.cookie = `${themeCookieName}=${next}; path=/; max-age=${themeCookieMaxAge}; samesite=lax`;
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Alternar entre tema claro e escuro"
      className="flex size-10 items-center justify-center rounded-xl text-(--text-primary)/85 transition-colors hover:bg-(--text-primary)/5 hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
    >
      <LuMoon aria-hidden="true" size={19} className="dark:hidden" />
      <LuSun aria-hidden="true" size={19} className="hidden dark:block" />
    </button>
  );
}
