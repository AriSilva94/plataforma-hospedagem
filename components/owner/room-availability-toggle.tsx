"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/owner/confirm-dialog";
import { Switch } from "@/components/owner/switch";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import type { RoomStatus } from "@/lib/properties";

export function RoomAvailabilityToggle({
  roomId,
  roomTitle,
  status,
  warnBeforePause,
}: {
  roomId: string;
  roomTitle: string;
  status: Extract<RoomStatus, "AVAILABLE" | "UNAVAILABLE">;
  warnBeforePause: boolean;
}) {
  const router = useRouter();
  const [available, setAvailable] = useState(status === "AVAILABLE");
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
        <span className="text-sm font-semibold text-white">{available ? "Reservável" : "Pausado"}</span>
        <span className="block text-xs text-(--gray)">{available ? "Aparece na busca" : "Não aparece na busca"}</span>
      </Switch>
      {error ? <p role="alert" className="mt-2 text-xs text-(--danger)">{error}</p> : null}
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
