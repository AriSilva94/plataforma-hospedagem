import { brazilianStates } from "@/lib/properties";
import { z } from "@/lib/zod";

export const homeSearchSchema = z.object({
  location: z.string().min(1, { error: "Selecione uma cidade da lista." }),
  checkIn: z.string(),
});

export type HomeSearchValues = z.infer<typeof homeSearchSchema>;

export const citySuggestionsSchema = z.array(z.object({ city: z.string(), state: z.string() }));

export type CityLocation = { city: string; state: string };

const locationSeparator = "|";

export function toLocationValue({ city, state }: CityLocation) {
  return `${city}${locationSeparator}${state}`;
}

export function fromLocationValue(value: string): CityLocation {
  const [city = "", state = ""] = value.split(locationSeparator);
  return { city, state };
}

export function listingLocation(cidade: unknown, uf: unknown): CityLocation | undefined {
  if (typeof cidade !== "string" || typeof uf !== "string") return undefined;
  const city = cidade.trim();
  const state = uf.trim().toUpperCase();
  return city && brazilianStates.some((item) => item === state) ? { city, state } : undefined;
}

export function locationQuery(location: CityLocation | undefined) {
  return location ? `&${new URLSearchParams({ city: location.city, state: location.state }).toString()}` : "";
}
