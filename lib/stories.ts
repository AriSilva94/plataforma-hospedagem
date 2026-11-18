import { genderIdentities, storyStatuses } from "@/lib/properties";
import { z } from "@/lib/zod";

export const storyStatusLabels: Record<StoryStatus, string> = {
  PENDING: "Em análise",
  APPROVED: "Aprovado",
  REJECTED: "Recusado",
};

export type StoryStatus = (typeof storyStatuses)[number];

export const MAX_STORY_MEDIA = 3;

const storyMediaSchema = z.object({
  id: z.string(),
  type: z.enum(["IMAGE", "VIDEO"]),
  url: z.string(),
});

export const storySchema = z.object({
  roomId: z.string(),
  propertyId: z.string(),
  title: z.string(),
  priceCents: z.number(),
  capacity: z.number(),
  acceptedAudiences: z.array(z.enum(genderIdentities)),
  neighborhood: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  media: z.array(storyMediaSchema).min(1),
});

export const storyListSchema = z.object({ items: z.array(storySchema) });

export type Story = z.infer<typeof storySchema>;
