"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { FaCrown } from "react-icons/fa6";
import { LuStar } from "react-icons/lu";
import { StoryViewer } from "@/components/story-viewer";
import type { Story } from "@/lib/stories";

const actionFocus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)";

const VIEWED_STORAGE_KEY = "viewed-stories";

const viewedListeners = new Set<() => void>();

function subscribeViewed(listener: () => void) {
  viewedListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    viewedListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getViewedSnapshot() {
  try {
    return localStorage.getItem(VIEWED_STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function parseViewed(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function HomeStories({ stories }: { stories: Story[] }) {
  const viewedRaw = useSyncExternalStore(subscribeViewed, getViewedSnapshot, () => "[]");
  const viewed = useMemo(() => parseViewed(viewedRaw), [viewedRaw]);
  const [viewer, setViewer] = useState<{ queue: Story[]; index: number } | null>(null);

  const ordered = useMemo(() => [...stories.filter((story) => !viewed.includes(story.roomId)), ...stories.filter((story) => viewed.includes(story.roomId))], [stories, viewed]);

  if (stories.length === 0) return null;

  function markViewed(roomId: string) {
    if (viewed.includes(roomId)) return;
    try {
      localStorage.setItem(VIEWED_STORAGE_KEY, JSON.stringify([...viewed, roomId]));
    } catch {
      return;
    }
    viewedListeners.forEach((listener) => listener());
  }

  function open(queue: Story[], index: number) {
    markViewed(queue[index].roomId);
    setViewer({ queue, index });
  }

  function changeIndex(index: number | null) {
    if (!viewer) return;
    if (index === null) setViewer(null);
    else open(viewer.queue, index);
  }

  return (
    <section aria-labelledby="stories-titulo" className="mb-3 flex flex-col gap-2.5 short:max-sm:mb-2 short:max-sm:gap-1.5 md:mb-4">
      <div className="flex items-center justify-between gap-4">
        <h2 id="stories-titulo" className="flex items-center gap-2 text-lg font-extrabold tracking-[-0.01em] text-(--text-primary) md:text-xl">
          <LuStar aria-hidden="true" className="shrink-0 fill-(--gold) text-(--gold)" size={22} />
          Locais em destaque
        </h2>
        <Link href="/anuncios" className={`shrink-0 text-sm font-bold text-(--primary-text) underline underline-offset-2 ${actionFocus}`}>
          Ver todos
        </Link>
      </div>

      <ul className="-mx-6 flex gap-4 overflow-x-auto px-6 py-2 [scrollbar-width:none] md:-mx-10 md:px-10 lg:-mx-12 lg:px-12 [&::-webkit-scrollbar]:hidden">
        {ordered.map((story, index) => {
          const [first] = story.media;
          return (
            <li key={story.roomId} className="w-24 shrink-0">
              <button
                type="button"
                onClick={() => open(ordered, index)}
                aria-label={`Abrir story de ${story.title}`}
                className={`group flex w-full flex-col items-center gap-3 rounded-2xl ${actionFocus}`}
              >
                <span className="relative">
                  <span className={`relative block size-18 overflow-hidden rounded-full bg-(--surface-raised) ring-2 ${viewed.includes(story.roomId) ? "ring-(--border-strong)" : "ring-(--primary)"} ring-offset-2 ring-offset-(--background) transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100`}>
                    {first.type === "IMAGE" ? (
                      <Image src={first.url} alt="" fill sizes="72px" className="object-cover" />
                    ) : (
                      <video src={`${first.url}#t=0.1`} muted playsInline preload="metadata" aria-hidden="true" className="size-full object-cover" />
                    )}
                  </span>
                  <span aria-hidden="true" className="absolute -bottom-1 left-1/2 flex size-6 -translate-x-1/2 items-center justify-center rounded-full bg-(--black) text-(--gold) ring-2 ring-(--story-badge-ring)">
                    <FaCrown size={13} />
                  </span>
                </span>
                <span className="flex w-full flex-col items-center gap-1">
                  <span className="w-full truncate text-center text-[13px] leading-tight font-extrabold text-(--text-primary)">{story.title}</span>
                  <span className="flex w-full justify-center text-xs leading-tight font-bold text-(--primary-text)">
                    <span className="truncate">{story.city}</span>
                    {story.city && story.state ? <span className="shrink-0 whitespace-pre"> · </span> : null}
                    <span className="shrink-0">{story.state}</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <StoryViewer stories={viewer?.queue ?? ordered} index={viewer?.index ?? null} onIndexChange={changeIndex} />
    </section>
  );
}
