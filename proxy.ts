import { NextRequest, NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";
const isDevelopment = process.env.NODE_ENV === "development";

export async function proxy(request: NextRequest) {
  const renewedCookies = await refreshSession(request);
  for (const cookie of renewedCookies) {
    const parsed = parseCookie(cookie);
    if (parsed) {
      request.cookies.set(parsed.name, parsed.value);
    }
  }

  const contentSecurityPolicy = buildContentSecurityPolicy(Buffer.from(crypto.randomUUID()).toString("base64"));
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  for (const cookie of renewedCookies) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}

async function refreshSession(request: NextRequest): Promise<string[]> {
  const refreshToken = request.cookies.get("refresh_token")?.value;
  if (request.cookies.has("access_token") || !refreshToken) {
    return [];
  }

  try {
    const refreshed = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refresh_token=${refreshToken}` },
      cache: "no-store",
    });
    return refreshed.ok ? refreshed.headers.getSetCookie() : [];
  } catch {
    return [];
  }
}

function buildContentSecurityPolicy(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "media-src 'self' blob: https:",
    "font-src 'self'",
    `connect-src 'self' ${new URL(apiUrl).origin}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
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
