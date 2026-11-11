import { cache } from "react";
import { favoriteRoomIdsSchema } from "@/lib/favorites";
import { citySuggestionsSchema, type CityLocation } from "@/lib/home-search";
import { publicRoomPageSchema, roomListingPageSize } from "@/lib/properties";
import { getApiData } from "@/lib/server-api";

function cityKey(city: string) {
  return city.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export const resolveCity = cache(async (city: string, state: string): Promise<CityLocation | null> => {
  if (city.length < 2 || city.length > 60) return null;
  const result = await getApiData(`/locations/cities?${new URLSearchParams({ q: city }).toString()}`, citySuggestionsSchema);
  if (result.status !== "ok") return null;
  const key = cityKey(city);
  return result.data.find((candidate) => candidate.state === state && cityKey(candidate.city) === key) ?? null;
});

export async function getFavoriteRoomIds(signedIn: boolean): Promise<string[]> {
  if (!signedIn) return [];
  const favorites = await getApiData("/favorites/room-ids", favoriteRoomIdsSchema);
  return favorites.status === "ok" ? favorites.data.roomIds : [];
}

export async function getRoomListings(signedIn: boolean, filter = "") {
  const [listing, featuredListing, favoriteRoomIds] = await Promise.all([
    getApiData(`/rooms?limit=${roomListingPageSize}${filter}`, publicRoomPageSchema),
    getApiData(`/rooms/featured?limit=${roomListingPageSize}${filter}`, publicRoomPageSchema),
    getFavoriteRoomIds(signedIn),
  ]);

  return {
    listing: listing.status === "ok" ? listing.data : null,
    featuredListing: featuredListing.status === "ok" ? featuredListing.data : null,
    favoriteRoomIds,
  };
}
