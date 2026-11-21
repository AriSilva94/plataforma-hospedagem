import { OwnerPage } from "@/components/owner/owner-page";
import { PropertySetupForm } from "@/components/owner/property-setup-form";
import { SetupSteps } from "@/components/owner/setup-steps";
import { PageNotice } from "@/components/page-notice";
import { getCurrentUser } from "@/lib/current-user";
import { hasListingPersonalData } from "@/lib/user";

export default async function NewPropertyPage() {
  const { user } = await getCurrentUser();

  if (user && !hasListingPersonalData(user)) {
    return (
      <PageNotice
        title="Complete seus dados pessoais"
        description="Para anunciar um imóvel, informe telefone, data de nascimento, cidade e estado no seu perfil."
        actionLabel="Completar dados pessoais"
        actionHref="/perfil"
      />
    );
  }

  return (
    <OwnerPage
      title="Novo imóvel"
      description="Conte sobre o imóvel e informe o endereço. Em seguida você adiciona fotos e cadastra os quartos."
      back={{ href: "/meus-imoveis", label: "Meus imóveis" }}
    >
      <SetupSteps current="imovel" missing={[]} />
      <PropertySetupForm />
    </OwnerPage>
  );
}
