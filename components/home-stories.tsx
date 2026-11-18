"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaCrown } from "react-icons/fa6";
import { LuStar } from "react-icons/lu";
import { StoryViewer } from "@/components/story-viewer";
import type { Story } from "@/lib/stories";

const actionFocus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)";

export function HomeStories({ stories }: { stories: Story[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (stories.length === 0) return null;

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

      <ul className="-mx-6 flex gap-4 overflow-x-auto px-6 py-1 [scrollbar-width:none] md:-mx-10 md:px-10 lg:-mx-12 lg:px-12 [&::-webkit-scrollbar]:hidden">
        {stories.map((story, index) => {
          const [first] = story.media;
          return (
            <li key={story.roomId} className="w-20 shrink-0">
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Abrir story de ${story.title}`}
                className={`group flex w-full flex-col items-center gap-2 rounded-2xl ${actionFocus}`}
              >
                <span className="relative">
                  <span className="relative block size-18 overflow-hidden rounded-full bg-(--surface-raised) ring-2 ring-(--primary) ring-offset-2 ring-offset-(--background) transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
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
                <span className="line-clamp-2 w-full text-center text-xs leading-tight font-semibold text-(--text-primary)">{story.title}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <StoryViewer stories={stories} index={activeIndex} onIndexChange={setActiveIndex} />
    </section>
  );
}
