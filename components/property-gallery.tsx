"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LuImage, LuImages, LuMaximize2, LuMinimize2, LuPause, LuPlay, LuVolume2, LuVolumeX } from "react-icons/lu";
import { PhotoViewer, type ViewerPhoto } from "@/components/photo-viewer";

const MAX_TILES = 6;

const thumbSpans: Record<number, string[]> = {
  1: ["col-span-6 row-span-2"],
  2: ["col-span-6", "col-span-6"],
  3: ["col-span-6", "col-span-3", "col-span-3"],
  4: ["col-span-3", "col-span-3", "col-span-3", "col-span-3"],
  5: ["col-span-2", "col-span-2", "col-span-2", "col-span-3", "col-span-3"],
  6: ["col-span-2", "col-span-2", "col-span-2", "col-span-2", "col-span-2", "col-span-2"],
};

const tileClassName =
  "group relative block overflow-hidden rounded-lg bg-(--surface-raised) after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-1 after:ring-(--white)/12 after:ring-inset focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--focus-ring) md:rounded-xl md:after:rounded-xl";

const expandClassName =
  "absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-md bg-(--black)/45 text-(--white) transition-colors hover:bg-(--black)/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) md:top-2.5 md:right-2.5 md:size-8 md:rounded-lg";

function formatDuration(seconds: number) {
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function PhotoTile({
  photo,
  sizes,
  className,
  eager,
  onOpen,
  children,
}: {
  photo: ViewerPhoto;
  sizes: string;
  className: string;
  eager?: boolean;
  onOpen: () => void;
  children?: ReactNode;
}) {
  return (
    <button type="button" onClick={onOpen} aria-label={`Ampliar ${photo.alt}`} className={`${tileClassName} ${className}`}>
      {photo.type === "VIDEO" ? (
        <video src={`${photo.url}#t=0.1`} muted playsInline preload="metadata" aria-hidden="true" className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-102" />
      ) : (
        <Image
          src={photo.url}
          alt=""
          fill
          loading={eager ? "eager" : undefined}
          fetchPriority={eager ? "high" : undefined}
          sizes={sizes}
          className="object-cover transition-transform duration-300 group-hover:scale-102"
        />
      )}
      {children}
    </button>
  );
}

const videoControlClassName =
  "flex size-8 items-center justify-center rounded-lg bg-(--black)/50 text-(--white) transition-colors hover:bg-(--black)/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) md:size-9";

type FullscreenVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

function CoverVideo({ photo, className }: { photo: ViewerPhoto; className: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<FullscreenVideo>(null);
  const [duration, setDuration] = useState<number>();
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [showPauseIcon, setShowPauseIcon] = useState(false);
  const hidePauseIconTimer = useRef<number>(undefined);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => setPaused(true));
    return () => window.clearTimeout(hidePauseIconTimer.current);
  }, []);

  useEffect(() => {
    const syncFullscreen = () => setFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    window.clearTimeout(hidePauseIconTimer.current);
    if (video.paused) {
      void video.play();
      setShowPauseIcon(true);
      hidePauseIconTimer.current = window.setTimeout(() => setShowPauseIcon(false), 700);
    } else {
      video.pause();
      setShowPauseIcon(false);
    }
  }

  function toggleMuted() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    const container = containerRef.current;
    const enterVideoFullscreen = () => videoRef.current?.webkitEnterFullscreen?.();
    if (container?.requestFullscreen) container.requestFullscreen().catch(enterVideoFullscreen);
    else enterVideoFullscreen();
  }

  return (
    <div
      ref={containerRef}
      className={`${tileClassName} ${className} fullscreen:rounded-none fullscreen:bg-(--black)`}
    >
      <video
        ref={(video) => {
          videoRef.current = video;
          if (video && video.readyState >= HTMLMediaElement.HAVE_METADATA) setDuration(video.duration);
        }}
        src={photo.url}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
        aria-label={photo.alt}
        onContextMenu={(event) => event.preventDefault()}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        className={`absolute inset-0 size-full ${fullscreen ? "object-contain" : "object-cover"}`}
      />

      <button
        type="button"
        onClick={togglePlayback}
        aria-label={paused ? `Reproduzir ${photo.alt}` : `Pausar ${photo.alt}`}
        className="group/play absolute inset-0 flex items-center justify-center bg-linear-to-t from-(--black)/55 via-transparent to-(--black)/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--focus-ring)"
      >
        <span
          className={`flex size-10 items-center justify-center rounded-full border-2 border-(--white) bg-(--black)/35 text-(--white) transition-[opacity,scale] duration-300 group-hover/play:scale-108 md:size-14 ${
            paused || showPauseIcon ? "opacity-100" : "opacity-0"
          }`}
        >
          {paused ? (
            <LuPlay aria-hidden="true" className="size-4 translate-x-px md:size-6" fill="currentColor" />
          ) : (
            <LuPause aria-hidden="true" className="size-4 md:size-6" fill="currentColor" />
          )}
        </span>
      </button>

      <span className="pointer-events-none absolute top-1.5 left-1.5 rounded-full bg-(--primary) px-2 py-0.5 text-xs font-bold text-(--on-primary) md:top-2.5 md:left-2.5 md:px-2.5">
        Tour em vídeo
      </span>
      {duration ? (
        <span className="pointer-events-none absolute bottom-2 left-2 hidden rounded-md bg-(--black)/50 px-1.5 py-0.5 text-xs font-semibold text-(--white) tabular-nums sm:block md:bottom-2.5 md:left-2.5">
          {formatDuration(duration)}
        </span>
      ) : null}

      <div className="absolute right-1.5 bottom-1.5 flex gap-1.5 md:right-2.5 md:bottom-2.5">
        <button type="button" onClick={toggleMuted} aria-pressed={!muted} aria-label={muted ? "Ativar som" : "Desativar som"} className={videoControlClassName}>
          {muted ? <LuVolumeX aria-hidden="true" size={16} /> : <LuVolume2 aria-hidden="true" size={16} />}
        </button>
        <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? "Sair da tela cheia" : "Tela cheia"} className={videoControlClassName}>
          {fullscreen ? <LuMinimize2 aria-hidden="true" size={16} /> : <LuMaximize2 aria-hidden="true" size={16} />}
        </button>
      </div>
    </div>
  );
}

