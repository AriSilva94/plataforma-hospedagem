import type { PublishRequirement } from "@/lib/properties";

export const roomStepKinds = ["nome", "camas", "banheiro", "publico", "comodidades", "diaria", "fotos"] as const;
export type RoomStepKind = (typeof roomStepKinds)[number];

const propertyStepIds = ["inicio", "endereco", "tipo", "nome", "descricao", "fotos", "areas", "fotos-areas", "banheiros", "fotos-banheiros", "quartos", "revisao", "concluido"] as const;
type PropertyStepId = (typeof propertyStepIds)[number];

export type SetupStep = { kind: PropertyStepId; room?: undefined } | { kind: RoomStepKind; room: number };

export const maxRoomCount = 20;

const legacyStepIds = new Map<string, PropertyStepId>([
  ["imovel", "endereco"],
  ["basico", "endereco"],
  ["quarto", "quartos"],
]);

export const requirementLabels: Record<PublishRequirement, string> = {
  DESCRIPTION: "Descrição do imóvel",
  ADDRESS: "Endereço completo",
  PHOTO: "Pelo menos 1 foto do imóvel",
  ROOM: "Pelo menos 1 quarto disponível",
};

const requirementSteps: Record<PublishRequirement, PropertyStepId> = {
  ADDRESS: "endereco",
  DESCRIPTION: "descricao",
  PHOTO: "fotos",
  ROOM: "quartos",
};

export function stepKey(step: SetupStep): string {
  return step.room === undefined ? step.kind : `quarto-${step.room + 1}-${step.kind}`;
}

export function setupStepHref(propertyId: string, step: SetupStep | string, roomCount?: number): string {
  const href = `/meus-imoveis/${propertyId}/configurar?passo=${typeof step === "string" ? step : stepKey(step)}`;
  return roomCount === undefined ? href : `${href}&quartos=${roomCount}`;
}

export function stepForRequirement(requirement: PublishRequirement): string {
  return requirementSteps[requirement];
}

export function firstPendingStep(missing: PublishRequirement[]): string {
  const order: PublishRequirement[] = ["ADDRESS", "DESCRIPTION", "PHOTO", "ROOM"];
  const pending = order.find((requirement) => missing.includes(requirement));
  return pending ? requirementSteps[pending] : "revisao";
}

export function parseSetupStep(value: string | string[] | undefined): SetupStep | undefined {
  if (typeof value !== "string") return undefined;
  const room = /^quarto-(\d{1,2})-([a-z]+)$/.exec(value);
  if (room) {
    const index = Number(room[1]) - 1;
    const kind = roomStepKinds.find((item) => item === room[2]);
    return kind && index >= 0 && index < maxRoomCount ? { kind, room: index } : undefined;
  }
  const kind = propertyStepIds.find((item) => item === value) ?? legacyStepIds.get(value);
  return kind ? { kind } : undefined;
}

export function parseRoomCount(value: string | string[] | undefined): number | undefined {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return undefined;
  const count = Number(value);
  return count > 0 ? Math.min(count, maxRoomCount) : undefined;
}
