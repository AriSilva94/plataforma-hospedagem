import type { PublishRequirement } from "@/lib/properties";

export const setupSteps = [
  { id: "imovel", label: "Imóvel", requirements: ["DESCRIPTION", "ADDRESS"] },
  { id: "fotos", label: "Fotos", requirements: ["PHOTO"] },
  { id: "quartos", label: "Quartos", requirements: ["ROOM"] },
  { id: "revisao", label: "Revisar e publicar", requirements: [] },
] as const satisfies readonly { id: string; label: string; requirements: readonly PublishRequirement[] }[];

export type SetupStepId = (typeof setupSteps)[number]["id"];

const legacyStepIds = new Map<string, SetupStepId>([
  ["basico", "imovel"],
  ["endereco", "imovel"],
  ["quarto", "quartos"],
]);

const maxRoomCount = 20;

export const requirementLabels: Record<PublishRequirement, string> = {
  DESCRIPTION: "Descrição do imóvel",
  ADDRESS: "Endereço completo",
  PHOTO: "Pelo menos 1 foto do imóvel",
  ROOM: "Pelo menos 1 quarto disponível",
};

function stepRequirements(step: (typeof setupSteps)[number]): readonly PublishRequirement[] {
  return step.requirements;
}

export function setupStepHref(propertyId: string, step: SetupStepId, roomCount?: number): string {
  const href = `/meus-imoveis/${propertyId}/configurar?passo=${step}`;
  return roomCount === undefined ? href : `${href}&quartos=${roomCount}`;
}

export function stepForRequirement(requirement: PublishRequirement): SetupStepId {
  return setupSteps.find((step) => stepRequirements(step).includes(requirement))?.id ?? "revisao";
}

export function firstPendingStep(missing: PublishRequirement[]): SetupStepId {
  return setupSteps.find((step) => stepRequirements(step).some((requirement) => missing.includes(requirement)))?.id ?? "revisao";
}

export function isStepComplete(step: (typeof setupSteps)[number], missing: PublishRequirement[]): boolean {
  const requirements = stepRequirements(step);
  return requirements.length > 0 && requirements.every((requirement) => !missing.includes(requirement));
}

export function parseSetupStep(value: string | string[] | undefined): SetupStepId | undefined {
  if (typeof value !== "string") return undefined;
  return setupSteps.find((step) => step.id === value)?.id ?? legacyStepIds.get(value);
}

export function parseRoomCount(value: string | string[] | undefined): number | undefined {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  const count = Number(value);
  return count > 0 ? Math.min(count, maxRoomCount) : undefined;
}
