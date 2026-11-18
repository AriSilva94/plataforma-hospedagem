"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { LuChevronRight, LuMapPin, LuPause, LuPlay, LuTag, LuUsers, LuX } from "react-icons/lu";
import { formatCents, formatLocation, genderIdentities, genderIdentityLabels } from "@/lib/properties";
import type { Story } from "@/lib/stories";

const IMAGE_DURATION_MS = 5000;
const SLIDE_SIZES = "(min-width: 448px) 448px, 100vw";
const HOLD_TO_PAUSE_MS = 250;
const SWIPE_MIN_PX = 50;
const SWIPE_DOWN_MIN_PX = 80;
const TAP_MAX_MOVE_PX = 10;
const MEDIA_ERROR_ADVANCE_MS = 2000;

const barClassName =
  "h-1 flex-1 appearance-none overflow-hidden rounded-full bg-(--white)/30 [&::-moz-progress-bar]:bg-(--white) [&::-webkit-progress-bar]:bg-(--white)/30 [&::-webkit-progress-value]:bg-(--white)";

const chipClassName = "inline-flex items-center gap-1.5 rounded-full bg-(--white)/15 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm";

const iconButtonClassName =
  "relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full text-(--white) transition-colors hover:bg-(--white)/15 focus-visible:outline-2 focus-visible:outline-(--focus-ring)";

const tapZoneClassName = "absolute inset-y-24 touch-none select-none focus-visible:outline-2 focus-visible:outline-(--focus-ring)";

