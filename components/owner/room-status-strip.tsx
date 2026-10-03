"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuArchive } from "react-icons/lu";
import { RoomAvailabilityToggle } from "@/components/owner/room-availability-toggle";
import { primaryButtonClassName } from "@/components/owner/styles";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { roomStatusHints, type PropertyStatus, type RoomStatus } from "@/lib/properties";

export function RoomStatusStrip({
  roomId,
  roomTitle,
  status,
  propertyStatus,
  availableRoomCount,
}: {
  roomId: string;
  roomTitle: string;
  status: RoomStatus;
  propertyStatus: PropertyStatus;
  availableRoomCount: number;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function reactivate() {
    setPending(true);
    setError(undefined);
    try {
      await sendApiRequest(`/owner/rooms/${roomId}`, { method: "PATCH", body: JSON.stringify({ status: "AVAILABLE" }) });
      router.refresh();
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    } finally {
      setPending(false);
    }
  }

  if (status === "INACTIVE") {
    return (
      <section aria-label="Situação do quarto" className="mt-4 rounded-2xl border border-(--line-strong) bg-(--surface) px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-3 text-sm text-(--gray)">
            <LuArchive aria-hidden="true" size={18} className="mt-0.5 shrink-0" />
            {roomStatusHints.INACTIVE}
          </p>
          <button type="button" disabled={pending} onClick={() => void reactivate()} className={`${primaryButtonClassName} shrink-0`}>
            {pending ? "Reativando..." : "Reativar quarto"}
          </button>
        </div>
        {error ? <p role="alert" className="mt-2 text-xs text-(--danger)">{error}</p> : null}
      </section>
    );
  }

  return (
    <section aria-label="Situação do quarto" className="mt-4 rounded-2xl border border-(--line-strong) bg-(--surface) px-4 py-2 sm:px-5">
      <RoomAvailabilityToggle
        roomId={roomId}
        roomTitle={roomTitle}
        status={status}
        propertyStatus={propertyStatus}
        warnBeforePause={propertyStatus === "ACTIVE" && status === "AVAILABLE" && availableRoomCount === 1}
      />
    </section>
  );
}
