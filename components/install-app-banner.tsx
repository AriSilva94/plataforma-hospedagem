"use client";

import { useState, useSyncExternalStore } from "react";
import { LuDownload, LuX } from "react-icons/lu";

type InstallEvent = Event & { prompt: () => Promise<void> };

const DISMISSED_KEY = "install-banner-dismissed";

let deferredPrompt: InstallEvent | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as InstallEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function neverChanges() {
  return () => {};
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isDismissed() {
  try {
    return localStorage.getItem(DISMISSED_KEY) !== null;
  } catch {
    return false;
  }
}

function canPrompt() {
  return deferredPrompt !== null && !isStandalone();
}

function needsIosHint() {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) && !isStandalone();
}

function dismiss() {
  try {
    localStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    return;
  }
  notify();
}

export function InstallAppBanner() {
  const promptAvailable = useSyncExternalStore(subscribe, canPrompt, () => false);
  const iosHintAvailable = useSyncExternalStore(neverChanges, needsIosHint, () => false);
  const dismissed = useSyncExternalStore(subscribe, isDismissed, () => true);
  const [showHint, setShowHint] = useState(false);

  if (dismissed || (!promptAvailable && !iosHintAvailable)) return null;

  async function install() {
    if (!promptAvailable) {
      setShowHint((current) => !current);
      return;
    }
    const event = deferredPrompt;
    deferredPrompt = null;
    notify();
    await event?.prompt();
  }

  return (
    <div className="bg-(--primary) text-(--on-primary)">
      <div className="relative mx-auto flex min-h-10 w-full max-w-360 flex-wrap items-center justify-center gap-x-3 gap-y-1 py-1.5 pr-12 pl-4 md:px-12 lg:px-14">
        <p className="text-center text-[13px] font-semibold md:text-sm">
          <span className="sm:hidden">Instale o app da DOMUS X</span>
          <span className="hidden sm:inline">Seu próximo quarto a um toque: instale o app da DOMUS X.</span>
        </p>
        <button
          type="button"
          onClick={() => void install()}
          aria-expanded={promptAvailable ? undefined : showHint}
          className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-(--white) px-3 text-xs font-bold text-(--primary) transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--white)"
        >
          <LuDownload aria-hidden="true" size={13} />
          {promptAvailable ? "Instalar" : "Como instalar"}
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dispensar convite para instalar o app"
          className="absolute right-2 flex size-8 items-center justify-center rounded-full transition-colors hover:bg-(--white)/15 focus-visible:outline-2 focus-visible:outline-(--white) md:right-6"
        >
          <LuX aria-hidden="true" size={16} />
        </button>
        {!promptAvailable && showHint ? <p role="status" className="basis-full text-center text-xs">No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início.</p> : null}
      </div>
    </div>
  );
}
