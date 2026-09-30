"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormFeedback } from "@/components/form-feedback";
import { ConfirmDialog } from "@/components/owner/confirm-dialog";
import { dangerButtonClassName, primaryButtonClassName, secondaryButtonClassName } from "@/components/owner/styles";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import type { PropertyStatus } from "@/lib/properties";

const transitions: Record<PropertyStatus, { status: PropertyStatus; label: string; primary: boolean }[]> = {
  DRAFT: [{ status: "ACTIVE", label: "Publicar imóvel", primary: true }],
  ACTIVE: [{ status: "UNAVAILABLE", label: "Pausar imóvel", primary: false }],
  UNAVAILABLE: [{ status: "ACTIVE", label: "Reativar imóvel", primary: true }],
};

export function PropertyStatusActions({
  propertyId,
  status,
  canPublish = true,
  inline = false,
}: {
  propertyId: string;
  status: PropertyStatus;
  canPublish?: boolean;
  inline?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string>();

  async function run(request: () => Promise<unknown>, onSuccess: () => void) {
    setPending(true);
    setError(undefined);
    try {
      await request();
      onSuccess();
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    } finally {
      setPending(false);
      setConfirmingDelete(false);
    }
  }

  function changeStatus(next: PropertyStatus) {
    void run(
      () => sendApiRequest(`/owner/properties/${propertyId}/status`, { method: "PATCH", body: JSON.stringify({ status: next }) }),
      () => {
        if (status === "DRAFT" && next === "ACTIVE") {
          router.push(`/meus-imoveis/${propertyId}?publicado=1`);
          return;
        }
        router.refresh();
      },
    );
  }

  function remove() {
    void run(
      () => sendApiRequest(`/owner/properties/${propertyId}`, { method: "DELETE" }),
      () => {
        router.push("/meus-imoveis");
        router.refresh();
      },
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${inline ? "" : "sm:items-end"}`}>
      <div className="flex flex-wrap gap-3">
        {transitions[status].map((transition) => (
          <button
            key={transition.status}
            type="button"
            disabled={pending || (transition.status === "ACTIVE" && !canPublish)}
            onClick={() => changeStatus(transition.status)}
            className={transition.primary ? primaryButtonClassName : secondaryButtonClassName}
          >
            {transition.label}
          </button>
        ))}
        {status === "DRAFT" && !inline ? (
          <button type="button" disabled={pending} onClick={() => setConfirmingDelete(true)} className={dangerButtonClassName}>
            Excluir rascunho
          </button>
        ) : null}
      </div>
      <ConfirmDialog
        open={confirmingDelete}
        title="Excluir este rascunho?"
        description="O imóvel, seus quartos e todas as fotos e vídeos serão removidos. Essa ação não pode ser desfeita."
        confirmLabel="Excluir rascunho"
        pendingLabel="Excluindo..."
        pending={pending}
        onConfirm={remove}
        onCancel={() => setConfirmingDelete(false)}
      />
      {!canPublish && status !== "ACTIVE" ? (
        <p className="max-w-md text-sm text-(--gray)">Complete os itens pendentes para habilitar a publicação.</p>
      ) : null}
      {error ? (
        <div className="max-w-md">
          <FormFeedback tone="error">{error}</FormFeedback>
        </div>
      ) : null}
    </div>
  );
}
