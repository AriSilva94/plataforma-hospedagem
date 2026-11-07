import type { Metadata } from "next";
import Link from "next/link";
import { FeaturedRooms } from "@/components/featured-rooms";
import { RoomListing } from "@/components/room-listing";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/current-user";
import { listingLocation } from "@/lib/home-search";
import { getRoomListings } from "@/lib/room-listings";

export async function generateMetadata({ searchParams }: PageProps<"/anuncios">): Promise<Metadata> {
  const { cidade, uf } = await searchParams;
  const location = listingLocation(cidade, uf);
  return { title: location ? `Quartos em ${location.city} – ${location.state} | DOMUS X` : "Anúncios | DOMUS X" };
}

export default async function AnnouncementsPage({ searchParams }: PageProps<"/anuncios">) {
  const [{ user }, { cidade, uf }] = await Promise.all([getCurrentUser(), searchParams]);
  const location = listingLocation(cidade, uf);
  const { listing, featuredListing, favoriteRoomIds } = await getRoomListings(Boolean(user), location);

  const featuredRooms = featuredListing?.items ?? [];
  const total = (listing?.total ?? 0) + (featuredListing?.total ?? 0);
  const locationLabel = location ? `${location.city} – ${location.state}` : undefined;

  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-360 px-6 pt-8 pb-28 md:px-10 md:pt-12 md:pb-16 lg:px-12">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-(--text-primary)">{locationLabel ? `Quartos em ${locationLabel}` : "Anúncios"}</h1>
          {total > 0 ? (
            <p className="mt-1 text-sm text-(--text-secondary)">{total === 1 ? "1 quarto disponível." : `${total} quartos disponíveis.`}</p>
          ) : null}
        </div>

        {locationLabel && listing && total === 0 ? (
          <div className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-3 rounded-2xl border border-dashed border-(--border) p-6 text-center">
            <p className="text-sm text-(--text-secondary)">Nenhum quarto disponível em {locationLabel} ainda.</p>
            <Link
              href="/anuncios"
              className="text-sm font-bold text-(--primary-text) underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
            >
              Ver todos os anúncios
            </Link>
          </div>
        ) : (
          <>
            {featuredRooms.length > 0 ? (
              <section aria-labelledby="destaques-titulo" className="mt-10">
                <h2 id="destaques-titulo" className="text-xl font-bold text-(--text-primary)">Em destaque</h2>
                <FeaturedRooms rooms={featuredRooms} favoriteRoomIds={favoriteRoomIds} signedIn={Boolean(user)} />
              </section>
            ) : null}

            <section aria-labelledby="todos-titulo" className="mt-12">
              <h2 id="todos-titulo" className="text-xl font-bold text-(--text-primary)">Todos os anúncios</h2>
              <RoomListing key={locationLabel ?? ""} initial={listing} favoriteRoomIds={favoriteRoomIds} signedIn={Boolean(user)} location={location} />
            </section>
          </>
        )}
      </main>
    </>
  );
}
