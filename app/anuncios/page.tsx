import type { Metadata } from "next";
import { FeaturedRooms } from "@/components/featured-rooms";
import { RoomListing } from "@/components/room-listing";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/current-user";
import { getRoomListings } from "@/lib/room-listings";

export const metadata: Metadata = { title: "Anúncios | DOMUS X" };

export default async function AnnouncementsPage() {
  const { user } = await getCurrentUser();
  const { listing, featuredListing, favoriteRoomIds } = await getRoomListings(Boolean(user));

  const featuredRooms = featuredListing?.items ?? [];
  const total = (listing?.total ?? 0) + (featuredListing?.total ?? 0);

  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-360 px-6 pt-8 pb-28 md:px-10 md:pt-12 md:pb-16 lg:px-12">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-(--text-primary)">Anúncios</h1>
          {total > 0 ? (
            <p className="mt-1 text-sm text-(--text-secondary)">{total === 1 ? "1 quarto disponível." : `${total} quartos disponíveis.`}</p>
          ) : null}
        </div>

        {featuredRooms.length > 0 ? (
          <section aria-labelledby="destaques-titulo" className="mt-10">
            <h2 id="destaques-titulo" className="text-xl font-bold text-(--text-primary)">Em destaque</h2>
            <FeaturedRooms rooms={featuredRooms} favoriteRoomIds={favoriteRoomIds} signedIn={Boolean(user)} />
          </section>
        ) : null}

        <section aria-labelledby="todos-titulo" className="mt-12">
          <h2 id="todos-titulo" className="text-xl font-bold text-(--text-primary)">Todos os anúncios</h2>
          <RoomListing initial={listing} favoriteRoomIds={favoriteRoomIds} signedIn={Boolean(user)} />
        </section>
      </main>
    </>
  );
}
