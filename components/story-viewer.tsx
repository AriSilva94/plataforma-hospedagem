"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { LuChevronRight, LuMapPin, LuTag, LuUsers, LuX } from "react-icons/lu";
import { formatCents, formatLocation, genderIdentities, genderIdentityLabels } from "@/lib/properties";
import type { Story } from "@/lib/stories";

const IMAGE_DURATION_MS = 5000;
const PROGRESS_TICK_MS = 100;

const barClassName =
  "h-1 flex-1 appearance-none overflow-hidden rounded-full bg-(--white)/30 [&::-moz-progress-bar]:bg-(--white) [&::-webkit-progress-bar]:bg-(--white)/30 [&::-webkit-progress-value]:bg-(--white)";

const chipClassName = "inline-flex items-center gap-1.5 rounded-full bg-(--white)/15 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm";

const tapZoneClassName = "absolute inset-y-24 focus-visible:outline-2 focus-visible:outline-(--focus-ring)";

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
  const media = story.media[mediaIndex];

  const goTo = useCallback((target: number) => {
    setProgress(0);
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

  return (
    <div
      className="relative mx-auto flex h-full max-w-md flex-col bg-(--black)"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") previous();
        if (event.key === "ArrowRight") next();
      }}
    >
      {media.type === "IMAGE" ? (
        <ImageSlide key={media.id} url={media.url} alt={story.title} onProgress={setProgress} onDone={next} />
      ) : (
        <VideoSlide key={media.id} url={media.url} label={story.title} onProgress={setProgress} onDone={next} />
      )}

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-(--black)/70 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-(--black)/80 to-transparent" />

      <div className="absolute inset-x-0 top-0 flex flex-col gap-3 px-3 pt-3">
        <div className="flex gap-1.5">
          {story.media.map((item, itemIndex) => (
            <progress key={item.id} max={100} value={itemIndex < mediaIndex ? 100 : itemIndex === mediaIndex ? progress : 0} className={barClassName} />
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-bold">{story.title}</p>
          <button
            type="button"
            autoFocus
            aria-label="Fechar story"
            onClick={onClose}
            className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full text-(--white) transition-colors hover:bg-(--white)/15 focus-visible:outline-2 focus-visible:outline-(--focus-ring)"
          >
            <LuX aria-hidden="true" size={22} />
          </button>
        </div>
      </div>

      <button type="button" aria-label="Mídia anterior" onClick={previous} className={`${tapZoneClassName} left-0 w-1/3`} />
      <button type="button" aria-label="Próxima mídia" onClick={next} className={`${tapZoneClassName} right-0 w-2/3`} />

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

type SlideProps = { onProgress: (value: number) => void; onDone: () => void };

function ImageSlide({ url, alt, onProgress, onDone }: SlideProps & { url: string; alt: string }) {
  useEffect(() => {
    const startedAt = performance.now();
    const timer = setInterval(() => {
      const value = Math.min(100, ((performance.now() - startedAt) / IMAGE_DURATION_MS) * 100);
      onProgress(value);
      if (value >= 100) onDone();
    }, PROGRESS_TICK_MS);
    return () => clearInterval(timer);
  }, [onProgress, onDone]);

  return <Image src={url} alt={alt} fill priority sizes="(min-width: 448px) 448px, 100vw" className="object-cover" />;
}

function VideoSlide({ url, label, onProgress, onDone }: SlideProps & { url: string; label: string }) {
  return (
    <video
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
      onError={onDone}
      className="size-full object-cover"
    />
  );
}
