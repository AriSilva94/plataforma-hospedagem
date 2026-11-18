"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { secondaryButtonClassName } from "@/components/owner/styles";
import type { AdminRoom } from "@/lib/admin";
import { sendApiRequest, toErrorMessage } from "@/lib/api";

type Room = Pick<AdminRoom, "id" | "title" | "storyStatus" | "storyRejectedReason" | "storyMedia">;

export function RoomStoryActions({ room }: { room: Room }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState(room.storyRejectedReason ?? "");
  const trimmedReason = reason.trim();

  async function send(path: string, init: RequestInit) {
    setPending(true);
    setError(undefined);
    try {
      await sendApiRequest(`/admin/rooms/${room.id}/story/${path}`, init);
      setRejecting(false);
      router.refresh();
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex gap-2">
        {room.storyMedia.map((item, index) => (
          <li key={item.id} className="relative h-28 w-16 shrink-0 overflow-hidden rounded-xl bg-(--surface-raised) ring-1 ring-(--border)">
            {item.type === "IMAGE" ? (
              <Image src={item.url} alt={`Mídia ${index + 1} do story de ${room.title}`} fill sizes="64px" className="object-cover" />
            ) : (
              <video src={`${item.url}#t=0.1`} controls preload="metadata" aria-label={`Mídia ${index + 1} do story de ${room.title}`} className="size-full object-cover" />
            )}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        {room.storyStatus === "PENDING" ? (
          <>
            <button type="button" disabled={pending} onClick={() => void send("approved", { method: "PUT" })} className={secondaryButtonClassName}>
              Aprovar story
            </button>
            {!rejecting ? (
              <button type="button" disabled={pending} onClick={() => setRejecting(true)} className={secondaryButtonClassName}>
                Recusar story
              </button>
            ) : null}
          </>
        ) : (
          <button type="button" disabled={pending} onClick={() => void send("review", { method: "DELETE" })} className={secondaryButtonClassName}>
            Voltar para análise
          </button>
        )}
      </div>

      {rejecting ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Motivo da recusa"
            aria-label="Motivo da recusa do story"
            rows={2}
            className="w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--text-primary) outline-hidden transition-colors placeholder:text-(--text-secondary) hover:border-(--text-secondary) focus:border-(--primary)"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending || !trimmedReason}
              onClick={() => void send("rejected", { method: "PUT", body: JSON.stringify({ reason: trimmedReason }) })}
              className={secondaryButtonClassName}
            >
              Confirmar recusa
            </button>
            <button type="button" disabled={pending} onClick={() => setRejecting(false)} className={secondaryButtonClassName}>
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {room.storyStatus === "REJECTED" && room.storyRejectedReason ? <p className="text-[13px] leading-relaxed text-(--text-secondary)">Motivo: {room.storyRejectedReason}</p> : null}

      {error ? (
        <p role="alert" className="text-sm text-(--error)">
          {error}
        </p>
      ) : null}
    </div>
  );
}
