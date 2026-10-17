import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { RoomCard } from "@/components/room-card";
import type { FavoriteItem } from "@/lib/favorites";

export function FavoritesGrid({ items, loginReturnPath = "/favoritos" }: { items: FavoriteItem[]; loginReturnPath?: string }) {
  const unavailableCount = items.filter((item) => !item.available).length;

  if (items.length === 0) {
    return (
      <section className="mt-6 rounded-2xl border border-dashed border-(--border) p-8 text-center">
        <h2 className="text-lg font-bold text-(--text-primary)">Nenhum quarto salvo ainda</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-(--text-secondary)">
          Toque no coração de um quarto para guardar aqui e comparar com calma depois.
        </p>
        <Link
          href="/#todos"
          className="mt-6 inline-flex min-h-11 items-center rounded-2xl bg-(--primary) px-5 text-sm font-bold text-(--on-primary) transition-colors hover:bg-(--primary-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
        >
          Ver quartos disponíveis
        </Link>
      </section>
    );
  }

  return (
    <>
      <p className="mt-6 text-sm text-(--text-secondary)">
        {items.length === 1 ? "1 quarto salvo" : `${items.length} quartos salvos`}
        {unavailableCount === 1 ? " · 1 indisponível no momento" : unavailableCount > 1 ? ` · ${unavailableCount} indisponíveis no momento` : ""}
      </p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item.roomId}>
            <RoomCard
              room={{ id: item.roomId, title: item.title, priceCents: item.priceCents, coverUrl: item.coverUrl, featured: false, verified: false, property: item.property }}
              unavailable={!item.available}
              action={
                <FavoriteButton
                  roomId={item.roomId}
                  roomTitle={item.title}
                  initialFavorited
                  signedIn
                  loginReturnPath={loginReturnPath}
                  refreshOnChange
                />
              }
            />
          </li>
        ))}
      </ul>
    </>
  );
}
