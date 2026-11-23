import Image from "next/image";
import { MediaKind } from "@/lib/properties";

export function CoverMedia({ url, type, alt = "", sizes, className = "" }: { url: string; type: MediaKind | null; alt?: string; sizes: string; className?: string }) {
  if (type === MediaKind.VIDEO) {
    return (
      <video src={url} autoPlay muted loop playsInline preload="auto" aria-hidden="true" className={`absolute inset-0 size-full object-cover ${className}`} />
    );
  }
  return <Image src={url} alt={alt} fill sizes={sizes} className={`object-cover ${className}`} />;
}
