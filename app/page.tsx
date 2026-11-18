import { PublicHome } from "@/components/public-home";
import { VisitorHome } from "@/components/visitor-home";
import { getCurrentUser } from "@/lib/current-user";
import { getRoomListings, getStories } from "@/lib/room-listings";

export default async function Home() {
  const { user } = await getCurrentUser();
  if (!user) return <VisitorHome />;

  const [{ listing, featuredListing, favoriteRoomIds }, stories] = await Promise.all([getRoomListings(true), getStories()]);

  return <PublicHome user={user} listing={listing} featuredListing={featuredListing} stories={stories} favoriteRoomIds={favoriteRoomIds} />;
}
