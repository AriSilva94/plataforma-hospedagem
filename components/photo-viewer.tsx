"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { LuChevronLeft, LuChevronRight, LuX } from "react-icons/lu";

export type ViewerPhoto = { id: string; url: string; alt: string };

const SWIPE_THRESHOLD = 50;

const navButtonClassName =
  "absolute top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light)";

export function PhotoViewer({
  title,
  photos,
  index,
  onIndexChange,
  onClose,
}: {
  title: string;
  photos: ViewerPhoto[];
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const swipeStartRef = useRef<number | null>(null);
  const open = index !== null;
  const photo = index === null ? undefined : photos[index];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function go(step: number) {
    if (index === null || photos.length < 2) return;
    onIndexChange((index + step + photos.length) % photos.length);
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={`Fotos de ${title}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") go(-1);
        if (event.key === "ArrowRight") go(1);
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-black/95 p-0 text-white backdrop:bg-black/80"
    >
      {photo && index !== null ? (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <p aria-live="polite" className="text-sm font-semibold tabular-nums text-(--gray)">
              {index + 1} / {photos.length}
            </p>
            <button
              type="button"
              autoFocus
              aria-label="Fechar fotos"
              onClick={onClose}
              className="flex size-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-(--blue-light)"
            >
              <LuX aria-hidden="true" size={22} />
            </button>
          </div>
          <div
            className="relative flex-1 touch-pan-y"
            onPointerDown={(event) => {
              swipeStartRef.current = event.clientX;
            }}
            onPointerUp={(event) => {
              const start = swipeStartRef.current;
              swipeStartRef.current = null;
              if (start === null) return;
              const distance = event.clientX - start;
              if (Math.abs(distance) > SWIPE_THRESHOLD) go(distance < 0 ? 1 : -1);
            }}
          >
            <Image key={photo.id} src={photo.url} alt={photo.alt} fill sizes="100vw" className="object-contain" />
            {photos.length > 1 ? (
              <>
                <button type="button" aria-label="Foto anterior" onClick={() => go(-1)} className={`${navButtonClassName} left-3 sm:left-6`}>
                  <LuChevronLeft aria-hidden="true" size={24} />
                </button>
                <button type="button" aria-label="Próxima foto" onClick={() => go(1)} className={`${navButtonClassName} right-3 sm:right-6`}>
                  <LuChevronRight aria-hidden="true" size={24} />
                </button>
              </>
            ) : null}
          </div>
          <p className="px-4 py-3 text-center text-sm text-(--gray) sm:px-6">{photo.alt}</p>
        </div>
      ) : null}
    </dialog>
  );
}
