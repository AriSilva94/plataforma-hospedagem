"use client";

import Image from "next/image";
import { useState } from "react";
import { LuImage, LuImages } from "react-icons/lu";
import { PhotoViewer, type ViewerPhoto } from "@/components/photo-viewer";

const GRID_EXTRA_PHOTOS = 4;

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
      className={`group relative block overflow-hidden bg-(--surface-raised) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--blue-light) ${className}`}
    >
      <Image
        src={photo.url}
        alt=""
        fill
        loading={eager ? "eager" : undefined}
        fetchPriority={eager ? "high" : undefined}
        sizes={sizes}
        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
    </button>
  );
}

function EmptyPhoto({ className }: { className: string }) {
  return (
    <div className={`flex items-center justify-center bg-(--surface-raised) text-(--gray) ${className}`}>
      <LuImage aria-hidden="true" size={28} />
    </div>
  );
}

export function PropertyPhotoGrid({ title, photos }: { title: string; photos: ViewerPhoto[] }) {
  const [viewing, setViewing] = useState<number | null>(null);
  const [cover, ...others] = photos;
  const gridOthers = others.slice(0, GRID_EXTRA_PHOTOS);

  if (!cover) return <EmptyPhoto className="mt-4 aspect-4/3 rounded-2xl md:aspect-21/9" />;

  return (
    <div className="relative mt-4">
      <div className={`grid gap-2 overflow-hidden rounded-2xl ${gridOthers.length > 0 ? "md:grid-cols-4 md:grid-rows-2" : ""}`}>
        <PhotoButton
          photo={cover}
          eager
          sizes={gridOthers.length > 0 ? "(min-width: 768px) 50vw, 100vw" : "100vw"}
          className={gridOthers.length > 0 ? "aspect-4/3 md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-96" : "aspect-4/3 md:aspect-21/9"}
          onOpen={() => setViewing(0)}
        />
        {gridOthers.map((photo, index) => (
          <PhotoButton key={photo.id} photo={photo} sizes="25vw" className="hidden aspect-4/3 md:block" onOpen={() => setViewing(index + 1)} />
        ))}
      </div>
      {photos.length > 1 ? (
        <button
          type="button"
          onClick={() => setViewing(0)}
          className="absolute right-3 bottom-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-black/70 px-4 text-sm font-semibold text-white transition-colors hover:bg-black/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light)"
        >
          <LuImages aria-hidden="true" size={16} />
          Ver as {photos.length} fotos
        </button>
      ) : null}
      <PhotoViewer title={title} photos={photos} index={viewing} onIndexChange={setViewing} onClose={() => setViewing(null)} />
    </div>
  );
}

export function RoomCover({ title, photos, eager, className }: { title: string; photos: ViewerPhoto[]; eager?: boolean; className: string }) {
  const [viewing, setViewing] = useState<number | null>(null);
  const [cover] = photos;

  if (!cover) return <EmptyPhoto className={className} />;

  return (
    <div className={`relative ${className}`}>
      <PhotoButton photo={cover} eager={eager} sizes="(min-width: 768px) 288px, 100vw" className="size-full" onOpen={() => setViewing(0)} />
      {photos.length > 1 ? (
        <span className="pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white">
          <LuImages aria-hidden="true" size={13} />
          {photos.length} fotos
        </span>
      ) : null}
      <PhotoViewer title={title} photos={photos} index={viewing} onIndexChange={setViewing} onClose={() => setViewing(null)} />
    </div>
  );
}
