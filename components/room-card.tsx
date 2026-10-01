import Image from "next/image";
import Link from "next/link";
import { LuImage, LuStar } from "react-icons/lu";
import { formatCents, formatLocation, propertyTypeLabels, type PublicRoomCard } from "@/lib/properties";

export function RoomCard({ room }: { room: PublicRoomCard }) {
  return (
    <Link
      href={`/imoveis/${room.property.id}#quarto-${room.id}`}
      className="group block overflow-hidden rounded-2xl border border-(--line) bg-(--surface) transition-colors hover:border-(--blue-light) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light)"
    >
      <div className="relative aspect-4/3 bg-(--surface-raised)">
        {room.coverUrl ? (
          <Image src={room.coverUrl} alt="" fill unoptimized className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
        ) : (
          <div className="flex size-full items-center justify-center text-(--gray)">
            <LuImage aria-hidden="true" size={28} />
          </div>
        )}
        {room.featured ? (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-[rgba(3,17,40,.7)] px-2.5 py-1 text-[11px] font-bold text-white">
            <LuStar aria-hidden="true" size={12} className="text-(--warning)" fill="currentColor" /> Destaque
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="wrap-break-word text-sm font-bold text-white">{room.title}</h3>
        <p className="mt-1 wrap-break-word text-xs text-(--gray)">
          {room.property.title} · {propertyTypeLabels[room.property.type]}
        </p>
        <p className="mt-0.5 text-xs text-(--gray)">{formatLocation(room.property)}</p>
        <p className="mt-3 text-xs text-(--gray)">
          <strong className="text-sm text-(--blue-light)">{formatCents(room.priceCents)}</strong> / diária
        </p>
      </div>
    </Link>
  );
}
