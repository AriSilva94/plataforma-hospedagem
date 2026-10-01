import type { ReactNode } from "react";
import { ListedIndicator } from "@/components/admin/listed-indicator";
import { cardClassName } from "@/components/owner/styles";
import { formatPlace, type AdminRoom } from "@/lib/admin";

export function AdminRoomCard({ room, badges, details, aside }: { room: AdminRoom; badges: ReactNode; details?: ReactNode; aside: ReactNode }) {
  return (
    <li className={`${cardClassName} flex flex-col gap-4 md:flex-row md:items-center md:justify-between`}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="wrap-break-word font-bold text-white">{room.title}</h2>
          {badges}
        </div>
        <p className="mt-1 wrap-break-word text-sm text-(--gray)">{[room.property.title, formatPlace(room.property)].filter(Boolean).join(" · ")}</p>
        {details}
        <ListedIndicator listed={room.listed} hiddenLabel="Fora da home: quarto, imóvel ou proprietário inativo" />
      </div>
      <div className="shrink-0">{aside}</div>
    </li>
  );
}
