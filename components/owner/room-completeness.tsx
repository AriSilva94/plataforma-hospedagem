import Link from "next/link";
import { LuArrowRight, LuArrowUpRight } from "react-icons/lu";
import { completenessHint, isRoomCriterion } from "@/lib/completeness";
import type { CompletenessCriterion } from "@/lib/properties";

export function RoomCompletenessSummary({ score, missingCount }: { score: number; missingCount: number }) {
  const complete = missingCount === 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="font-bold text-white">{score}%</span>
      <progress
        value={score}
        max={100}
        aria-label="Completude do anúncio"
        className={`block h-1.5 w-24 appearance-none overflow-hidden rounded-full bg-(--surface-raised) [&::-webkit-progress-bar]:bg-(--surface-raised) [&::-webkit-progress-value]:rounded-full [&::-moz-progress-bar]:rounded-full ${
          complete
            ? "[&::-moz-progress-bar]:bg-(--success) [&::-webkit-progress-value]:bg-(--success)"
            : "[&::-moz-progress-bar]:bg-(--blue-light) [&::-webkit-progress-value]:bg-(--blue-light)"
        }`}
      />
      <span className={`font-semibold ${complete ? "text-(--success)" : "text-(--warning)"}`}>
        {complete ? "Anúncio completo" : `Faltam ${missingCount} ${missingCount === 1 ? "item" : "itens"}`}
      </span>
    </div>
  );
}

const chipClassName =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full sm:min-h-9 border border-(--line-strong) px-3 text-sm font-semibold text-white transition-colors hover:border-(--blue-light) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light)";

const VISIBLE_ROOM_HINTS = 2;

export function RoomCompletenessHints({
  propertyId,
  roomId,
  missing,
  section,
}: {
  propertyId: string;
  roomId: string;
  missing: CompletenessCriterion[];
  section: string;
}) {
  const roomHints = missing
    .filter(isRoomCriterion)
    .map((criterion) => ({ criterion, ...completenessHint(criterion, propertyId, roomId) }))
    .filter((hint) => hint.href.includes("#") || !hint.href.endsWith(`secao=${section}`));
  const propertyItems = missing.filter((criterion) => !isRoomCriterion(criterion));
  const hiddenRoomHints = roomHints.length - VISIBLE_ROOM_HINTS;
  if (roomHints.length === 0 && propertyItems.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
      {roomHints.slice(0, VISIBLE_ROOM_HINTS).map((hint) => {
        const [path, hash] = hint.href.split("#");
        return hash && path.endsWith(`secao=${section}`) ? (
          <a key={hint.criterion} href={`#${hash}`} className={chipClassName}>
            {hint.label}
            <LuArrowRight aria-hidden="true" size={14} className="text-(--blue-light)" />
          </a>
        ) : (
          <Link key={hint.criterion} href={hint.href} className={chipClassName}>
            {hint.label}
            <LuArrowRight aria-hidden="true" size={14} className="text-(--blue-light)" />
          </Link>
        );
      })}
      {hiddenRoomHints > 0 ? <span className="text-(--gray)">+{hiddenRoomHints} no quarto</span> : null}
      {propertyItems.length > 0 ? (
        <Link href={completenessHint(propertyItems[0], propertyId, roomId).href} className={chipClassName}>
          {propertyItems.length === 1 ? "1 item no imóvel" : `${propertyItems.length} itens no imóvel`}
          <LuArrowUpRight aria-hidden="true" size={14} className="text-(--blue-light)" />
        </Link>
      ) : null}
    </div>
  );
}
