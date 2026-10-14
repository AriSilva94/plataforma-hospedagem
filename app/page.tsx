import { PublicHome } from "@/components/public-home";
import { getCurrentUser } from "@/lib/current-user";
import { getRoomListings } from "@/lib/room-listings";

export default async function Home() {
  const { user } = await getCurrentUser();
  const { listing, featuredListing, favoriteRoomIds } = await getRoomListings(Boolean(user));

  return <PublicHome user={user} listing={listing} featuredListing={featuredListing} favoriteRoomIds={favoriteRoomIds} />;
}
