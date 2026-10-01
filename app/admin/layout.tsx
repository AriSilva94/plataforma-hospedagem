import { PageNotice } from "@/components/page-notice";
import { SiteHeader } from "@/components/site-header";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/current-user";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { user, unavailable } = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user} />
      {!user ? (
        unavailable ? (
          <PageNotice title="Administração" description="Não foi possível carregar seus dados agora. Tente novamente em alguns instantes." actionLabel="Tentar novamente" actionHref="/admin" />
        ) : (
          <PageNotice title="Administração" description="Entre na sua conta para acessar a administração." actionLabel="Ir para entrar" actionHref="/login" />
        )
      ) : !isAdmin(user) ? (
        <PageNotice title="Acesso restrito" description="Esta área é exclusiva da administração da plataforma." actionLabel="Voltar ao início" actionHref="/" />
      ) : (
        children
      )}
    </>
  );
}
