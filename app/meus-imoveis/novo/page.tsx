import { OwnerPage } from "@/components/owner/owner-page";
import { PropertyGeneralForm } from "@/components/owner/property-general-form";

export default function NewPropertyPage() {
  return (
    <OwnerPage
      title="Novo imóvel"
      description="Comece pelas informações gerais. O imóvel é salvo como rascunho e você completa localização, áreas, fotos e quartos em seguida."
      back={{ href: "/meus-imoveis", label: "Meus imóveis" }}
    >
      <PropertyGeneralForm />
    </OwnerPage>
  );
}
