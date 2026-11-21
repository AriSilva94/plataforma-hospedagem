import { z } from "@/lib/zod";
import {
  bathroomTypes,
  bedTypes,
  brazilianStates,
  cleaningFrequencies,
  smokingPolicies,
  type CleaningFrequency,
  type SmokingPolicy,
  genderIdentities,
  propertyTypes,
  sharedAreaTypes,
} from "@/lib/properties";

const optionalText = (max: number) =>
  z.string().trim().max(max, { error: `Use no máximo ${max} caracteres.` });

const houseServicesFields = {
  hasCleaner: z.enum(["", "yes", "no"]),
  cleaningFrequency: z.enum(["", ...cleaningFrequencies]),
  smokingPolicy: z.enum(["", ...smokingPolicies]),
};

export type HouseServicesInput = {
  hasCleaner: "" | "yes" | "no";
  cleaningFrequency: "" | CleaningFrequency;
  smokingPolicy: "" | SmokingPolicy;
};

type HouseServicesSource = { hasCleaner: boolean | null; cleaningFrequency: CleaningFrequency | null; smokingPolicy: SmokingPolicy | null };

export function houseServicesDefaults(source?: HouseServicesSource): HouseServicesInput {
  return {
    hasCleaner: source?.hasCleaner == null ? "" : source.hasCleaner ? "yes" : "no",
    cleaningFrequency: source?.cleaningFrequency ?? "",
    smokingPolicy: source?.smokingPolicy ?? "",
  };
}

export function houseServicesPayload({ hasCleaner, cleaningFrequency, smokingPolicy }: HouseServicesInput) {
  return {
    hasCleaner: hasCleaner === "" ? null : hasCleaner === "yes",
    cleaningFrequency: hasCleaner === "yes" && cleaningFrequency !== "" ? cleaningFrequency : null,
    smokingPolicy: smokingPolicy === "" ? null : smokingPolicy,
  };
}

export function houseServicesError({ hasCleaner, cleaningFrequency }: HouseServicesInput): string | undefined {
  return hasCleaner === "yes" && cleaningFrequency === "" ? "Informe a frequência da faxina." : undefined;
}

export const propertyGeneralSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { error: "O título deve ter pelo menos 3 caracteres." })
    .max(120, { error: "O título deve ter no máximo 120 caracteres." }),
  type: z.enum(propertyTypes, { error: "Selecione o tipo do imóvel." }),
  description: optionalText(5000),
  houseRules: optionalText(3000),
  generalInfo: optionalText(3000),
  features: z.array(z.string()),
  ...houseServicesFields,
});

export const propertyLocationSchema = z.object({
  postalCode: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{5}-?\d{3}$/.test(value), { error: "Informe um CEP com 8 dígitos." }),
  street: optionalText(160),
  number: optionalText(20),
  complement: optionalText(120),
  neighborhood: optionalText(120),
  city: optionalText(120),
  state: z.union([z.literal(""), z.enum(brazilianStates)]),
  referencePoints: z
    .string()
    .transform((value) => value.split("\n").map((line) => line.trim()).filter(Boolean))
    .refine((points) => points.length <= 10, { error: "Informe no máximo 10 pontos de referência." })
    .refine((points) => points.every((point) => point.length >= 2 && point.length <= 120), {
      error: "Cada ponto de referência deve ter entre 2 e 120 caracteres.",
    }),
});

export const propertyGuidedGeneralSchema = propertyGeneralSchema.extend({
  description: optionalText(5000).min(1, { error: "Descreva o imóvel para continuar." }),
});

const requiredText = (max: number, message: string) => optionalText(max).min(1, { error: message });

export const propertyGuidedLocationSchema = propertyLocationSchema.extend({
  postalCode: z
    .string()
    .trim()
    .min(1, { error: "Informe o CEP." })
    .regex(/^\d{5}-?\d{3}$/, { error: "Informe um CEP com 8 dígitos." }),
  street: requiredText(160, "Informe a rua ou avenida."),
  number: requiredText(20, "Informe o número."),
  neighborhood: requiredText(120, "Informe o bairro."),
  city: requiredText(120, "Informe a cidade."),
  state: z.union([z.literal(""), z.enum(brazilianStates)]).refine((value) => value !== "", { error: "Selecione o estado." }),
});