export function PropertyPhotoGrid({ title, photos }: { title: string; photos: ViewerPhoto[] }) {
  const [viewing, setViewing] = useState<number | null>(null);
  const [cover, ...others] = photos;

  if (!cover) {
    return (
      <div className="mt-3 flex aspect-10/3 items-center justify-center rounded-xl bg-(--surface-raised) text-(--text-secondary) md:aspect-auto md:h-64 lg:h-72">
        <LuImage aria-hidden="true" size={28} />
      </div>
    );
  }

  const hasMore = photos.length > MAX_TILES;
  const thumbs = others.slice(0, MAX_TILES - 1);
  const remaining = photos.length - MAX_TILES;
  const tileCount = thumbs.length + (hasMore ? 1 : 0);
  const spans = thumbSpans[tileCount];
  const hasVideo = photos.some((photo) => photo.type === "VIDEO");
  const coverClassName = spans ? "col-span-6 row-span-2" : "size-full";

  return (
    <div className="mt-3">
      <div className={`grid gap-1.5 aspect-10/3 md:aspect-auto md:h-64 lg:h-72 ${spans ? "grid-cols-12 grid-rows-2" : ""}`}>
        {cover.type === "VIDEO" ? (
          <CoverVideo photo={cover} className={coverClassName} />
        ) : (
          <PhotoTile photo={cover} eager sizes={spans ? "50vw" : "100vw"} className={coverClassName} onOpen={() => setViewing(0)}>
            <span aria-hidden="true" className={`${expandClassName} pointer-events-none`}>
              <LuMaximize2 size={14} />
            </span>
          </PhotoTile>
        )}

        {thumbs.map((photo, index) => (
          <PhotoTile key={photo.id} photo={photo} sizes="(min-width: 768px) 17vw, 20vw" className={spans[index]} onOpen={() => setViewing(index + 1)}>
            {photo.type === "VIDEO" ? (
              <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-6 items-center justify-center rounded-full bg-(--black)/45 text-(--white) md:size-7">
                  <LuPlay size={12} fill="currentColor" />
                </span>
              </span>
            ) : null}
          </PhotoTile>
        ))}

        {hasMore ? (
          <button
            type="button"
            onClick={() => setViewing(MAX_TILES)}
            aria-label={`Ver mais ${remaining} ${hasVideo ? "fotos e vídeos" : "fotos"}`}
            className={`${spans[tileCount - 1]} flex flex-col items-center justify-center gap-0.5 rounded-lg border border-(--border-strong)/60 bg-(--surface) text-(--text-primary) transition-colors hover:border-(--primary) hover:bg-(--primary-soft) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--focus-ring) md:gap-1 md:rounded-xl`}
          >
            <LuImages aria-hidden="true" className="size-3.5 md:size-5" />
            <span className="text-sm leading-none font-extrabold tabular-nums md:text-xl">+{remaining}</span>
            <span className="hidden text-xs leading-tight text-(--text-secondary) md:block">{hasVideo ? "Fotos e vídeos" : "Fotos"}</span>
          </button>
        ) : null}
      </div>
      <PhotoViewer title={title} photos={photos} index={viewing} onIndexChange={setViewing} onClose={() => setViewing(null)} />
    </div>
  );
}
