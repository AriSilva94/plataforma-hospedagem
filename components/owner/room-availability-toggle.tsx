"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/owner/confirm-dialog";
import { Switch } from "@/components/owner/switch";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import type { PropertyStatus, RoomStatus } from "@/lib/properties";

function availabilityHint(available: boolean, propertyStatus: PropertyStatus): string {
  if (!available) return "Pausado: não aparece na busca";
  if (propertyStatus === "DRAFT") return "Aparece após publicar o imóvel";
  if (propertyStatus === "UNAVAILABLE") return "Imóvel pausado: fora da busca";
  return "Aparece na busca";
}

export function RoomAvailabilityToggle({
  roomId,
  roomTitle,
  status,
  propertyStatus,
  warnBeforePause,
  focusAfterChangeId,
}: {
  roomId: string;
  roomTitle: string;
  status: Extract<RoomStatus, "AVAILABLE" | "UNAVAILABLE">;
  propertyStatus: PropertyStatus;
  warnBeforePause: boolean;
  focusAfterChangeId?: string;
}) {
  const router = useRouter();
  const [available, setAvailable] = useState(status === "AVAILABLE");
  const [syncedStatus, setSyncedStatus] = useState(status);
  if (status !== syncedStatus) {
    setSyncedStatus(status);
    setAvailable(status === "AVAILABLE");
  }
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();

  async function change(next: boolean) {
    setPending(true);
    setError(undefined);
    try {
      await sendApiRequest(`/owner/rooms/${roomId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next ? "AVAILABLE" : "UNAVAILABLE" }),
      });
      setAvailable(next);
      router.refresh();
      if (focusAfterChangeId) document.getElementById(focusAfterChangeId)?.focus();
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    } finally {
      setPending(false);
      setConfirming(false);
    }
  }

  function requestChange(next: boolean) {
    if (!next && warnBeforePause) {
      setConfirming(true);
      return;
    }
    void change(next);
  }

  return (
    <div>
      <Switch checked={available} disabled={pending} onChange={requestChange}>
        <span className="sr-only">Quarto {roomTitle}: </span>
        <span className="text-sm font-semibold text-white">Reservável</span>
        <span className="sr-only">. </span>
        <span className="block text-xs text-(--gray)">{availabilityHint(available, propertyStatus)}</span>
      </Switch>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-(--danger)">
          {error}
        </p>
      ) : null}
      <ConfirmDialog
        open={confirming}
        title="Pausar o último quarto reservável?"
        description="Sem nenhum quarto reservável, o imóvel deixa de aparecer na busca até você reativar um quarto."
        confirmLabel="Pausar quarto"
        pendingLabel="Pausando..."
        tone="primary"
        pending={pending}
        onConfirm={() => void change(false)}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
