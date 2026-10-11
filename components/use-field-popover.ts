"use client";

import { useCallback, useEffect, useRef, useState, type FocusEvent } from "react";

type Side = "bottom" | "top";

const viewportMargin = 16;
const mobileNavigationHeight = 88;

export function useFieldPopover<Anchor extends HTMLElement>() {
  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<Anchor>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [side, setSide] = useState<Side>("bottom");

  const open = useCallback(() => {
    const anchor = anchorRef.current?.getBoundingClientRect();
    const panelHeight = panelRef.current?.offsetHeight ?? 0;
    if (anchor) {
      const bottomInset = window.matchMedia("(min-width: 48rem)").matches ? viewportMargin : mobileNavigationHeight;
      const spaceBelow = window.innerHeight - anchor.bottom - bottomInset;
      const spaceAbove = anchor.top - viewportMargin;
      setSide(spaceBelow < panelHeight && spaceAbove > spaceBelow ? "top" : "bottom");
    }
    setIsOpen(true);
  }, []);

  const close = useCallback((restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) anchorRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function closeOnOutsidePress(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [isOpen]);

  function closeOnFocusLeave(event: FocusEvent<HTMLDivElement>) {
    if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
  }

  return {
    rootRef,
    anchorRef,
    panelRef,
    isOpen,
    open,
    close,
    rootProps: { ref: rootRef, onBlur: closeOnFocusLeave },
    panelProps: { ref: panelRef, "data-state": isOpen ? "open" : "closed", "data-side": side },
  } as const;
}
