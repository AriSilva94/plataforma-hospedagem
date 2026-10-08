import type { CompletenessCriterion } from "@/lib/properties";

type CompletenessTarget =
  | { scope: "room"; section: "dados" | "fotos"; fieldId?: string }
  | { scope: "property"; section: "geral" | "localizacao" | "areas" | "midia" };

const completenessHints: Record<CompletenessCriterion, { label: string; target: CompletenessTarget }> = {
  ROOM_DESCRIPTION: { label: "Descreva o quarto", target: { scope: "room", section: "dados", fieldId: "room-description" } },
  ROOM_PHOTOS: { label: "Adicione fotos do quarto", target: { scope: "room", section: "fotos" } },
  ROOM_AMENITIES: { label: "Marque as comodidades do quarto", target: { scope: "room", section: "dados", fieldId: "room-amenities-beds" } },
  ROOM_ADDITIONAL_INFO: { label: "Inclua informações adicionais do quarto", target: { scope: "room", section: "dados", fieldId: "room-additional-info" } },
  PROPERTY_DESCRIPTION: { label: "Descreva o imóvel", target: { scope: "property", section: "geral" } },
  PROPERTY_PHOTOS: { label: "Adicione fotos do imóvel", target: { scope: "property", section: "midia" } },
  PROPERTY_FEATURES: { label: "Marque as características do imóvel", target: { scope: "property", section: "geral" } },
  HOUSE_RULES: { label: "Informe as regras da casa", target: { scope: "property", section: "geral" } },
  GENERAL_INFO: { label: "Inclua informações úteis do imóvel", target: { scope: "property", section: "geral" } },
  SHARED_AREAS: { label: "Cadastre as áreas compartilhadas", target: { scope: "property", section: "areas" } },
  REFERENCE_POINTS: { label: "Adicione pontos de referência", target: { scope: "property", section: "localizacao" } },
};

export function completenessHint(criterion: CompletenessCriterion, propertyId: string, roomId: string): { label: string; href: string } {
  const { label, target } = completenessHints[criterion];
  if (target.scope === "property") {
    return { label, href: `/meus-imoveis/${propertyId}/editar?secao=${target.section}` };
  }
  const hash = target.fieldId ? `#${target.fieldId}` : "";
  return { label, href: `/meus-imoveis/${propertyId}/quartos/${roomId}?secao=${target.section}${hash}` };
}

export function roomCriterionSection(criterion: CompletenessCriterion): "dados" | "fotos" | undefined {
  const { target } = completenessHints[criterion];
  return target.scope === "room" ? target.section : undefined;
}

export function isRoomCriterion(criterion: CompletenessCriterion): boolean {
  return completenessHints[criterion].target.scope === "room";
}
