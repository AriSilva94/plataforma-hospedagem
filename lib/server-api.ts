import { cookies } from "next/headers";
import type { z } from "zod";

export type ApiResult<T> =
  | { status: "ok"; data: T }
  | { status: "not-found" | "unavailable" };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";

export async function getApiData<T>(path: string, schema: z.ZodType<T>): Promise<ApiResult<T>> {
  const cookieStore = await cookies();

  try {
    const response = await fetch(`${apiUrl}${path}`, {
      cache: "no-store",
      headers: { Cookie: cookieStore.toString() },
    });

    if (response.status === 404) return { status: "not-found" };
    if (!response.ok) return { status: "unavailable" };

    const parsed = schema.safeParse(await response.json());
    return parsed.success ? { status: "ok", data: parsed.data } : { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}
