import { cache } from "react";
import { cookies, headers } from "next/headers";
import { internalApiHeaders } from "@/lib/internal-api";
import { CurrentUser, parseCurrentUser } from "@/lib/user";

export type CurrentUserResult = {
  user?: CurrentUser;
  unavailable: boolean;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";

export const getCurrentUser = cache(async (): Promise<CurrentUserResult> => {
  const cookieStore = await cookies();

  if (!cookieStore.has("access_token") && !cookieStore.has("refresh_token")) {
    return { unavailable: false };
  }

  try {
    const response = await fetch(`${apiUrl}/users/me`, {
      cache: "no-store",
      headers: {
        Cookie: cookieStore.toString(),
        ...internalApiHeaders(await headers()),
      },
    });

    if (response.ok) {
      const user = parseCurrentUser(await response.json());
      return { user, unavailable: !user };
    }

    return { unavailable: response.status !== 401 && response.status !== 403 };
  } catch {
    return { unavailable: true };
  }
});
