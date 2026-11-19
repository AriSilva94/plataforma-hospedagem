import Link from "next/link";
import type { ReactNode } from "react";
import { LuBadgeCheck, LuChevronRight, LuImage, LuUsers } from "react-icons/lu";
import { CoverMedia } from "@/components/cover-media";
import { formatCents, type PublicPropertyDetail } from "@/lib/properties";

type Room = PublicPropertyDetail["rooms"][number];

const roomStatuses: Record<Room["availabilityStatus"], { label: string; dotClassName: string; badgeClassName: string }> = {
  AVAILABLE: { label: "Disponível", dotClassName: "bg-(--success)", badgeClassName: "border-(--success)/38 bg-(--success-soft) text-(--success)" },
  BLOCKED: { label: "Indisponível", dotClassName: "bg-(--text-secondary)", badgeClassName: "border-(--border-strong)/50 bg-(--surface-raised) text-(--text-secondary)" },
};

export function RoomStatusLegend() {
  return (
    <ul aria-label="Legenda de disponibilidade" className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-(--text-secondary)">
      {Object.values(roomStatuses).map(({ label, dotClassName }) => (
        <li key={label} className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className={`size-2.5 rounded-full ${dotClassName}`} />
          {label}
        </li>
      ))}
    </ul>
  );
}

function StatusBadge({ status }: { status: Room["availabilityStatus"] }) {
  const { label, dotClassName, badgeClassName } = roomStatuses[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs leading-tight font-bold whitespace-nowrap ${badgeClassName}`}>
      <span aria-hidden="true" className={`size-2 rounded-full ${dotClassName}`} />
      {label}
    </span>
  );
}

export function RoomRow({ room, href, action }: { room: Room; href: string; action?: ReactNode }) {
  const cover = room.media[0];
  const price = (
    <p className="text-xs whitespace-nowrap text-(--text-secondary)">
      <strong className="text-[15px] font-extrabold text-(--text-primary) tabular-nums sm:text-base">{formatCents(room.priceCents)}</strong> / diária
    </p>
  );

  return (
    <div className="relative">
      <Link
        href={href}
        className="group flex items-center gap-3 rounded-xl border border-(--border-accent) bg-(--surface) p-1.5 pr-2 transition-[border-color,box-shadow] duration-200 hover:border-(--primary)/40 hover:shadow-[0_10px_24px_-16px_color-mix(in_srgb,var(--shadow)_45%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) sm:gap-4"
      >
        <div className="relative aspect-4/3 w-24 shrink-0 overflow-hidden rounded-lg bg-(--surface-raised) sm:aspect-2/1 sm:w-32">
          {cover ? (
            <CoverMedia url={cover.url} type={cover.type} sizes="128px" className="transition-transform duration-300 group-hover:scale-103" />
          ) : (
            <div className="flex size-full items-center justify-center text-(--text-secondary)">
              <LuImage aria-hidden="true" size={20} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-[15px] font-bold text-(--primary-text) sm:text-base">{room.title}</h3>
            {room.verified ? (
              <span title="Verificado" className="shrink-0 text-(--success)">
                <LuBadgeCheck aria-hidden="true" size={16} />
                <span className="sr-only">Verificado</span>
              </span>
            ) : null}
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs whitespace-nowrap text-(--text-secondary)">
            <LuUsers aria-hidden="true" size={13} className="shrink-0" /> até {room.capacity} {room.capacity === 1 ? "hóspede" : "hóspedes"}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 sm:hidden">
            {price}
            <StatusBadge status={room.availabilityStatus} />
          </div>
        </div>

        <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
          <StatusBadge status={room.availabilityStatus} />
          {price}
        </div>

        <LuChevronRight aria-hidden="true" size={18} className="shrink-0 text-(--text-secondary) transition-transform group-hover:translate-x-0.5" />
      </Link>
      {action ? <div className="absolute top-2.5 left-2.5">{action}</div> : null}
    </div>
  );
}
