import { z } from "zod";

export const propertyTypes = ["HOUSE", "APARTMENT", "TOWNHOUSE", "STUDIO", "SHARED_HOUSE", "OTHER"] as const;
export const propertyStatuses = ["DRAFT", "ACTIVE", "UNAVAILABLE"] as const;
export const roomStatuses = ["AVAILABLE", "UNAVAILABLE", "INACTIVE"] as const;
export const bathroomTypes = ["PRIVATE", "SHARED"] as const;
export const genderIdentities = ["MAN", "WOMAN", "TRANS_WOMAN", "TRANS_MAN"] as const;
export const sharedAreaTypes = ["LIVING_ROOM", "KITCHEN", "SHARED_BATHROOM", "LAUNDRY", "OUTDOOR_AREA", "GARAGE", "OTHER"] as const;
export const propertyFeatures = ["WIFI", "ELEVATOR", "DOORMAN", "GATED_ACCESS", "SECURITY_CAMERAS", "ACCESSIBILITY", "PETS_ALLOWED", "SMOKING_ALLOWED", "CLEANING_SERVICE", "UTILITIES_INCLUDED"] as const;
export const roomAmenities = ["AIR_CONDITIONING", "FAN", "DOUBLE_BED", "SINGLE_BED", "WARDROBE", "DESK", "TV", "MINIBAR", "WINDOW", "BALCONY", "BLACKOUT_CURTAINS", "DOOR_LOCK", "BED_LINEN", "TOWELS"] as const;
export const brazilianStates = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"] as const;

export type PropertyType = (typeof propertyTypes)[number];
export type PropertyStatus = (typeof propertyStatuses)[number];
export type RoomStatus = (typeof roomStatuses)[number];
export type BathroomType = (typeof bathroomTypes)[number];
export type GenderIdentity = (typeof genderIdentities)[number];
export type SharedAreaType = (typeof sharedAreaTypes)[number];

export const propertyTypeLabels: Record<PropertyType, string> = {
  HOUSE: "Casa",
  APARTMENT: "Apartamento",
  TOWNHOUSE: "Sobrado",
  STUDIO: "Studio / kitnet",
  SHARED_HOUSE: "Pensão / república",
  OTHER: "Outro",
};

export const propertyStatusLabels: Record<PropertyStatus, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  UNAVAILABLE: "Indisponível",
};

export const roomStatusLabels: Record<RoomStatus, string> = {
  AVAILABLE: "Disponível",
  UNAVAILABLE: "Indisponível",
  INACTIVE: "Inativo",
};

export const bathroomTypeLabels: Record<BathroomType, string> = {
  PRIVATE: "Privativo",
  SHARED: "Compartilhado",
};

export const genderIdentityLabels: Record<GenderIdentity, string> = {
  MAN: "Homem",
  WOMAN: "Mulher",
  TRANS_WOMAN: "Mulher trans",
  TRANS_MAN: "Homem trans",
};

export const sharedAreaTypeLabels: Record<SharedAreaType, string> = {
  LIVING_ROOM: "Sala",
  KITCHEN: "Cozinha",
  SHARED_BATHROOM: "Banheiro social",
  LAUNDRY: "Lavanderia",
  OUTDOOR_AREA: "Área externa",
  GARAGE: "Garagem",
  OTHER: "Outra área",
};

export const propertyFeatureLabels: Record<(typeof propertyFeatures)[number], string> = {
  WIFI: "Wi-Fi",
  ELEVATOR: "Elevador",
  DOORMAN: "Portaria",
  GATED_ACCESS: "Acesso controlado",
  SECURITY_CAMERAS: "Câmeras de segurança",
  ACCESSIBILITY: "Acessibilidade",
  PETS_ALLOWED: "Aceita pets",
  SMOKING_ALLOWED: "Permite fumar",
  CLEANING_SERVICE: "Limpeza das áreas comuns",
  UTILITIES_INCLUDED: "Contas inclusas",
};

