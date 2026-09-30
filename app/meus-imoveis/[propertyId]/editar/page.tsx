import { MediaGallery } from "@/components/owner/media-gallery";
import { OwnerDataNotice } from "@/components/owner/owner-notice";
import { OwnerPage } from "@/components/owner/owner-page";
import { PropertyGeneralForm } from "@/components/owner/property-general-form";
import { PropertyLocationForm } from "@/components/owner/property-location-form";
import { PropertyStatusBadge } from "@/components/owner/property-status-badge";
import { SectionTabs } from "@/components/owner/section-tabs";
import { SharedAreasForm } from "@/components/owner/shared-areas-form";
import { getApiData } from "@/lib/server-api";
import { propertyDetailSchema } from "@/lib/properties";

const sections = [
  { id: "geral", label: "Sobre o imóvel" },
  { id: "localizacao", label: "Localização" },
  { id: "areas", label: "Áreas" },
  { id: "midia", label: "Fotos e vídeos" },
] as const;

export default async function EditPropertyPage({ params, searchParams }: PageProps<"/meus-imoveis/[propertyId]/editar">) {
  const [{ propertyId }, { secao }] = await Promise.all([params, searchParams]);
  const section = sections.find((item) => item.id === secao)?.id ?? "geral";
  const result = await getApiData(`/owner/properties/${propertyId}`, propertyDetailSchema);

  if (result.status !== "ok") {
    return <OwnerDataNotice status={result.status} retryHref={`/meus-imoveis/${propertyId}/editar?secao=${section}`} />;
  }

  const property = result.data;

  return (
    <OwnerPage
      title={property.title}
      eyebrow={<PropertyStatusBadge status={property.status} />}
      description="Edite cada grupo de informações separadamente. As alterações são salvas por seção."
      back={{ href: `/meus-imoveis/${property.id}`, label: "Detalhes do imóvel" }}
    >
      <SectionTabs
        label="Seções do imóvel"
        current={section}
        tabs={sections.map((item) => ({ ...item, href: `/meus-imoveis/${property.id}/editar?secao=${item.id}` }))}
      />
      {section === "geral" ? <PropertyGeneralForm key={property.id} property={property} /> : null}
      {section === "localizacao" ? <PropertyLocationForm property={property} /> : null}
      {section === "areas" ? <SharedAreasForm property={property} /> : null}
      {section === "midia" ? (
        <MediaGallery basePath={`/owner/properties/${property.id}`} initialMedia={property.media} allowVideo maxImages={30} maxVideos={3} />
      ) : null}
    </OwnerPage>
  );
}
