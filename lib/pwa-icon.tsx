import { ImageResponse } from "next/og";

const ICON_CACHE = "public, max-age=86400";

export function pwaIcon(size: number, maskable: boolean) {
  const radius = maskable ? 0 : Math.round(size * 0.22);
  const letter = Math.round(size * (maskable ? 0.46 : 0.6));
  const iconClassName = `flex h-full w-full items-center justify-center bg-[#0b63e3] font-extrabold text-white rounded-[${radius}px] text-[${letter}px]`;

  return new ImageResponse(<div tw={iconClassName}>D</div>, { width: size, height: size, headers: { "Cache-Control": ICON_CACHE } });
}
