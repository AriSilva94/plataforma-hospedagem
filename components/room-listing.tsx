"use client";

import { useEffect, useRef, useState } from "react";
import { FavoriteButton } from "@/components/favorite-button";
import { RoomCard } from "@/components/room-card";
import { apiFetch } from "@/lib/api";
import { publicRoomPageSchema, roomListingPageSize, type PublicRoomPage } from "@/lib/properties";

export function RoomListing({ initial, favoriteRoomIds, signedIn }: { initial: PublicRoomPage | null; favoriteRoomIds: string[]; signedIn: boolean }) {
  const [favorites] = useState(() => new Set(favoriteRoomIds));
  const [items, setItems] = useState(initial?.items ?? []);
  const [nextCursor, setNextCursor] = useState(initial?.nextCursor ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initial ? undefined : "Não foi possível carregar os quartos agora. Tente novamente em alguns instantes.");
  const loadingRef = useRef(loading);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  async function loadMore(cursor: string) {
    setLoading(true);
    setError(undefined);
    try {
      const response = await apiFetch(`/rooms?limit=${roomListingPageSize}&cursor=${encodeURIComponent(cursor)}`);
      if (!response.ok) throw new Error();
      const next = publicRoomPageSchema.parse(await response.json());
      setItems((current) => [...current, ...next.items.filter((item) => !current.some((existing) => existing.id === item.id))]);
      setNextCursor(next.nextCursor);
    } catch {
      setError("Não foi possível carregar mais quartos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !nextCursor) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !loadingRef.current) {
          void loadMore(nextCursor);
        }
      },
      { rootMargin: "800px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [nextCursor]);

  return (
    <>
      {items.length > 0 ? (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-12 lg:grid-cols-4">
          {items.map((room) => (
            <li key={room.id}>
              <RoomCard
                room={room}
                action={
                  <FavoriteButton
                    roomId={room.id}
                    roomTitle={room.title}
                    initialFavorited={favorites.has(room.id)}
                    signedIn={signedIn}
                    loginReturnPath="/#todos"
                  />
                }
              />
            </li>
          ))}
        </ul>
      ) : initial ? (
        <p className="mx-auto mt-10 max-w-xl rounded-2xl border border-dashed border-(--border) p-6 text-center text-sm text-(--text-secondary)">Ainda não há quartos disponíveis. Volte em breve.</p>
      ) : null}
      {error ? (
        <div className="mt-6 flex flex-col items-center gap-3">
          <p role="alert" className="text-center text-sm font-semibold text-(--error)">{error}</p>
          {nextCursor ? (
            <button type="button" onClick={() => void loadMore(nextCursor)} className="min-h-10 rounded-2xl border border-(--border-strong) px-5 text-sm font-semibold text-(--text-primary) transition-colors hover:bg-(--text-primary)/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)">
              Tentar novamente
            </button>
          ) : null}
        </div>
      ) : null}
      {nextCursor ? (
        <div ref={sentinelRef} aria-hidden="true" className="h-1" />
      ) : null}
      {loading ? <p className="mt-8 text-center text-sm text-(--text-secondary)">Carregando mais quartos...</p> : null}
    </>
  );
}
