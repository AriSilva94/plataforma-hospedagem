"use client";

import { useEffect, useRef, useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { FavoriteButton } from "@/components/favorite-button";
import { RoomCard } from "@/components/room-card";
import type { PublicRoomCard } from "@/lib/properties";

const arrowClassName =
  "absolute top-[30%] z-10 hidden size-11 items-center justify-center rounded-full bg-(--white) text-(--navy) shadow-[0_10px_24px_color-mix(in_srgb,var(--black)_40%,transparent)] transition-colors hover:bg-(--blue-pale) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light) md:flex";

export function FeaturedRooms({
  rooms,
  favoriteRoomIds,
  signedIn,
}: {
  rooms: PublicRoomCard[];
  favoriteRoomIds: string[];
  signedIn: boolean;
}) {
  const railRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  function measure() {
    const rail = railRef.current;
    if (!rail) return;
    setEdges({
      start: rail.scrollLeft <= 1,
      end: rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1,
    });
  }

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    return () => observer.disconnect();
  }, []);

  function scrollByPage(direction: 1 | -1) {
    const rail = railRef.current;
    rail?.scrollBy({ left: direction * rail.clientWidth });
  }

  return (
    <div className="relative mt-10 md:mt-12">
      {edges.start ? null : (
        <button type="button" aria-label="Ver destaques anteriores" onClick={() => scrollByPage(-1)} className={`${arrowClassName} -left-4`}>
          <LuChevronLeft aria-hidden="true" size={20} />
        </button>
      )}
      <ul
        ref={railRef}
        onScroll={measure}
        className="-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto scroll-smooth px-6 [scrollbar-width:none] motion-reduce:scroll-auto md:mx-0 md:scroll-px-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {rooms.map((room) => (
          <li key={room.id} className="w-[78%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]">
            <RoomCard
              room={room}
              action={
                <FavoriteButton
                  roomId={room.id}
                  roomTitle={room.title}
                  initialFavorited={favoriteRoomIds.includes(room.id)}
                  signedIn={signedIn}
                  loginReturnPath="/#destaques-titulo"
                />
              }
            />
          </li>
        ))}
      </ul>
      {edges.end ? null : (
        <button type="button" aria-label="Ver próximos destaques" onClick={() => scrollByPage(1)} className={`${arrowClassName} -right-4`}>
          <LuChevronRight aria-hidden="true" size={20} />
        </button>
      )}
    </div>
  );
}
