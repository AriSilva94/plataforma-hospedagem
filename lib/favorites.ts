import { z } from "@/lib/zod";
import { propertyTypes } from "@/lib/properties";

export const favoriteRoomIdsSchema = z.object({ roomIds: z.array(z.string()) });

export const favoriteListSchema = z.object({
  items: z.array(
    z.object({
      roomId: z.string(),
      title: z.string(),
      priceCents: z.number(),
      coverUrl: z.string().nullable(),
      available: z.boolean(),
      favoritedAt: z.string(),
      property: z.object({
        id: z.string(),
        title: z.string(),
        type: z.enum(propertyTypes),
        neighborhood: z.string().nullable(),
        city: z.string().nullable(),
        state: z.string().nullable(),
      }),
    }),
  ),
});

export type FavoriteItem = z.infer<typeof favoriteListSchema>["items"][number];
