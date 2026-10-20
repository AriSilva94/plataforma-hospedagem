import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { LuBadgeCheck, LuImage, LuMapPin, LuStar } from "react-icons/lu";
import { PropertyTypeTag } from "@/components/property-type-tag";
import { formatCents, formatLocation, type PublicRoomCard } from "@/lib/properties";

const badgeClassName =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-[0_2px_8px_color-mix(in_srgb,var(--shadow)_35%,transparent)]";

export function RoomCard({
  room,
  action,
  unavailable = false,
}: {
  room: PublicRoomCard;
  action?: ReactNode;
  unavailable?: boolean;
}) {
  const content = (
    <>
      <div className="relative aspect-4/3 bg-(--surface-raised)">
        {room.coverUrl ? (
          <Image
            src={room.coverUrl}
            alt=""
            fill
            className={`object-cover transition-transform duration-300 ${unavailable ? "opacity-50 grayscale" : "group-hover:scale-103"}`}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-(--text-secondary)">
            <LuImage aria-hidden="true" size={28} />
          </div>
        )}
        {unavailable ? (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center rounded-full bg-(--background)/85 px-2.5 py-1 text-xs font-bold text-(--text-primary)">
            Indisponível no momento
          </span>
        ) : room.verified || room.featured ? (
          <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
            {room.verified ? (
              <span className={`${badgeClassName} bg-(--success-soft) text-(--success)`}>
                <LuBadgeCheck aria-hidden="true" size={12} />
                Verificado
              </span>
            ) : null}
            {room.featured ? (
              <span className={`${badgeClassName} bg-(--warning-soft) text-(--warning)`}>
                <LuStar aria-hidden="true" size={12} fill="currentColor" />
                Destaque
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="flex grow flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`line-clamp-2 min-w-0 wrap-break-word text-base font-bold leading-snug ${unavailable ? "text-(--text-secondary)" : "text-(--primary-text)"}`}
          >
            {room.title}
          </h3>
          <span className="shrink-0">
            <PropertyTypeTag type={room.property.type} />
          </span>
        </div>
        <div className="mt-auto pt-2.5">
          <p className="text-[13px] text-(--text-secondary)">
            <strong className={`text-base ${unavailable ? "text-(--text-secondary)" : "text-(--text-primary)"}`}>
              {formatCents(room.priceCents)}
            </strong>{" "}
            / diária
          </p>
          <p className="mt-2 flex items-start gap-1.5 text-[13px] text-(--text-secondary)">
            <LuMapPin
              aria-hidden="true"
              size={14}
              className={`mt-px shrink-0 ${unavailable ? "" : "text-(--primary-text)"}`}
            />
            <span className="line-clamp-1">{formatLocation(room.property)}</span>
          </p>
        </div>
      </div>
    </>
  );

  return (
    <div className="relative flex h-full flex-col">
      {unavailable ? (
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-dashed border-(--border) bg-(--surface)">
          {content}
        </div>
      ) : (
        <Link
          href={`/imoveis/${room.property.id}/quartos/${room.id}`}
          className="group flex h-full flex-col overflow-hidden rounded-2xl bg-(--surface) border border-(--border-accent) transition-[border-color,box-shadow] duration-200 hover:border-(--primary)/40 hover:shadow-[0_14px_28px_-16px_color-mix(in_srgb,var(--shadow)_45%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
        >
          {content}
        </Link>
      )}
      {action ? <div className="absolute right-2 top-2">{action}</div> : null}
    </div>
  );
}
