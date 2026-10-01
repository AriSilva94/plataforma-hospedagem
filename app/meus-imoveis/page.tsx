import Link from "next/link";
import { z } from "zod";
import { LuBedDouble, LuHousePlus, LuMapPin, LuPlus } from "react-icons/lu";
import { CoverImage } from "@/components/owner/cover-image";
import { OwnerDataNotice } from "@/components/owner/owner-notice";
import { OwnerPage } from "@/components/owner/owner-page";
import { PropertyStatusBadge } from "@/components/owner/property-status-badge";
import { primaryButtonClassName } from "@/components/owner/styles";
import { getApiData } from "@/lib/server-api";
import { formatCents, formatLocation, propertySummarySchema, propertyTypeLabels } from "@/lib/properties";

export default async function MyPropertiesPage() {
  const result = await getApiData("/owner/properties", z.array(propertySummarySchema));

  if (result.status !== "ok") {
    return <OwnerDataNotice status={result.status} retryHref="/meus-imoveis" />;
  }

  const properties = result.data;
  const newPropertyLink = (
    <Link href="/meus-imoveis/novo" className={primaryButtonClassName}>
      <LuPlus aria-hidden="true" size={17} />
      Novo imóvel
    </Link>
  );

  return (
    <OwnerPage
      title="Meus imóveis"
      description="Cadastre o imóvel como anúncio principal e adicione os quartos e suítes reserváveis dentro dele."
      actions={properties.length > 0 ? newPropertyLink : undefined}
    >
      {properties.length === 0 ? (
        <section className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-dashed border-(--line-strong) bg-(--surface) p-6 sm:p-10">
          <span className="flex size-12 items-center justify-center rounded-xl bg-(--surface-raised) text-(--blue-light)">
            <LuHousePlus aria-hidden="true" size={24} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-white">Nenhum imóvel cadastrado</h2>
            <p className="mt-1 max-w-prose text-sm leading-relaxed text-(--gray)">
              Comece pelo básico. O imóvel fica como rascunho até você informar endereço, fotos e o primeiro quarto e publicar.
            </p>
          </div>
          {newPropertyLink}
        </section>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <li key={property.id}>
              <Link
                href={`/meus-imoveis/${property.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-(--line-strong) bg-(--surface) transition-colors hover:border-(--blue-light) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light)"
              >
                <CoverImage url={property.coverUrl} alt="" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 wrap-break-word text-lg font-bold text-white">{property.title}</h2>
                    <PropertyStatusBadge status={property.status} />
                  </div>
                  <p className="flex flex-wrap items-center gap-2 text-sm text-(--gray)">
                    {propertyTypeLabels[property.type]}
                  </p>
                  <div className="mt-auto flex flex-col gap-2 border-t border-(--line) pt-3 text-sm text-(--gray)">
                    <span className="flex items-center gap-2">
                      <LuMapPin aria-hidden="true" size={15} className="shrink-0" />
                      {formatLocation(property)}
                    </span>
                    <span className="flex items-center gap-2">
                      <LuBedDouble aria-hidden="true" size={15} className="shrink-0" />
                      {property.roomCount === 1 ? "1 quarto" : `${property.roomCount} quartos`} · {property.availableRoomCount} {property.availableRoomCount === 1 ? "reservável" : "reserváveis"}
                    </span>
                    {property.minAvailablePriceCents !== null ? (
                      <span className="font-semibold text-white">
                        <span className="font-normal text-(--gray)">a partir de </span>
                        {formatCents(property.minAvailablePriceCents)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </OwnerPage>
  );
}
