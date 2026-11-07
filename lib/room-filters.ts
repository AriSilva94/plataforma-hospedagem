import { listingLocation, type CityLocation } from "@/lib/home-search";
import type { GenderIdentity, PropertyType } from "@/lib/properties";

export type RoomFilters = {
  location?: CityLocation;
  types: PropertyType[];
  maxPrice?: number;
  audience?: GenderIdentity;
};

const propertyTypeSlugs: Record<PropertyType, string> = {
  HOUSE: "casa",
  APARTMENT: "apartamento",
  MOTEL: "motel",
};

const audienceSlugs: Record<GenderIdentity, string> = {
  MAN: "homem",
  WOMAN: "mulher",
  TRANS_WOMAN: "mulher-trans",
  TRANS_MAN: "homem-trans",
};

export const priceRangeMax = 2_000;
export const priceRangeStep = 10;

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function formatPrice(value: number) {
  return currency.format(value);
}

export function activeFilterCount({ types, maxPrice, audience }: RoomFilters) {
  return [types.length > 0, maxPrice !== undefined, audience !== undefined].filter(Boolean).length;
}

function fromSlug<T extends string>(slugs: Record<T, string>, slug: string) {
  return (Object.keys(slugs) as T[]).find((key) => slugs[key] === slug);
}

function price(value: unknown) {
  const parsed = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : NaN;
  return parsed >= priceRangeStep && parsed < priceRangeMax ? parsed : undefined;
}

const filterSearchKeys = ["cidade", "uf", "tipo", "preco_max", "publico"];

export function filtersSearch(current: string, { location, types, maxPrice, audience }: RoomFilters) {
  const params = new URLSearchParams(current);
  for (const key of filterSearchKeys) params.delete(key);
  if (location) {
    params.set("cidade", location.city);
    params.set("uf", location.state);
  }
  if (types.length) params.set("tipo", types.map((type) => propertyTypeSlugs[type]).join(","));
  if (maxPrice !== undefined) params.set("preco_max", String(maxPrice));
  if (audience) params.set("publico", audienceSlugs[audience]);
  return params.toString();
}

export function parseRoomFilters(params: Record<string, string | string[] | undefined>): RoomFilters {
  const types = typeof params.tipo === "string" ? params.tipo.split(",").flatMap((slug) => fromSlug(propertyTypeSlugs, slug) ?? []) : [];
  const maxPrice = price(params.preco_max);
  return {
    location: listingLocation(params.cidade, params.uf),
    types: [...new Set(types)],
    maxPrice,
    audience: typeof params.publico === "string" ? fromSlug(audienceSlugs, params.publico) : undefined,
  };
}

export function roomFiltersQuery({ location, types, maxPrice, audience }: RoomFilters) {
  const params = new URLSearchParams();
  if (location) {
    params.set("city", location.city);
    params.set("state", location.state);
  }
  if (types.length) params.set("types", types.join(","));
  if (maxPrice !== undefined) params.set("maxPriceCents", String(maxPrice * 100));
  if (audience) params.set("audience", audience);
  const query = params.toString();
  return query ? `&${query}` : "";
}
