function sameSecret(candidate: string | null, secret: string): boolean {
  if (candidate === null || candidate.length !== secret.length) {
    return false;
  }
  let difference = 0;
  for (let index = 0; index < secret.length; index += 1) {
    difference |= candidate.charCodeAt(index) ^ secret.charCodeAt(index);
  }
  return difference === 0;
}

export function internalApiHeaders(incoming: Headers): Record<string, string> {
  const internalSecret = process.env.INTERNAL_API_SECRET;
  const cloudflareSecret = process.env.CLOUDFLARE_ORIGIN_SECRET;
  const clientIp = incoming.get("cf-connecting-ip");

  return internalSecret &&
    cloudflareSecret &&
    clientIp &&
    sameSecret(incoming.get("x-origin-secret"), cloudflareSecret)
    ? { "X-Internal-Secret": internalSecret, "X-Client-IP": clientIp }
    : {};
}
