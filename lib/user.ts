import { genderIdentities, type GenderIdentity } from "@/lib/properties";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  hasPassword: boolean;
  phone: string | null;
  birthDate: string | null;
  city: string | null;
  state: string | null;
  roles: string[];
  guestGenderIdentity?: GenderIdentity | null;
};

export function parseCurrentUser(value: unknown): CurrentUser | undefined {
  if (
    typeof value !== "object" ||
    value === null ||
    !("id" in value) ||
    typeof value.id !== "string" ||
    !("name" in value) ||
    typeof value.name !== "string" ||
    !("email" in value) ||
    typeof value.email !== "string" ||
    !("roles" in value) ||
    !Array.isArray(value.roles) ||
    !value.roles.every((role) => typeof role === "string")
  ) {
    return undefined;
  }
  return {
    id: value.id,
    name: value.name,
    email: value.email,
    emailVerified:
      "emailVerifiedAt" in value && typeof value.emailVerifiedAt === "string",
    hasPassword: "hasPassword" in value && value.hasPassword === true,
    phone: readOptionalString(value, "phone"),
    birthDate: readOptionalString(value, "birthDate"),
    city: readOptionalString(value, "city"),
    state: readOptionalString(value, "state"),
    roles: value.roles,
    guestGenderIdentity: parseGuestGenderIdentity(value),
  };
}

export function hasListingPersonalData(user: CurrentUser): boolean {
  return Boolean(user.phone && user.birthDate && user.city && user.state);
}

export function formatPhone(value: string): string {
  const digits = value.replace(/^\+55/, "").replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  const areaCode = `(${digits.slice(0, 2)}) `;
  const number = digits.slice(2);
  if (number.length <= 4) return `${areaCode}${number}`;
  const prefixLength = number.length === 9 ? 5 : 4;
  return `${areaCode}${number.slice(0, prefixLength)}-${number.slice(prefixLength)}`;
}

function readOptionalString(value: object, key: string): string | null {
  const field = (value as Record<string, unknown>)[key];
  return typeof field === "string" ? field : null;
}

function parseGuestGenderIdentity(value: object): GenderIdentity | null {
  if (
    !("guestProfile" in value) ||
    typeof value.guestProfile !== "object" ||
    value.guestProfile === null ||
    !("genderIdentity" in value.guestProfile)
  ) {
    return null;
  }
  const identity = value.guestProfile.genderIdentity;
  return genderIdentities.find((option) => option === identity) ?? null;
}
