import { StatusBadge } from "@/components/owner/status-badge";
import {
  propertyStatusLabels,
  roomStatusLabels,
  roomVerificationStatusLabels,
  type PropertyStatus,
  type RoomStatus,
  type RoomVerificationStatus,
} from "@/lib/properties";

const propertyTones = { DRAFT: "neutral", ACTIVE: "success", UNAVAILABLE: "warning" } as const;
const roomTones = { AVAILABLE: "success", UNAVAILABLE: "warning", INACTIVE: "neutral" } as const;
const roomVerificationTones = { PENDING: "warning", VERIFIED: "success", REJECTED: "danger" } as const;

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  return <StatusBadge tone={propertyTones[status]}>{propertyStatusLabels[status]}</StatusBadge>;
}

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  return <StatusBadge tone={roomTones[status]}>{roomStatusLabels[status]}</StatusBadge>;
}

export function RoomVerification({ status, rejectedReason }: { status: RoomVerificationStatus; rejectedReason: string | null }) {
  return (
    <>
      <StatusBadge tone={roomVerificationTones[status]}>{roomVerificationStatusLabels[status]}</StatusBadge>
      {status === "REJECTED" && rejectedReason ? <span className="text-xs text-(--gray)">{rejectedReason}</span> : null}
    </>
  );
}
