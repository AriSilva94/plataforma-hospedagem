import { PageNotice } from "@/components/page-notice";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/current-user";

export default async function OwnerLayout({ children }: LayoutProps<"/meus-imoveis">) {
  const { user, unavailable } = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user} />
      {!user ? (
        unavailable ? (
          <PageNotice
            title="Meus imóveis"
            description="Não foi possível carregar seus dados agora. Tente novamente em alguns instantes."
            actionLabel="Tentar novamente"
            actionHref="/meus-imoveis"
          />
        ) : (
          <PageNotice
            title="Meus imóveis"
            description="Entre na sua conta para anunciar e administrar seus espaços."
            actionLabel="Ir para entrar"
            actionHref="/login"
          />
        )
      ) : !user.roles.includes("OWNER") ? (
        <PageNotice
          title="Anuncie seu espaço"
          description="Adicione o perfil de proprietário no seu perfil para cadastrar imóveis e quartos."
          actionLabel="Adicionar perfil de proprietário"
          actionHref="/perfil"
        />
      ) : (
        children
      )}
    </>
  );
}
