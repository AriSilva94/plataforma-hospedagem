import { LuImage } from "react-icons/lu";
import { CoverMedia } from "@/components/cover-media";
import type { MediaKind } from "@/lib/properties";

export function CoverImage({ url, type, alt, sizes }: { url: string | null; type: MediaKind | null; alt: string; sizes: string }) {
  return (
    <div className="relative aspect-4/3 overflow-hidden bg-(--surface-raised)">
      {url ? (
        <CoverMedia url={url} type={type} alt={alt} sizes={sizes} />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2 text-(--text-secondary)">
          <LuImage aria-hidden="true" size={28} />
          <span className="text-xs font-semibold">Sem foto de capa</span>
        </div>
      )}
    </div>
  );
}
