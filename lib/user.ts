import { genderIdentities, type GenderIdentity } from "@/lib/properties";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
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
    roles: value.roles,
    guestGenderIdentity: parseGuestGenderIdentity(value),
  };
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
