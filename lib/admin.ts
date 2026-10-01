import { z } from "zod";
import { propertyStatuses, propertyTypes, roomStatuses } from "@/lib/properties";

export const ADMIN_PAGE_SIZE = 20;

export const featuringStatuses = ["NONE", "SCHEDULED", "ACTIVE", "ENDED"] as const;
export const userRoles = ["GUEST", "OWNER", "AFFILIATE", "ADMIN"] as const;
export const userStatuses = ["ACTIVE", "INACTIVE"] as const;

export type FeaturingStatus = (typeof featuringStatuses)[number];
export type UserRole = (typeof userRoles)[number];
export type UserStatus = (typeof userStatuses)[number];

export const featuringStatusLabels: Record<FeaturingStatus, string> = {
  NONE: "Sem destaque",
  SCHEDULED: "Agendado",
  ACTIVE: "Em destaque",
  ENDED: "Encerrado",
};

export const userRoleLabels: Record<UserRole, string> = {
  GUEST: "Hóspede",
  OWNER: "Proprietário",
  AFFILIATE: "Afiliado",
  ADMIN: "Administrador",
};

export const userStatusLabels: Record<UserStatus, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
};

function pageSchema<T extends z.ZodType>(item: T) {
  return z.object({ items: z.array(item), page: z.number(), limit: z.number(), total: z.number() });
}

export const adminOverviewSchema = z.object({
  users: z.object({ total: z.number(), inactive: z.number(), guests: z.number(), owners: z.number(), admins: z.number(), newLast7Days: z.number() }),
  properties: z.object({ total: z.number(), active: z.number(), unavailable: z.number(), draft: z.number(), listed: z.number() }),
  rooms: z.object({
    total: z.number(),
    available: z.number(),
    unavailable: z.number(),
    inactive: z.number(),
    listed: z.number(),
    averageListedCompleteness: z.number().nullable(),
    lowCompletenessListed: z.number(),
    lowCompletenessThreshold: z.number(),
  }),
  featuring: z.object({ active: z.number(), scheduled: z.number() }),
});

export const adminUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  status: z.enum(userStatuses),
  roles: z.array(z.enum(userRoles)),
  createdAt: z.string(),
  propertyCount: z.number(),
});

export const adminPropertySchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(propertyTypes),
  status: z.enum(propertyStatuses),
  city: z.string().nullable(),
  state: z.string().nullable(),
  createdAt: z.string(),
  owner: z.object({ name: z.string(), email: z.string() }),
  roomCount: z.number(),
  availableRoomCount: z.number(),
  listed: z.boolean(),
});

export const adminRoomSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(roomStatuses),
  completenessScore: z.number(),
  featuredFrom: z.string().nullable(),
  featuredUntil: z.string().nullable(),
  listed: z.boolean(),
  featuringStatus: z.enum(featuringStatuses),
  property: z.object({
    id: z.string(),
    title: z.string(),
    status: z.enum(propertyStatuses),
    city: z.string().nullable(),
    state: z.string().nullable(),
  }),
});

export const adminUserPageSchema = pageSchema(adminUserSchema);
export const adminPropertyPageSchema = pageSchema(adminPropertySchema);
export const adminRoomPageSchema = pageSchema(adminRoomSchema);

export type AdminOverview = z.infer<typeof adminOverviewSchema>;
export type AdminRoom = z.infer<typeof adminRoomSchema>;

export function isAdmin(user: { roles: string[] }): boolean {
  return user.roles.includes("ADMIN");
}

export function formatPlace({ city, state }: { city: string | null; state: string | null }): string | undefined {
  return city ? [city, state].filter(Boolean).join("/") : undefined;
}

const timeZone = "America/Sao_Paulo";
const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone });
const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone });

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

export function formatDate(iso: string): string {
  return date.format(new Date(iso));
}

export function searchParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

export function pageParam(value: string | string[] | undefined): number {
  return Math.max(1, Number(searchParam(value)) || 1);
}

export function queryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  return query.toString();
}
