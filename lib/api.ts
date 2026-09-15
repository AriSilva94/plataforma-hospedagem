const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export type ApiError = { message: string };

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init.headers },
  });
}

export async function getErrorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  if (typeof body === "object" && body !== null && "message" in body) {
    const message = body.message;
    return Array.isArray(message) ? message.join(" ") : String(message);
  }
  return "Não foi possível concluir a solicitação. Tente novamente.";
}
