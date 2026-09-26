import { NextRequest, NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";

// O access token expira antes do refresh token. Renovar aqui mantém a sessão
// viva nos Server Components, que não podem gravar cookies durante o render.
export async function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (request.cookies.has("access_token") || !refreshToken) {
    return NextResponse.next();
  }

  let refreshed: Response;
  try {
    refreshed = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refresh_token=${refreshToken}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.next();
  }

  const renewedCookies = refreshed.ok ? refreshed.headers.getSetCookie() : [];
  if (renewedCookies.length === 0) {
    return NextResponse.next();
  }

  for (const cookie of renewedCookies) {
    const parsed = parseCookie(cookie);
    if (parsed) {
      request.cookies.set(parsed.name, parsed.value);
    }
  }

  const response = NextResponse.next({ request });
  for (const cookie of renewedCookies) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}

function parseCookie(header: string): { name: string; value: string } | null {
  const pair = header.split(";")[0];
  const separator = pair.indexOf("=");
  return separator > 0
    ? { name: pair.slice(0, separator).trim(), value: pair.slice(separator + 1) }
    : null;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|health|rooms).*)"],
};
