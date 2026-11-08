import { expect, request, type APIRequestContext } from "@playwright/test";

export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";

export type AvailabilityBody = { blockedWeekdays: number[]; blockedDates: string[] };

type SeedRoom = { propertyId: string; roomId: string; ownerEmail: string };

export async function findSeedRoom(): Promise<SeedRoom> {
  const api = await request.newContext({ baseURL: apiUrl });
  const listing = await (await api.get("/rooms?limit=1")).json();
  const propertyId: string = listing.items[0].property.id;
  const property = await (await api.get(`/properties/${propertyId}`)).json();
  await api.dispose();

  const ownerNumber = /(\d+)$/.exec(property.host.name)?.[1];
  return { propertyId, roomId: property.rooms[0].id, ownerEmail: `proprietario-${ownerNumber}@seed.local` };
}

export async function loginAsOwner(email: string): Promise<APIRequestContext> {
  const api = await request.newContext({ baseURL: apiUrl });
  const response = await api.post("/auth/login", { data: { email, password: "Senha123!" } });
  expect(response.ok()).toBe(true);
  return api;
}

export async function replaceAvailability(api: APIRequestContext, roomId: string, body: AvailabilityBody) {
  const response = await api.put(`/owner/rooms/${roomId}/availability`, { data: body });
  expect(response.ok()).toBe(true);
}

export async function getPublicAvailability(roomId: string): Promise<{ today: string; windowEnd: string }> {
  const api = await request.newContext({ baseURL: apiUrl });
  const availability = await (await api.get(`/rooms/${roomId}/availability`)).json();
  await api.dispose();
  return availability;
}
