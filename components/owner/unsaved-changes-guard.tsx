"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/owner/confirm-dialog";

export function UnsavedChangesGuard({ dirty }: { dirty: boolean }) {
  const router = useRouter();
  const [target, setTarget] = useState<string>();

  useEffect(() => {
    if (!dirty) return;

    function warnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    function interceptLink(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      event.preventDefault();
      event.stopPropagation();
      setTarget(`${url.pathname}${url.search}${url.hash}`);
    }

    window.addEventListener("beforeunload", warnBeforeUnload);
    document.addEventListener("click", interceptLink, true);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
      document.removeEventListener("click", interceptLink, true);
    };
  }, [dirty]);

  return (
    <ConfirmDialog
      open={target !== undefined}
      title="Descartar alterações?"
      description="Você alterou campos que ainda não foram salvos. Se sair agora, essas alterações serão perdidas."
      confirmLabel="Sair sem salvar"
      cancelLabel="Continuar editando"
      onConfirm={() => {
        if (target) router.push(target);
        setTarget(undefined);
      }}
      onCancel={() => setTarget(undefined)}
    />
  );
}
