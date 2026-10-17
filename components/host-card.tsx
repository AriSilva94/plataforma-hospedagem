import Link from "next/link";
import type { IconType } from "react-icons";
import { LuBadgeCheck, LuChevronRight, LuMapPin } from "react-icons/lu";
import { MotelTag } from "@/components/motel-tag";
import { initialsOf } from "@/lib/initials";

export function HostCard({
  hostId,
  hostName,
  verified,
  motel,
  roomTitle,
  location,
  highlights,
}: {
  hostId: string;
  hostName: string;
  verified: boolean;
  motel: boolean;
  roomTitle: string;
  location: string;
  highlights?: { icon: IconType; label: string }[];
}) {
  return (
    <section className="border-t border-(--border) py-8">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-(--primary) text-sm font-bold text-(--on-primary)">
          {initialsOf(hostName)}
        </span>
        <div>
          <p className="text-sm font-semibold text-(--text-primary)">Anunciado por {hostName}</p>
          {verified ? (
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-(--success)">
              <LuBadgeCheck aria-hidden="true" size={14} /> Quarto verificado
            </p>
          ) : null}
        </div>
        <Link
          href={`/anfitriao/${hostId}`}
          className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-(--primary-text) transition-colors hover:text-(--text-primary)"
        >
          Ver perfil <LuChevronRight aria-hidden="true" size={14} />
        </Link>
      </div>

      <div className="mt-6">
        {motel ? (
          <div className="mb-3">
            <MotelTag />
          </div>
        ) : null}
        <h1 className="wrap-break-word text-2xl font-extrabold tracking-tight text-(--text-primary)">{roomTitle}</h1>
        <p className="mt-2 flex items-center gap-2 text-sm text-(--text-secondary)">
          <LuMapPin aria-hidden="true" size={16} className="shrink-0" /> {location}
        </p>
      </div>

      {highlights && highlights.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {highlights.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-(--border) px-3 py-1.5 text-xs font-semibold text-(--text-primary)">
              <Icon aria-hidden="true" size={14} className="text-(--primary-text)" /> {label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
