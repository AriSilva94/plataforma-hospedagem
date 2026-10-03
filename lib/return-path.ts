export function safeReturnPath(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return undefined;
  return value;
}

export function loginHref(returnPath: string): string {
  return `/login?next=${encodeURIComponent(returnPath)}`;
}
