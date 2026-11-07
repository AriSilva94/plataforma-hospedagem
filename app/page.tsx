import { PublicHome } from "@/components/public-home";
import { VisitorHome } from "@/components/visitor-home";
import { getCurrentUser } from "@/lib/current-user";
import { getRoomListings } from "@/lib/room-listings";

export default async function Home() {
  const { user } = await getCurrentUser();
  if (!user) return <VisitorHome />;

  const { listing, featuredListing, favoriteRoomIds } = await getRoomListings(true);

  return <PublicHome user={user} listing={listing} featuredListing={featuredListing} favoriteRoomIds={favoriteRoomIds} />;
}
