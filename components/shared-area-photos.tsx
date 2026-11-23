"use client";

import Image from "next/image";
import { useState } from "react";
import { LuPlay } from "react-icons/lu";
import { PhotoViewer } from "@/components/photo-viewer";
import { MediaKind, type Media } from "@/lib/properties";

export function SharedAreaPhotos({ areaName, media }: { areaName: string; media: Media[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const photos = media.map((item, position) => ({ id: item.id, url: item.url, type: item.type, alt: `${areaName}, mídia ${position + 1}` }));

  return (
    <>
      <ul className="mt-3 flex flex-wrap gap-2">
        {photos.map((photo, position) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => setIndex(position)}
              aria-label={`Abrir ${photo.alt}`}
              className="relative block size-16 overflow-hidden rounded-lg bg-(--surface-raised) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
            >
              {photo.type === MediaKind.IMAGE ? (
                <Image src={photo.url} alt="" fill sizes="64px" className="object-cover" />
              ) : (
                <>
                  <video src={photo.url} muted playsInline preload="metadata" className="size-full object-cover" />
                  <LuPlay aria-hidden="true" size={14} className="absolute bottom-1 left-1 text-(--white)" />
                </>
              )}
            </button>
          </li>
        ))}
      </ul>
      <PhotoViewer title={areaName} photos={photos} index={index} onIndexChange={setIndex} onClose={() => setIndex(null)} />
    </>
  );
}