export const roomAmenityLabels: Record<(typeof roomAmenities)[number], string> = {
  AIR_CONDITIONING: "Ar-condicionado",
  FAN: "Ventilador",
  DOUBLE_BED: "Cama de casal",
  SINGLE_BED: "Cama de solteiro",
  WARDROBE: "Guarda-roupa",
  DESK: "Mesa de trabalho",
  TV: "TV",
  MINIBAR: "Frigobar",
  WINDOW: "Janela",
  BALCONY: "Sacada",
  BLACKOUT_CURTAINS: "Cortina blackout",
  DOOR_LOCK: "Fechadura na porta",
  BED_LINEN: "Roupa de cama",
  TOWELS: "Toalhas",
};

export const mediaSchema = z.object({
  id: z.string(),
  type: z.enum(["IMAGE", "VIDEO"]),
  url: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  position: z.number(),
});

export const propertySummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(propertyTypes),
  status: z.enum(propertyStatuses),
  featured: z.boolean(),
  neighborhood: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  coverUrl: z.string().nullable(),
  roomCount: z.number(),
});

export const roomSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(roomStatuses),
  priceCents: z.number(),
  capacity: z.number(),
  bathroomType: z.enum(bathroomTypes),
  acceptedAudiences: z.array(z.enum(genderIdentities)),
  coverUrl: z.string().nullable(),
});

export const propertyDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(propertyTypes),
  status: z.enum(propertyStatuses),
  featured: z.boolean(),
  description: z.string().nullable(),
  houseRules: z.string().nullable(),
  generalInfo: z.string().nullable(),
  features: z.array(z.string()),
  postalCode: z.string().nullable(),
  street: z.string().nullable(),
  number: z.string().nullable(),
  complement: z.string().nullable(),
  neighborhood: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  referencePoints: z.array(z.string()),
  sharedAreas: z.array(
    z.object({
      id: z.string(),
      type: z.enum(sharedAreaTypes),
      label: z.string().nullable(),
      description: z.string().nullable(),
    }),
  ),
  media: z.array(mediaSchema),
  rooms: z.array(roomSummarySchema),
});

export const roomDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(roomStatuses),
  description: z.string().nullable(),
  priceCents: z.number(),
  capacity: z.number(),
  bathroomType: z.enum(bathroomTypes),
  acceptedAudiences: z.array(z.enum(genderIdentities)),
  amenities: z.array(z.string()),
  additionalInfo: z.string().nullable(),
  media: z.array(mediaSchema),
  property: z.object({ id: z.string(), title: z.string() }),
});

export const publicPropertyCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(propertyTypes),
  featured: z.boolean(),
  neighborhood: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  coverUrl: z.string().nullable(),
  startingPriceCents: z.number(),
});

export const publicPropertyPageSchema = z.object({
  items: z.array(publicPropertyCardSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
});

export const publicPropertyDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(propertyTypes),
  description: z.string().nullable(),
  houseRules: z.string().nullable(),
  generalInfo: z.string().nullable(),
  features: z.array(z.string()),
  neighborhood: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  referencePoints: z.array(z.string()),
  sharedAreas: z.array(
    z.object({
      type: z.enum(sharedAreaTypes),
      label: z.string().nullable(),
      description: z.string().nullable(),
    }),
  ),
  media: z.array(mediaSchema),
  rooms: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      priceCents: z.number(),
      capacity: z.number(),
      bathroomType: z.enum(bathroomTypes),
      acceptedAudiences: z.array(z.enum(genderIdentities)),
      amenities: z.array(z.string()),
      additionalInfo: z.string().nullable(),
      media: z.array(mediaSchema),
    }),
  ),
});

export type Media = z.infer<typeof mediaSchema>;
export type PublicPropertyCard = z.infer<typeof publicPropertyCardSchema>;
export type PublicPropertyPage = z.infer<typeof publicPropertyPageSchema>;
export type PublicPropertyDetail = z.infer<typeof publicPropertyDetailSchema>;
export type PropertySummary = z.infer<typeof propertySummarySchema>;
export type PropertyDetail = z.infer<typeof propertyDetailSchema>;
export type RoomDetail = z.infer<typeof roomDetailSchema>;

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatCents(cents: number): string {
  return currency.format(cents / 100);
}

export function formatLocation({ neighborhood, city, state }: Pick<PropertySummary, "neighborhood" | "city" | "state">): string {
  return [neighborhood, [city, state].filter(Boolean).join(" · ")].filter(Boolean).join(", ") || "Localização não informada";
}

export function labelOf(labels: Partial<Record<string, string>>, key: string): string {
  return labels[key] ?? key;
}
