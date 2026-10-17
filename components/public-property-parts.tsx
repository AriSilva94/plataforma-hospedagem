import { LuEyeOff, LuMapPin } from "react-icons/lu";
import { Chips } from "@/components/chips";
import { PageNotice } from "@/components/page-notice";
import { formatLocation, type PropertySummary } from "@/lib/properties";

export function PublicPropertyLoadNotice({ notFound, retryHref }: { notFound: boolean; retryHref: string }) {
  return notFound ? (
    <PageNotice title="Local não encontrado" description="Este anúncio não existe ou não está disponível no momento." actionLabel="Voltar para o início" actionHref="/" />
  ) : (
    <PageNotice title="Não foi possível carregar" description="Tente novamente em alguns instantes." actionLabel="Tentar novamente" actionHref={retryHref} />
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
