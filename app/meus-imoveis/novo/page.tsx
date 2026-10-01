import { OwnerPage } from "@/components/owner/owner-page";
import { PropertyGeneralForm } from "@/components/owner/property-general-form";
import { SetupSteps } from "@/components/owner/setup-steps";

export default function NewPropertyPage() {
  return (
    <OwnerPage
      title="Novo imóvel"
      description="Comece pelo básico. Em seguida você informa o endereço, adiciona fotos e cadastra o primeiro quarto."
      back={{ href: "/meus-imoveis", label: "Meus imóveis" }}
    >
      <SetupSteps current="basico" missing={[]} />
      <PropertyGeneralForm />
    </OwnerPage>
  );
}
