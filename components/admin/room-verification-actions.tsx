"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { secondaryButtonClassName } from "@/components/owner/styles";
import type { AdminRoom } from "@/lib/admin";
import { sendApiRequest, toErrorMessage } from "@/lib/api";

type Room = Pick<AdminRoom, "id" | "verificationStatus" | "verificationRejectedReason">;

const resetActions = {
  VERIFIED: { label: "Remover verificação", path: "verified" },
  REJECTED: { label: "Voltar para análise", path: "rejected" },
} as const;

export function RoomVerificationActions({ room }: { room: Room }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState(room.verificationRejectedReason ?? "");
  const trimmedReason = reason.trim();
  const resetAction = room.verificationStatus === "PENDING" ? undefined : resetActions[room.verificationStatus];

  async function send(path: string, init: RequestInit) {
    setPending(true);
    setError(undefined);
    try {
      await sendApiRequest(`/admin/rooms/${room.id}/${path}`, init);
      setRejecting(false);
      router.refresh();
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {resetAction ? (
        <button type="button" disabled={pending} onClick={() => void send(resetAction.path, { method: "DELETE" })} className={secondaryButtonClassName}>
          {resetAction.label}
        </button>
      ) : (
        <button type="button" disabled={pending} onClick={() => void send("verified", { method: "PUT" })} className={secondaryButtonClassName}>
          Verificar
        </button>
      )}

      {room.verificationStatus === "PENDING" && !rejecting ? (
        <button type="button" disabled={pending} onClick={() => setRejecting(true)} className={secondaryButtonClassName}>
          Rejeitar
        </button>
      ) : null}

      {rejecting ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Motivo da rejeição"
            aria-label="Motivo da rejeição"
            rows={2}
            className="w-full rounded-xl border border-(--border-strong) bg-(--background) px-3 py-2 text-sm text-(--text-primary) outline-hidden focus:border-(--primary)"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending || !trimmedReason}
              onClick={() => void send("rejected", { method: "PUT", body: JSON.stringify({ reason: trimmedReason }) })}
              className={secondaryButtonClassName}
            >
              Confirmar rejeição
            </button>
            <button type="button" disabled={pending} onClick={() => setRejecting(false)} className={secondaryButtonClassName}>
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {room.verificationStatus === "REJECTED" && room.verificationRejectedReason ? (
        <p className="text-xs leading-relaxed text-(--text-secondary)">Motivo: {room.verificationRejectedReason}</p>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-(--error)">
          {error}
        </p>
      ) : null}
    </div>
  );
}
