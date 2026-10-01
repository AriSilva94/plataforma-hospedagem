import { PublicHome } from "@/components/public-home";
import { UserHome } from "@/components/user-home";
import { getCurrentUser } from "@/lib/current-user";
import { publicRoomPageSchema, roomListingPageSize } from "@/lib/properties";
import { getApiData } from "@/lib/server-api";

export default async function Home() {
  const { user } = await getCurrentUser();

  if (!user) return <PublicHome />;

  const listing = await getApiData(`/rooms?limit=${roomListingPageSize}`, publicRoomPageSchema);

  return <UserHome user={user} listing={listing.status === "ok" ? listing.data : null} />;
}
