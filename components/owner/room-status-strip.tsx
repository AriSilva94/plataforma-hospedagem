"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuArchive } from "react-icons/lu";
import { RoomAvailabilityToggle } from "@/components/owner/room-availability-toggle";
import { RoomVerification } from "@/components/owner/property-status-badge";
import { primaryButtonClassName } from "@/components/owner/styles";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { roomStatusHints, type PropertyStatus, type RoomStatus, type RoomVerificationStatus } from "@/lib/properties";

export function RoomStatusStrip({
  roomId,
  roomTitle,
  status,
  propertyStatus,
  availableRoomCount,
  verificationStatus,
  verificationRejectedReason,
}: {
  roomId: string;
  roomTitle: string;
  status: RoomStatus;
  propertyStatus: PropertyStatus;
  availableRoomCount: number;
  verificationStatus: RoomVerificationStatus;
  verificationRejectedReason: string | null;
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

  return (
    <section aria-label="Situação do quarto" className="mt-4 overflow-hidden rounded-2xl border border-(--line-strong) bg-(--surface)">
      {status === "INACTIVE" ? (
        <>
          <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="flex items-start gap-3 text-sm text-(--gray)">
              <LuArchive aria-hidden="true" size={18} className="mt-0.5 shrink-0" />
              {roomStatusHints.INACTIVE}
            </p>
            <button type="button" disabled={pending} onClick={() => void reactivate()} className={`${primaryButtonClassName} shrink-0`}>
              {pending ? "Reativando..." : "Reativar quarto"}
            </button>
          </div>
          {error ? <p role="alert" className="px-4 pb-3 text-xs text-(--danger) sm:px-5">{error}</p> : null}
        </>
      ) : (
        <div className="px-4 py-2 sm:px-5">
          <RoomAvailabilityToggle
            roomId={roomId}
            roomTitle={roomTitle}
            status={status}
            propertyStatus={propertyStatus}
            warnBeforePause={propertyStatus === "ACTIVE" && status === "AVAILABLE" && availableRoomCount === 1}
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 border-t border-(--line) px-4 py-2.5 sm:px-5">
        <span className="text-xs font-semibold text-(--gray)">Verificação:</span>
        <RoomVerification status={verificationStatus} rejectedReason={verificationRejectedReason} />
      </div>
    </section>
  );
}