export const sharedAreasSchema = z.object({
  areas: z
    .array(
      z
        .object({
          type: z.enum(sharedAreaTypes),
          label: optionalText(60),
          description: optionalText(500),
        })
        .refine((area) => area.type !== "OTHER" || area.label.length >= 2, {
          error: "Informe o nome da área.",
          path: ["label"],
        }),
    )
    .max(30, { error: "Cadastre no máximo 30 áreas." }),
});

export const propertySetupSchema = propertyGuidedGeneralSchema
  .merge(propertyGuidedLocationSchema)
  .merge(sharedAreasSchema)
  .extend({
    roomCount: z.coerce.number().int().min(1, "Informe ao menos 1 quarto.").max(20, "Cadastre até 20 quartos por vez."),
  });

export const roomSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { error: "O nome deve ter pelo menos 2 caracteres." })
    .max(80, { error: "O nome deve ter no máximo 80 caracteres." }),
  description: optionalText(3000),
  price: z
    .string()
    .trim()
    .min(1, { error: "Informe o valor da diária." })
    .transform((value) => Math.round(Number(normalizeDecimal(value)) * 100))
    .pipe(
      z
        .number({ error: "Informe um valor válido, por exemplo 150,00." })
        .int()
        .min(1, { error: "O valor da diária deve ser maior que zero." })
        .max(10_000_000, { error: "O valor da diária deve ser no máximo R$ 100.000,00." }),
    ),
  capacity: z.coerce
    .number({ error: "Informe a capacidade." })
    .int({ error: "Informe um número inteiro." })
    .min(1, { error: "A capacidade mínima é 1 pessoa." })
    .max(20, { error: "A capacidade máxima é 20 pessoas." }),
  bathroomType: z.enum(bathroomTypes, { error: "Selecione o tipo de banheiro." }),
  acceptedAudiences: z.array(z.enum(genderIdentities)).min(1, { error: "Selecione ao menos um público aceito." }),
  amenities: z.array(z.string()),
  additionalInfo: optionalText(2000),
  beds: z
    .array(
      z.object({
        type: z.enum(bedTypes, { error: "Selecione o tipo de cama." }),
        quantity: z.coerce
          .number({ error: "Informe a quantidade." })
          .int({ error: "Informe um número inteiro." })
          .min(1, { error: "A quantidade mínima é 1." })
          .max(10, { error: "A quantidade máxima é 10." }),
      }),
    )
    .max(6, { error: "Informe no máximo 6 tipos de cama." })
    .superRefine((beds, ctx) => {
      const seen = new Set<string>();
      beds.forEach((bed, index) => {
        if (seen.has(bed.type)) ctx.addIssue({ code: "custom", message: "Cada tipo de cama só pode aparecer uma vez.", path: [index, "type"] });
        seen.add(bed.type);
      });
    }),
  ...houseServicesFields,
});

export type PropertyGeneralInput = z.input<typeof propertyGeneralSchema>;
export type PropertyGeneralValues = z.output<typeof propertyGeneralSchema>;
export type PropertyLocationInput = z.input<typeof propertyLocationSchema>;
export type PropertyLocationValues = z.output<typeof propertyLocationSchema>;
export type SharedAreasValues = z.output<typeof sharedAreasSchema>;
export type PropertySetupInput = z.input<typeof propertySetupSchema>;
export type PropertySetupValues = z.output<typeof propertySetupSchema>;
export type RoomInput = z.input<typeof roomSchema>;
export type RoomValues = z.output<typeof roomSchema>;

function normalizeDecimal(value: string): string {
  const digits = value.replace(/[^\d.,]/g, "");
  return digits.includes(",") ? digits.replace(/\./g, "").replace(",", ".") : digits;
}

export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}
