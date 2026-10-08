import Image from "next/image";
import { LuImage } from "react-icons/lu";

export function CoverImage({ url, alt, sizes }: { url: string | null; alt: string; sizes: string }) {
  return (
    <div className="relative aspect-4/3 overflow-hidden bg-(--surface-raised)">
      {url ? (
        <Image src={url} alt={alt} fill sizes={sizes} className="object-cover" />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2 text-(--gray)">
          <LuImage aria-hidden="true" size={28} />
          <span className="text-xs font-semibold">Sem foto de capa</span>
        </div>
      )}
    </div>
  );
}
