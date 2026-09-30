"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormFeedback } from "@/components/form-feedback";
import { dangerButtonClassName, primaryButtonClassName, secondaryButtonClassName } from "@/components/owner/styles";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import type { PropertyStatus } from "@/lib/properties";

const transitions: Record<PropertyStatus, { status: PropertyStatus; label: string; primary: boolean }[]> = {
  DRAFT: [{ status: "ACTIVE", label: "Publicar imóvel", primary: true }],
  ACTIVE: [{ status: "UNAVAILABLE", label: "Marcar como indisponível", primary: false }],
  UNAVAILABLE: [{ status: "ACTIVE", label: "Reativar imóvel", primary: true }],
};

export function PropertyStatusActions({ propertyId, status }: { propertyId: string; status: PropertyStatus }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
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
    }
  }

  function changeStatus(next: PropertyStatus) {
    void run(
      () => sendApiRequest(`/owner/properties/${propertyId}/status`, { method: "PATCH", body: JSON.stringify({ status: next }) }),
      () => router.refresh(),
    );
  }

  function remove() {
    if (!window.confirm("Excluir este rascunho? Quartos e mídias também serão removidos.")) return;
    void run(
      () => sendApiRequest(`/owner/properties/${propertyId}`, { method: "DELETE" }),
      () => {
        router.push("/meus-imoveis");
        router.refresh();
      },
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:items-end">
      <div className="flex flex-wrap gap-3">
        {transitions[status].map((transition) => (
          <button
            key={transition.status}
            type="button"
            disabled={pending}
            onClick={() => changeStatus(transition.status)}
            className={transition.primary ? primaryButtonClassName : secondaryButtonClassName}
          >
            {transition.label}
          </button>
        ))}
        {status === "DRAFT" ? (
          <button type="button" disabled={pending} onClick={remove} className={dangerButtonClassName}>
            Excluir rascunho
          </button>
        ) : null}
      </div>
      {error ? (
        <div className="max-w-md">
          <FormFeedback tone="error">{error}</FormFeedback>
        </div>
      ) : null}
    </div>
  );
}
