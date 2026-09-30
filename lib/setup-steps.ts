import type { PublishRequirement } from "@/lib/properties";

export const setupSteps = [
  { id: "basico", label: "Informações básicas", requirement: "DESCRIPTION" },
  { id: "endereco", label: "Endereço", requirement: "ADDRESS" },
  { id: "fotos", label: "Fotos", requirement: "PHOTO" },
  { id: "quarto", label: "Primeiro quarto", requirement: "ROOM" },
  { id: "revisao", label: "Revisar e publicar", requirement: undefined },
] as const;

export type SetupStepId = (typeof setupSteps)[number]["id"];

export const requirementLabels: Record<PublishRequirement, string> = {
  DESCRIPTION: "Descrição do imóvel",
  ADDRESS: "Endereço completo",
  PHOTO: "Pelo menos 1 foto do imóvel",
  ROOM: "Pelo menos 1 quarto disponível",
};

export function setupStepHref(propertyId: string, step: SetupStepId): string {
  return `/meus-imoveis/${propertyId}/configurar?passo=${step}`;
}

export function stepForRequirement(requirement: PublishRequirement): SetupStepId {
  return setupSteps.find((step) => step.requirement === requirement)?.id ?? "revisao";
}

export function firstPendingStep(missing: PublishRequirement[]): SetupStepId {
  return setupSteps.find((step) => step.requirement && missing.includes(step.requirement))?.id ?? "revisao";
}

export function parseSetupStep(value: string | string[] | undefined): SetupStepId | undefined {
  return setupSteps.find((step) => step.id === value)?.id;
}
