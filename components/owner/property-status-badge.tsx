import { StatusBadge } from "@/components/owner/status-badge";
import { propertyStatusLabels, roomStatusLabels, type PropertyStatus, type RoomStatus } from "@/lib/properties";

const propertyTones = { DRAFT: "neutral", ACTIVE: "success", UNAVAILABLE: "warning" } as const;
const roomTones = { AVAILABLE: "success", UNAVAILABLE: "warning", INACTIVE: "neutral" } as const;

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  return <StatusBadge tone={propertyTones[status]}>{propertyStatusLabels[status]}</StatusBadge>;
}

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  return <StatusBadge tone={roomTones[status]}>{roomStatusLabels[status]}</StatusBadge>;
}
