import { z } from "@/lib/zod";
import { OwnerDataNotice } from "@/components/owner/owner-notice";
import { OwnerPage } from "@/components/owner/owner-page";
import { OwnerPropertiesGrid } from "@/components/owner/owner-properties-grid";
import { getApiData } from "@/lib/server-api";
import { propertySummarySchema } from "@/lib/properties";

export default async function MyPropertiesPage() {
  const result = await getApiData("/owner/properties", z.array(propertySummarySchema));

  if (result.status !== "ok") {
    return <OwnerDataNotice status={result.status} retryHref="/meus-imoveis" />;
  }

  return (
    <OwnerPage
      title="Meus imóveis"
      description="Cadastre o imóvel como anúncio principal e adicione os quartos e suítes reserváveis dentro dele."
    >
      <OwnerPropertiesGrid properties={result.data} />
    </OwnerPage>
  );
}
