import { pwaIcon } from "@/lib/pwa-icon";

const icons: Record<string, { size: number; maskable: boolean }> = {
  "icon-192.png": { size: 192, maskable: false },
  "icon-512.png": { size: 512, maskable: false },
  "maskable-512.png": { size: 512, maskable: true },
};

export async function GET(_request: Request, { params }: RouteContext<"/pwa/[file]">) {
  const { file } = await params;
  const icon = icons[file];
  if (!icon) return new Response(null, { status: 404 });
  return pwaIcon(icon.size, icon.maskable);
}
