import { PropertyWizard } from "@/components/owner/property-wizard";
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

  return <PropertyWizard />;
}
