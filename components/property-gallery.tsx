"use client";

import Image from "next/image";
import { useState } from "react";
import { LuImage, LuImages } from "react-icons/lu";
import { PhotoViewer, type ViewerPhoto } from "@/components/photo-viewer";

const GRID_MAX_PHOTOS = 5;

const gridLayouts: Record<number, { grid: string; cover: string; coverSizes: string; otherSizes: string }> = {
  1: { grid: "", cover: "md:aspect-21/9", coverSizes: "100vw", otherSizes: "" },
  2: { grid: "md:h-108 md:grid-cols-2", cover: "md:aspect-auto", coverSizes: "(min-width: 768px) 50vw, 100vw", otherSizes: "50vw" },
  3: { grid: "md:h-108 md:grid-cols-2 md:grid-rows-2", cover: "md:row-span-2 md:aspect-auto", coverSizes: "(min-width: 768px) 50vw, 100vw", otherSizes: "50vw" },
  4: { grid: "md:h-108 md:grid-cols-2 md:grid-rows-2", cover: "md:aspect-auto", coverSizes: "(min-width: 768px) 50vw, 100vw", otherSizes: "50vw" },
  5: { grid: "md:h-108 md:grid-cols-4 md:grid-rows-2", cover: "md:col-span-2 md:row-span-2 md:aspect-auto", coverSizes: "(min-width: 768px) 50vw, 100vw", otherSizes: "25vw" },
};

function PhotoButton({
  photo,
  sizes,
  className,
  eager,
  onOpen,
}: {
  photo: ViewerPhoto;
  sizes: string;
  className: string;
  eager?: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Ampliar ${photo.alt}`}
      className={`group relative block overflow-hidden bg-(--surface-raised) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--focus-ring) ${className}`}
    >
      <Image
        src={photo.url}
        alt=""
        fill
        loading={eager ? "eager" : undefined}
        fetchPriority={eager ? "high" : undefined}
        sizes={sizes}
        className="object-cover transition-transform duration-300 group-hover:scale-102"
      />
    </button>
  );
}

function EmptyPhoto({ className }: { className: string }) {
  return (
    <div className={`flex items-center justify-center bg-(--surface-raised) text-(--text-secondary) ${className}`}>
      <LuImage aria-hidden="true" size={28} />
    </div>
  );
}

export function PropertyPhotoGrid({ title, photos }: { title: string; photos: ViewerPhoto[] }) {
  const [viewing, setViewing] = useState<number | null>(null);
  const [cover, ...others] = photos;
  const gridOthers = others.slice(0, GRID_MAX_PHOTOS - 1);
  const layout = gridLayouts[gridOthers.length + 1];

  if (!cover) return <EmptyPhoto className="mt-4 aspect-4/3 rounded-2xl md:aspect-21/9" />;

  return (
    <div className="relative mt-4">
      <div className={`grid gap-2 overflow-hidden rounded-2xl ${layout.grid}`}>
        <PhotoButton photo={cover} eager sizes={layout.coverSizes} className={`aspect-4/3 ${layout.cover}`} onOpen={() => setViewing(0)} />
        {gridOthers.map((photo, index) => (
          <PhotoButton key={photo.id} photo={photo} sizes={layout.otherSizes} className="hidden md:block" onOpen={() => setViewing(index + 1)} />
        ))}
      </div>
      {photos.length > 1 ? (
        <button
          type="button"
          onClick={() => setViewing(0)}
          className="absolute right-3 bottom-3 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-(--black)/70 px-4 text-sm font-semibold text-(--white) transition-colors hover:bg-(--black)/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
        >
          <LuImages aria-hidden="true" size={16} />
          Ver as {photos.length} fotos
        </button>
      ) : null}
      <PhotoViewer title={title} photos={photos} index={viewing} onIndexChange={setViewing} onClose={() => setViewing(null)} />
    </div>
  );
}
