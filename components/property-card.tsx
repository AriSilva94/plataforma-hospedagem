import Image from "next/image";
import Link from "next/link";
import { LuImage, LuStar } from "react-icons/lu";
import { formatCents, formatLocation, propertyTypeLabels, type PublicPropertyCard } from "@/lib/properties";

export function PropertyCard({ property }: { property: PublicPropertyCard }) {
  return (
    <Link
      href={`/imoveis/${property.id}`}
      className="group block overflow-hidden rounded-2xl border border-(--line) bg-(--surface) transition-colors hover:border-(--blue-light) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light)"
    >
      <div className="relative aspect-4/3 bg-(--surface-raised)">
        {property.coverUrl ? (
          <Image src={property.coverUrl} alt="" fill unoptimized className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
        ) : (
          <div className="flex size-full items-center justify-center text-(--gray)">
            <LuImage aria-hidden="true" size={28} />
          </div>
        )}
        {property.featured ? (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-[rgba(3,17,40,.7)] px-2.5 py-1 text-[11px] font-bold text-white">
            <LuStar aria-hidden="true" size={12} className="text-(--warning)" fill="currentColor" /> Destaque
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="wrap-break-word text-sm font-bold text-white">{property.title}</h3>
        <p className="mt-1 text-xs text-(--gray)">
          {propertyTypeLabels[property.type]} · {formatLocation(property)}
        </p>
        <p className="mt-3 text-xs text-(--gray)">
          A partir de <strong className="text-sm text-(--blue-light)">{formatCents(property.startingPriceCents)}</strong> / diária
        </p>
      </div>
    </Link>
  );
}
