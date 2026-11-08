"use client";

import { useEffect, useRef, useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { FormStatus } from "@/components/owner/form-actions";
import { primaryButtonClassName, secondaryButtonClassName } from "@/components/owner/styles";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { parseIsoDate, roomAvailabilitySchema, toIsoDate, weekdayNames, weekdayShortLabels, type RoomAvailability } from "@/lib/availability";

const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
const longDateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric" });
const weekdayInitials = ["D", "S", "T", "Q", "Q", "S", "S"];

const navigationButtonClassName =
  "flex size-9 shrink-0 items-center justify-center rounded-xl text-(--text-secondary) outline-hidden transition-colors hover:bg-(--primary-soft) hover:text-(--text-primary) focus-visible:ring-2 focus-visible:ring-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";
const dayClassName =
  "flex size-10 touch-none items-center justify-center rounded-full text-sm font-semibold text-(--text-primary) tabular-nums outline-hidden select-none hover:ring-1 hover:ring-(--text-primary) focus-visible:ring-2 focus-visible:ring-(--focus-ring) disabled:cursor-not-allowed disabled:text-(--text-secondary) disabled:line-through disabled:opacity-50 disabled:hover:ring-0 aria-pressed:bg-(--error-soft) aria-pressed:text-(--error) aria-pressed:line-through md:size-9 data-[weekly=true]:ring-1 data-[weekly=true]:ring-(--error)/40";
const chipClassName =
  "flex min-h-9 items-center justify-center rounded-full border border-(--border) bg-(--surface) text-sm font-semibold text-(--text-primary) outline-hidden transition-colors hover:border-(--text-secondary) focus-visible:ring-2 focus-visible:ring-(--focus-ring) aria-pressed:border-(--error)/40 aria-pressed:bg-(--error-soft) aria-pressed:text-(--error)";

type Draft = { dates: Set<string>; weekdays: Set<number> };
type Drag = { anchor: string; blocked: boolean; base: Set<string> };

function toDraft(availability: Pick<RoomAvailability, "blockedDates" | "blockedWeekdays">): Draft {
  return { dates: new Set(availability.blockedDates), weekdays: new Set(availability.blockedWeekdays) };
}

function differences<T>(first: Set<T>, second: Set<T>) {
  return [...first].filter((item) => !second.has(item)).length + [...second].filter((item) => !first.has(item)).length;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(month: Date, offset: number) {
  return new Date(month.getFullYear(), month.getMonth() + offset, 1);
}

function datesBetween(first: string, second: string) {
  const [from, to] = first <= second ? [first, second] : [second, first];
  const dates: string[] = [];
  for (const day = parseIsoDate(from); toIsoDate(day) <= to; day.setDate(day.getDate() + 1)) dates.push(toIsoDate(day));
  return dates;
}

export function AvailabilityEditor({ roomId, initial }: { roomId: string; initial: RoomAvailability }) {
  const today = parseIsoDate(initial.today);
  const windowEnd = parseIsoDate(initial.windowEnd);
  const [saved, setSaved] = useState(() => toDraft(initial));
  const [draft, setDraft] = useState(() => toDraft(initial));
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(today));
  const [hint, setHint] = useState<string>();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [pending, setPending] = useState(false);
  const drag = useRef<Drag>(undefined);

  useEffect(() => {
    function endDrag() {
      drag.current = undefined;
    }
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    return () => {
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, []);

  const changeCount = differences(draft.dates, saved.dates) + differences(draft.weekdays, saved.weekdays);
  const dayCount = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: dayCount }, (_, index) => new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index + 1));

  function isBlocked(day: Date) {
    return draft.weekdays.has(day.getDay()) || draft.dates.has(toIsoDate(day));
  }

  function setDates(dates: Set<string>) {
    setDraft((current) => ({ ...current, dates }));
  }

  function clearFeedback() {
    setHint(undefined);
    setMessage(undefined);
    setError(undefined);
  }

  function showWeeklyHint(day: Date) {
    setMessage(undefined);
    setHint(`${weekdayNames[day.getDay()]} estão bloqueados toda semana. Desmarque abaixo para liberar.`);
  }

  function startDrag(day: Date) {
    clearFeedback();
    if (draft.weekdays.has(day.getDay())) {
      showWeeklyHint(day);
      return;
    }
    const anchor = toIsoDate(day);
    const blocked = !draft.dates.has(anchor);
    drag.current = { anchor, blocked, base: draft.dates };
    const dates = new Set(draft.dates);
    if (blocked) dates.add(anchor);
    else dates.delete(anchor);
    setDates(dates);
  }

  function extendDrag(day: Date) {
    const current = drag.current;
    if (!current) return;
    const dates = new Set(current.base);
    for (const iso of datesBetween(current.anchor, toIsoDate(day))) {
      if (draft.weekdays.has(parseIsoDate(iso).getDay())) continue;
      if (current.blocked) dates.add(iso);
      else dates.delete(iso);
    }
    setDates(dates);
  }

  function toggleWithKeyboard(day: Date) {
    if (draft.weekdays.has(day.getDay())) {
      showWeeklyHint(day);
      return;
    }
    clearFeedback();
    const iso = toIsoDate(day);
    const dates = new Set(draft.dates);
    if (!dates.delete(iso)) dates.add(iso);
    setDates(dates);
  }

  function toggleWeekday(weekday: number) {
    clearFeedback();
    const weekdays = new Set(draft.weekdays);
    if (weekdays.delete(weekday)) {
      setDraft({ ...draft, weekdays });
      return;
    }
    weekdays.add(weekday);
    setDraft({ weekdays, dates: new Set([...draft.dates].filter((iso) => parseIsoDate(iso).getDay() !== weekday)) });
  }

  async function save() {
    clearFeedback();
    setPending(true);
    try {
      const response = await sendApiRequest(`/owner/rooms/${roomId}/availability`, {
        method: "PUT",
        body: JSON.stringify({ blockedWeekdays: [...draft.weekdays].sort(), blockedDates: [...draft.dates].sort() }),
      });
      const confirmed = roomAvailabilitySchema.parse(response);
      setSaved(toDraft(confirmed));
      setDraft(toDraft(confirmed));
      setMessage("Disponibilidade salva.");
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    } finally {
      setPending(false);
    }
  }

  function discard() {
    clearFeedback();
    setDraft({ dates: new Set(saved.dates), weekdays: new Set(saved.weekdays) });
  }

  return (
    <div className="max-w-md py-6">
      <p className="mb-4 text-sm leading-relaxed text-(--text-secondary)">
        Todo dia começa livre. Toque nos dias em que o quarto não recebe hóspedes ou arraste para marcar um período.
      </p>

      <div className="mb-1 flex items-center justify-between gap-1">
        <button
          type="button"
          aria-label="Mês anterior"
          disabled={visibleMonth <= startOfMonth(today)}
          onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}
          className={navigationButtonClassName}
        >
          <LuChevronLeft aria-hidden="true" size={18} />
        </button>
        <p className="text-sm font-bold text-(--text-primary) first-letter:uppercase">{monthFormatter.format(visibleMonth)}</p>
        <button
          type="button"
          aria-label="Próximo mês"
          disabled={visibleMonth >= startOfMonth(windowEnd)}
          onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
          className={navigationButtonClassName}
        >
          <LuChevronRight aria-hidden="true" size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7" aria-hidden="true">
        {weekdayInitials.map((letter, index) => (
          <span key={index} className="flex h-7 items-center justify-center text-xs font-bold text-(--text-secondary)">
            {letter}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: visibleMonth.getDay() }, (_, index) => (
          <span key={index} />
        ))}
        {days.map((day) => {
          const blocked = isBlocked(day);
          return (
            <div key={day.getTime()} className="flex justify-center">
              <button
                type="button"
                disabled={day < today || day > windowEnd}
                aria-pressed={blocked}
                aria-label={`${longDateFormatter.format(day)}, ${blocked ? "bloqueado" : "livre"}`}
                data-weekly={draft.weekdays.has(day.getDay())}
                className={dayClassName}
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  event.currentTarget.releasePointerCapture(event.pointerId);
                  startDrag(day);
                }}
                onPointerEnter={() => extendDrag(day)}
                onClick={(event) => {
                  if (event.detail === 0) toggleWithKeyboard(day);
                }}
              >
                {day.getDate()}
              </button>
            </div>
          );
        })}
      </div>

      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-(--text-secondary)">
        {hint}
      </p>

      <div className="mt-2 flex gap-4 text-xs text-(--text-secondary)">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-full border border-(--border) bg-(--surface)" />
          Livre
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-full border border-(--error)/40 bg-(--error-soft)" />
          Bloqueado
        </span>
      </div>

      <p className="mt-5 text-sm font-bold text-(--text-primary)">Bloquear toda semana</p>
      <p className="text-xs text-(--text-secondary)">Vale para todas as datas futuras.</p>
      <div className="mt-2.5 grid grid-cols-7 gap-1.5">
        {weekdayShortLabels.map((label, weekday) => (
          <button key={label} type="button" aria-pressed={draft.weekdays.has(weekday)} onClick={() => toggleWeekday(weekday)} className={chipClassName}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-(--border) pt-4">
        <p role="status" className="text-sm text-(--text-secondary)">
          {changeCount === 0 ? "Nenhuma alteração" : changeCount === 1 ? "1 alteração não salva" : `${changeCount} alterações não salvas`}
        </p>
        <div className="flex gap-2">
          <button type="button" disabled={changeCount === 0 || pending} onClick={discard} className={secondaryButtonClassName}>
            Descartar
          </button>
          <button type="button" disabled={changeCount === 0 || pending} onClick={() => void save()} className={primaryButtonClassName}>
            {pending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
      <div className="mt-3">
        <FormStatus error={error} saved={message} />
      </div>
    </div>
  );
}
