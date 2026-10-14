import { favoriteRoomIdsSchema } from "@/lib/favorites";
import { publicRoomPageSchema, roomListingPageSize } from "@/lib/properties";
import { getApiData } from "@/lib/server-api";

export async function getFavoriteRoomIds(signedIn: boolean): Promise<string[]> {
  if (!signedIn) return [];
  const favorites = await getApiData("/favorites/room-ids", favoriteRoomIdsSchema);
  return favorites.status === "ok" ? favorites.data.roomIds : [];
}

export async function getRoomListings(signedIn: boolean) {
  const [listing, featuredListing, favoriteRoomIds] = await Promise.all([
    getApiData(`/rooms?limit=${roomListingPageSize}`, publicRoomPageSchema),
    getApiData(`/rooms/featured?limit=${roomListingPageSize}`, publicRoomPageSchema),
    getFavoriteRoomIds(signedIn),
  ]);

  return {
    listing: listing.status === "ok" ? listing.data : null,
    featuredListing: featuredListing.status === "ok" ? featuredListing.data : null,
    favoriteRoomIds,
  };
}
