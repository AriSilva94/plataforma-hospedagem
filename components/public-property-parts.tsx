import Link from "next/link";
import type { ReactNode } from "react";
import { LuEyeOff, LuMapPin, LuMegaphone } from "react-icons/lu";
import { Chips } from "@/components/chips";
import { PageNotice } from "@/components/page-notice";
import { formatLocation, type PropertySummary } from "@/lib/properties";

export function PublicListingAside({ preview, children }: { preview: boolean; children: ReactNode }) {
  return (
    <aside className={`flex flex-col gap-4 lg:sticky lg:mt-8 ${preview ? "lg:top-36" : "lg:top-24"}`}>
      <Link
        href="/meus-imoveis/novo"
        className="flex items-center gap-2 rounded-2xl border border-(--success)/35 bg-(--success-soft) px-4 py-3 text-sm font-semibold text-(--success) transition-colors hover:border-(--success)/60"
      >
        <LuMegaphone aria-hidden="true" size={16} className="shrink-0" /> 100% Gratuito — Anuncie seu espaço
      </Link>
      {children}
    </aside>
  );
}

export function PublicPropertyLoadNotice({ notFound, retryHref }: { notFound: boolean; retryHref: string }) {
  return notFound ? (
    <PageNotice title="Local não encontrado" description="Este anúncio não existe ou não está disponível no momento." actionLabel="Voltar para o início" actionHref="/" />
  ) : (
    <PageNotice title="Não foi possível carregar" description="Tente novamente em alguns instantes." actionLabel="Tentar novamente" actionHref={retryHref} />
  );
}

export function OwnerPreviewBanner({ propertyId }: { propertyId: string }) {
  return (
    <div className="sticky top-16 z-10 border-b border-(--border) bg-(--surface-raised) px-4 py-3 sm:px-6 md:top-18">
      <p className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-sm text-(--text-secondary)">
        <span>Prévia: é assim que os hóspedes veem este anúncio.</span>
        <Link href={`/meus-imoveis/${propertyId}`} className="font-semibold text-(--text-primary) underline underline-offset-4 hover:text-(--primary-text)">
          Voltar ao gerenciamento
        </Link>
      </p>
    </div>
  );
}

export function PublicLocation({
  property,
}: {
  property: Pick<PropertySummary, "neighborhood" | "city" | "state"> & { referencePoints: string[] };
}) {
  return (
    <>
      <p className="flex items-center gap-2 text-sm text-(--text-primary)">
        <LuMapPin aria-hidden="true" size={16} className="shrink-0" /> {formatLocation(property)}
      </p>
      {property.referencePoints.length > 0 ? (
        <div className="mt-4">
          <Chips items={property.referencePoints} />
        </div>
      ) : null}
      <p className="mt-4 flex items-center gap-2 text-[13px] text-(--text-secondary)">
        <LuEyeOff aria-hidden="true" size={14} className="shrink-0" /> A localização exata não é exibida publicamente.
      </p>
    </>
  );
}
