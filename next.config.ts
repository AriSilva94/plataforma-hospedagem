import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

function mediaRemotePatterns(): RemotePattern[] {
  const patterns: RemotePattern[] = [{ protocol: "https", hostname: "*.r2.dev", pathname: "/**" }];
  const customBase = process.env.MEDIA_PUBLIC_BASE_URL;
  if (!customBase) return patterns;
  const url = new URL(customBase);
  const protocol = url.protocol === "http:" ? "http" : "https";
  return [...patterns, { protocol, hostname: url.hostname, pathname: `${url.pathname.replace(/\/$/, "")}/**` }];
}

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: { remotePatterns: mediaRemotePatterns() },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
