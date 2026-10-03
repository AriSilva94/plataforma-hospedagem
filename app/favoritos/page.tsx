import type { Metadata } from "next";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { PageNotice } from "@/components/page-notice";
import { RoomCard } from "@/components/room-card";
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

  const items = result.data.items;
  const unavailableCount = items.filter((item) => !item.available).length;

  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-360 px-6 pt-8 pb-28 md:px-10 md:pt-12 md:pb-16 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Favoritos</h1>
            {items.length > 0 ? (
              <p className="mt-1 text-sm text-(--gray)">
                {items.length === 1 ? "1 quarto salvo" : `${items.length} quartos salvos`}
                {unavailableCount === 1 ? " · 1 indisponível no momento" : unavailableCount > 1 ? ` · ${unavailableCount} indisponíveis no momento` : ""}
              </p>
            ) : null}
          </div>
        </div>

        {items.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-dashed border-(--line-strong) p-8 text-center">
            <h2 className="text-lg font-bold text-white">Nenhum quarto salvo ainda</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-(--gray)">
              Toque no coração de um quarto para guardar aqui e comparar com calma depois.
            </p>
            <Link
              href="/#todos"
              className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-(--blue) px-5 text-sm font-bold text-white transition-colors hover:bg-(--blue-light) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light)"
            >
              Ver quartos disponíveis
            </Link>
          </section>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <li key={item.roomId}>
                <RoomCard
                  room={{ id: item.roomId, title: item.title, priceCents: item.priceCents, coverUrl: item.coverUrl, featured: false, property: item.property }}
                  unavailable={!item.available}
                  action={
                    <FavoriteButton
                      roomId={item.roomId}
                      roomTitle={item.title}
                      initialFavorited
                      signedIn
                      loginReturnPath="/favoritos"
                      refreshOnChange
                    />
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
