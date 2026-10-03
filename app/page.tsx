import { PublicHome } from "@/components/public-home";
import { UserHome } from "@/components/user-home";
import { getCurrentUser } from "@/lib/current-user";
import { favoriteRoomIdsSchema } from "@/lib/favorites";
import { publicRoomPageSchema, roomListingPageSize } from "@/lib/properties";
import { getApiData } from "@/lib/server-api";

export default async function Home() {
  const { user } = await getCurrentUser();

  if (!user) return <PublicHome />;

  const [listing, favorites] = await Promise.all([
    getApiData(`/rooms?limit=${roomListingPageSize}`, publicRoomPageSchema),
    getApiData("/favorites/room-ids", favoriteRoomIdsSchema),
  ]);

  return (
    <UserHome
      user={user}
      listing={listing.status === "ok" ? listing.data : null}
      favoriteRoomIds={favorites.status === "ok" ? favorites.data.roomIds : []}
    />
  );
}
