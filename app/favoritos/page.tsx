import type { Metadata } from "next";
import { FavoritesGrid } from "@/components/favorites-grid";
import { PageNotice } from "@/components/page-notice";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/current-user";
import { favoriteListSchema } from "@/lib/favorites";
import { loginHref } from "@/lib/return-path";
import { getApiData } from "@/lib/server-api";

export const metadata: Metadata = { title: "Favoritos | DOMUS X" };

export default async function FavoritesPage() {
  const { user, unavailable } = await getCurrentUser();

  if (!user) {
    return (
      <>
        <SiteHeader user={user} />
        {unavailable ? (
          <PageNotice title="Favoritos" description="Não foi possível carregar seus dados agora. Tente novamente em alguns instantes." actionLabel="Tentar novamente" actionHref="/favoritos" />
        ) : (
          <PageNotice title="Favoritos" description="Entre na sua conta para salvar quartos e encontrá-los aqui depois." actionLabel="Ir para entrar" actionHref={loginHref("/favoritos")} />
        )}
      </>
    );
  }

  const result = await getApiData("/favorites", favoriteListSchema);

  if (result.status !== "ok") {
    return (
      <>
        <SiteHeader user={user} />
        <PageNotice title="Favoritos" description="Não foi possível carregar seus favoritos agora. Tente novamente em alguns instantes." actionLabel="Tentar novamente" actionHref="/favoritos" />
      </>
    );
  }

  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-360 px-6 pt-8 pb-28 md:px-10 md:pt-12 md:pb-16 lg:px-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-(--text-primary)">Favoritos</h1>
        <FavoritesGrid items={result.data.items} />
      </main>
    </>
  );
}
