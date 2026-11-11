import Link from "next/link";
import { isBlockedDay, parseIsoDate, type RoomAvailability } from "@/lib/availability";

const weekdayInitials = ["D", "S", "T", "Q", "Q", "S", "S"];
const spokenDateFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric" });

export function RoomWeekStrip({ href, availability, roomTitle }: { href: string; availability: RoomAvailability; roomTitle: string }) {
  const start = parseIsoDate(availability.today);
  const days = Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset);
    return { day, blocked: isBlockedDay(day, availability) };
  });
  const summary = days.map(({ day, blocked }) => `${spokenDateFormatter.format(day)} ${blocked ? "bloqueado" : "livre"}`).join(", ");

  return (
    <Link
      href={href}
      aria-label={`Disponibilidade de ${roomTitle} nos próximos 7 dias: ${summary}. Abrir calendário`}
      className="inline-flex items-center gap-2.5 rounded-lg py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
    >
      <span aria-hidden="true" className="text-xs font-semibold text-(--text-secondary)">
        Próximos 7 dias
      </span>
      <span aria-hidden="true" className="flex gap-1">
        {days.map(({ day, blocked }) => (
          <span
            key={day.getTime()}
            data-blocked={blocked}
            className="flex h-9 w-6 flex-col items-center justify-center rounded-md border border-(--border-strong) text-(--text-primary) data-[blocked=true]:border-(--error) data-[blocked=true]:bg-(--error)/15 data-[blocked=true]:text-(--error)"
          >
            <span className="text-[10px] leading-none font-semibold">{weekdayInitials[day.getDay()]}</span>
            <span className="mt-0.5 text-xs leading-none font-bold tabular-nums">{day.getDate()}</span>
          </span>
        ))}
      </span>
      <span aria-hidden="true" className="flex flex-col gap-1 text-[11px] leading-none font-semibold text-(--text-primary)">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full border-2 border-(--border-strong)" />
          Livre
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full border-2 border-(--error) bg-(--error)/15" />
          Bloqueado
        </span>
      </span>
    </Link>
  );
}
