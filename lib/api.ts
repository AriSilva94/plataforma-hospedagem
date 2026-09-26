const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";

export type ApiError = { message: string };

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const response = await request(path, init);

  if (response.status !== 401 || path.startsWith("/auth/")) {
    return response;
  }

  return (await refreshSession()) ? request(path, init) : response;
}

export async function logout(): Promise<boolean> {
  try {
    const response = await request("/auth/logout", { method: "POST" });
    return response.ok;
  } catch {
    return false;
  }
}

export async function getErrorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  if (typeof body === "object" && body !== null && "message" in body) {
    const message = body.message;
    return Array.isArray(message) ? message.join(" ") : String(message);
  }
  return "Não foi possível concluir a solicitação. Tente novamente.";
}

function request(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init.headers },
  });
}

// Requisições simultâneas compartilham a mesma renovação: o backend rotaciona o
// refresh token, então duas chamadas concorrentes invalidariam uma à outra.
let pendingRefresh: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  pendingRefresh ??= runRefresh().finally(() => {
    pendingRefresh = null;
  });
  return pendingRefresh;
}

async function runRefresh(): Promise<boolean> {
  try {
    const response = await request("/auth/refresh", { method: "POST" });
    if (!response.ok) {
      return false;
    }
    const body: unknown = await response.json().catch(() => null);
    return (
      typeof body === "object" &&
      body !== null &&
      "authenticated" in body &&
      body.authenticated === true
    );
  } catch {
    return false;
  }
}