export function StoryViewer({
  stories,
  index,
  onIndexChange,
}: {
  stories: Story[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = index !== null;
  const story = index === null ? undefined : stories[index];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={story ? `Story de ${story.title}` : "Story"}
      onCancel={(event) => {
        event.preventDefault();
        onIndexChange(null);
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-(--black) p-0 text-(--white) backdrop:bg-(--black)"
    >
      {story && index !== null ? (
        <StorySlides
          key={story.roomId}
          story={story}
          onPreviousStory={() => onIndexChange(index > 0 ? index - 1 : null)}
          onNextStory={() => onIndexChange(index < stories.length - 1 ? index + 1 : null)}
          onClose={() => onIndexChange(null)}
        />
      ) : null}
    </dialog>
  );
}

function StorySlides({
  story,
  onPreviousStory,
  onNextStory,
  onClose,
}: {
  story: Story;
  onPreviousStory: () => void;
  onNextStory: () => void;
  onClose: () => void;
}) {
  const [mediaIndex, setMediaIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const gesture = useRef<{ x: number; y: number; startedAt: number } | null>(null);
  const suppressTap = useRef(false);
  const media = story.media[mediaIndex];
  const upcoming = story.media[mediaIndex + 1];
  const paused = manuallyPaused || holding || tabHidden;

  useEffect(() => {
    const syncVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  const goTo = useCallback((target: number) => {
    setProgress(0);
    setManuallyPaused(false);
    setMediaFailed(false);
    setMediaIndex(target);
  }, []);

  const next = useCallback(() => {
    if (mediaIndex < story.media.length - 1) goTo(mediaIndex + 1);
    else onNextStory();
  }, [goTo, mediaIndex, onNextStory, story.media.length]);

  const previous = useCallback(() => {
    if (mediaIndex > 0) goTo(mediaIndex - 1);
    else onPreviousStory();
  }, [goTo, mediaIndex, onPreviousStory]);

  useEffect(() => {
    if (!mediaFailed || paused) return;
    const timer = setTimeout(next, MEDIA_ERROR_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [mediaFailed, paused, next]);

  function startHold(event: PointerEvent<HTMLElement>) {
    if (!(event.target as Element).closest("[data-tap-zone]")) return;
    gesture.current = { x: event.clientX, y: event.clientY, startedAt: performance.now() };
    suppressTap.current = false;
    setHolding(true);
  }

  function endHold(event: PointerEvent<HTMLElement>) {
    setHolding(false);
    const started = gesture.current;
    gesture.current = null;
    if (!started) return;
    const dx = event.clientX - started.x;
    const dy = event.clientY - started.y;
    const horizontal = Math.abs(dx) >= Math.abs(dy);
    const swipedSideways = horizontal && Math.abs(dx) >= SWIPE_MIN_PX;
    const swipedDown = !horizontal && dy >= SWIPE_DOWN_MIN_PX;
    const heldLong = performance.now() - started.startedAt >= HOLD_TO_PAUSE_MS;
    const moved = Math.hypot(dx, dy) > TAP_MAX_MOVE_PX;
    suppressTap.current = swipedSideways || swipedDown || heldLong || moved;
    if (swipedSideways) {
      if (dx < 0) onNextStory();
      else onPreviousStory();
    } else if (swipedDown) {
      onClose();
    }
  }

  function cancelHold() {
    gesture.current = null;
    suppressTap.current = false;
    setHolding(false);
  }

  function tap(action: () => void) {
    if (suppressTap.current) {
      suppressTap.current = false;
      return;
    }
    action();
  }

  return (
    <div
      className="relative mx-auto flex h-full max-w-md flex-col bg-(--black)"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") previous();
        if (event.key === "ArrowRight") next();
      }}
      onPointerDown={startHold}
      onPointerUp={endHold}
      onPointerCancel={cancelHold}
      onPointerLeave={cancelHold}
    >
      {media.type === "IMAGE" ? (
        <ImageSlide key={media.id} url={media.url} alt={story.title} paused={paused || mediaFailed} onProgress={setProgress} onDone={next} onError={() => setMediaFailed(true)} />
      ) : (
        <VideoSlide key={media.id} url={media.url} label={story.title} paused={paused} onProgress={setProgress} onDone={next} onError={() => setMediaFailed(true)} />
      )}

      {upcoming ? <MediaPreload media={upcoming} /> : null}

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-(--black)/70 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-(--black)/80 to-transparent" />

      <div className="absolute inset-x-0 top-0 flex flex-col gap-3 px-3 pt-3">
        <div className="flex gap-1.5">
          {story.media.map((item, itemIndex) => (
            <progress key={item.id} max={100} value={itemIndex < mediaIndex ? 100 : itemIndex === mediaIndex ? progress : 0} className={barClassName} />
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 flex-1 truncate text-sm font-bold">{story.title}</p>
          {media.type === "VIDEO" ? (
            <button
              type="button"
              aria-label={manuallyPaused ? "Retomar vídeo" : "Pausar vídeo"}
              onClick={() => setManuallyPaused((current) => !current)}
              className={iconButtonClassName}
            >
              {manuallyPaused ? <LuPlay aria-hidden="true" size={22} /> : <LuPause aria-hidden="true" size={22} />}
            </button>
          ) : null}
          <button
            type="button"
            autoFocus
            aria-label="Fechar story"
            onClick={onClose}
            className={iconButtonClassName}
          >
            <LuX aria-hidden="true" size={22} />
          </button>
        </div>
      </div>

      <button type="button" data-tap-zone aria-label="Mídia anterior" onClick={() => tap(previous)} className={`${tapZoneClassName} left-0 w-1/3`} />
      <button type="button" data-tap-zone aria-label="Próxima mídia" onClick={() => tap(next)} className={`${tapZoneClassName} right-0 w-2/3`} />

      {mediaFailed ? (
        <p role="status" className="pointer-events-none absolute inset-x-4 top-1/2 z-10 -translate-y-1/2 rounded-2xl bg-(--black)/70 px-4 py-3 text-center text-sm font-semibold">
          Não foi possível carregar esta mídia.
        </p>
      ) : null}

      <div className="pointer-events-none absolute inset-x-4 bottom-22 z-10 flex flex-col gap-2">
        <p className="flex items-center gap-1.5 text-sm font-semibold">
          <LuMapPin aria-hidden="true" className="shrink-0" size={16} />
          {formatLocation(story)}
        </p>
        <ul className="flex flex-wrap gap-1.5">
          <li className={chipClassName}>
            <LuUsers aria-hidden="true" size={14} />
            {story.capacity === 1 ? "1 pessoa" : `Até ${story.capacity} pessoas`}
          </li>
          <li className={chipClassName}>
            <LuTag aria-hidden="true" size={14} />
            {story.acceptedAudiences.length === genderIdentities.length ? "Todos os públicos" : story.acceptedAudiences.map((audience) => genderIdentityLabels[audience]).join(", ")}
          </li>
          <li className={chipClassName}>{formatCents(story.priceCents)} / diária</li>
        </ul>
      </div>

      <Link
        href={`/imoveis/${story.propertyId}/quartos/${story.roomId}`}
        className="absolute inset-x-4 bottom-6 z-10 flex min-h-12 items-center justify-center gap-1 rounded-full bg-(--primary) px-5 text-sm font-bold text-(--on-primary) transition-colors hover:bg-(--primary-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--white)"
      >
        Ver quarto
        <LuChevronRight aria-hidden="true" size={18} />
      </Link>
    </div>
  );
}

type SlideProps = { onProgress: (value: number) => void; onDone: () => void; onError: () => void };

function ImageSlide({ url, alt, paused, onProgress, onDone, onError }: SlideProps & { url: string; alt: string; paused: boolean }) {
  const elapsedMs = useRef(0);

  useEffect(() => {
    if (paused) return;
    let lastFrameAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      elapsedMs.current += now - lastFrameAt;
      lastFrameAt = now;
      const value = Math.min(100, (elapsedMs.current / IMAGE_DURATION_MS) * 100);
      onProgress(value);
      if (value >= 100) onDone();
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, onProgress, onDone]);

  return <Image src={url} alt={alt} fill priority sizes={SLIDE_SIZES} onError={onError} className="object-cover" />;
}

function VideoSlide({ url, label, paused, onProgress, onDone, onError }: SlideProps & { url: string; label: string; paused: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) video.pause();
    else void video.play().catch(() => undefined);
  }, [paused]);

  return (
    <video
      ref={videoRef}
      src={url}
      autoPlay
      playsInline
      aria-label={label}
      onContextMenu={(event) => event.preventDefault()}
      onTimeUpdate={(event) => {
        const { currentTime, duration } = event.currentTarget;
        if (duration > 0) onProgress((currentTime / duration) * 100);
      }}
      onEnded={onDone}
      onError={onError}
      className="size-full object-cover"
    />
  );
}

function MediaPreload({ media }: { media: Story["media"][number] }) {
  if (media.type === "IMAGE") {
    return <Image src={media.url} alt="" fill loading="eager" sizes={SLIDE_SIZES} aria-hidden="true" className="hidden" />;
  }
  return <video src={media.url} preload="auto" muted aria-hidden="true" className="hidden" />;
}
