"use client";

import { useState } from "react";
import { LuChevronLeft, LuChevronRight, LuMinus, LuPlus, LuX } from "react-icons/lu";
import { useFieldPopover } from "@/components/use-field-popover";
import { isBlockedDay, isOutsideWindow, parseIsoDate, type RoomAvailability } from "@/lib/availability";

const dayInMs = 86_400_000;
const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"];
const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
const longDateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric" });
const shortDateFormatter = new Intl.DateTimeFormat("pt-BR");

const navigationButtonClassName =
  "flex size-9 shrink-0 items-center justify-center rounded-xl text-(--text-secondary) outline-hidden transition-colors hover:bg-(--primary-soft) hover:text-(--text-primary) focus-visible:ring-2 focus-visible:ring-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";
const fieldButtonClassName =
  "flex min-w-0 flex-col items-start px-3 py-2.5 text-left outline-hidden transition-colors hover:bg-(--primary-soft) focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:ring-inset data-[active=true]:bg-(--primary-soft) data-[active=true]:ring-2 data-[active=true]:ring-(--primary) data-[active=true]:ring-inset";
const stepperButtonClassName =
  "flex size-9 items-center justify-center rounded-full border border-(--border) text-(--text-primary) outline-hidden transition-colors hover:border-(--text-secondary) focus-visible:ring-2 focus-visible:ring-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-(--border)";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(month: Date, offset: number) {
  return new Date(month.getFullYear(), month.getMonth() + offset, 1);
}

export function MonthGrid({
  month,
  isDisabled,
  checkIn,
  rangeEnd,
  onSelect,
  onHover,
}: {
  month: Date;
  isDisabled: (day: Date) => boolean;
  checkIn?: Date;
  rangeEnd?: Date;
  onSelect: (day: Date) => void;
  onHover: (day?: Date) => void;
}) {
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: dayCount }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1));

  function rangePosition(day: Date) {
    if (!checkIn || !rangeEnd) return undefined;
    const time = day.getTime();
    if (time === checkIn.getTime()) return "start";
    if (time === rangeEnd.getTime()) return "end";
    if (time > checkIn.getTime() && time < rangeEnd.getTime()) return "middle";
    return undefined;
  }

  return (
    <div className="calendar-view" onPointerLeave={() => onHover(undefined)}>
      <div className="grid grid-cols-7" aria-hidden="true">
        {weekdays.map((weekday, index) => (
          <span key={index} className="flex h-7 items-center justify-center text-xs font-bold text-(--text-secondary)">
            {weekday}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: month.getDay() }, (_, index) => (
          <span key={index} />
        ))}
        {days.map((day) => {
          const selected = day.getTime() === checkIn?.getTime() || day.getTime() === rangeEnd?.getTime();
          return (
            <div
              key={day.getTime()}
              data-range={rangePosition(day)}
              className="flex justify-center data-[range=end]:bg-linear-to-l data-[range=end]:from-transparent data-[range=end]:from-50% data-[range=end]:to-(--primary-soft) data-[range=end]:to-50% data-[range=middle]:bg-(--primary-soft) data-[range=start]:bg-linear-to-r data-[range=start]:from-transparent data-[range=start]:from-50% data-[range=start]:to-(--primary-soft) data-[range=start]:to-50%"
            >
              <button
                type="button"
                disabled={isDisabled(day)}
                data-selected={selected}
                aria-pressed={selected}
                aria-label={longDateFormatter.format(day)}
                onClick={() => onSelect(day)}
                onPointerEnter={() => onHover(day)}
                onFocus={() => onHover(day)}
                className="flex size-10 items-center md:size-9 justify-center rounded-full text-sm font-semibold text-(--text-primary) tabular-nums outline-hidden transition-colors hover:ring-1 hover:ring-(--text-primary) focus-visible:ring-2 focus-visible:ring-(--focus-ring) disabled:cursor-not-allowed disabled:text-(--text-secondary) disabled:line-through disabled:opacity-50 disabled:hover:ring-0 data-[selected=true]:bg-(--primary) data-[selected=true]:text-(--on-primary)"
              >
                {day.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function firstBlockedAfter(checkIn: Date, availability: RoomAvailability) {
  const windowEnd = parseIsoDate(availability.windowEnd);
  const day = new Date(checkIn);
  do {
    day.setDate(day.getDate() + 1);
  } while (day <= windowEnd && !isBlockedDay(day, availability));
  return day;
}

export function StayPicker({ capacity, availability }: { capacity: number; availability?: RoomAvailability }) {
  const { anchorRef, isOpen, open, close, rootProps, panelProps } = useFieldPopover<HTMLButtonElement>();
  const [clientToday, setClientToday] = useState(startOfToday);
  const today = availability ? parseIsoDate(availability.today) : clientToday;
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(today));
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [hovered, setHovered] = useState<Date>();
  const [guests, setGuests] = useState(1);

  const previewEnd = checkIn && !checkOut && hovered && hovered > checkIn ? hovered : undefined;
  const rangeEnd = checkOut ?? previewEnd;
  const nights = checkIn && checkOut ? Math.round((checkOut.getTime() - checkIn.getTime()) / dayInMs) : 0;
  const choosingCheckOut = isOpen && Boolean(checkIn) && !checkOut;
  const lastMonth = availability ? startOfMonth(parseIsoDate(availability.windowEnd)) : undefined;

  function isDayDisabled(day: Date) {
    if (day < today) return true;
    if (!availability) return false;
    if (isOutsideWindow(day, availability) || isBlockedDay(day, availability)) return true;
    if (!checkIn || checkOut || day <= checkIn) return false;
    return day > firstBlockedAfter(checkIn, availability);
  }

  function openCalendar() {
    const currentDay = startOfToday();
    setClientToday(currentDay);
    setVisibleMonth(startOfMonth(checkIn ?? (availability ? today : currentDay)));
    open();
  }

  function selectDay(day: Date) {
    if (!checkIn || checkOut || day <= checkIn) {
      setCheckIn(day);
      setCheckOut(undefined);
      return;
    }
    setCheckOut(day);
  }

  function clearDates() {
    setCheckIn(undefined);
    setCheckOut(undefined);
  }

  return (
    <div className="rounded-xl border border-(--border)">
      <div
        {...rootProps}
        className="relative"
        onKeyDown={(event) => {
          if (event.key === "Escape" && isOpen) {
            event.preventDefault();
            event.stopPropagation();
            close(true);
          }
        }}
      >
        <div className="grid grid-cols-2 divide-x divide-(--border) overflow-hidden rounded-t-xl">
          <button
            ref={anchorRef}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            data-active={isOpen && !choosingCheckOut}
            onClick={() => (isOpen ? close() : openCalendar())}
            className={`${fieldButtonClassName} rounded-tl-xl`}
          >
            <span className="text-[11px] font-bold tracking-wide text-(--text-primary) uppercase">Check-in</span>
            <span className="text-sm text-(--text-secondary) tabular-nums">{checkIn ? shortDateFormatter.format(checkIn) : "Adicionar data"}</span>
          </button>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            data-active={choosingCheckOut}
            onClick={() => (isOpen ? close() : openCalendar())}
            className={`${fieldButtonClassName} rounded-tr-xl`}
          >
            <span className="text-[11px] font-bold tracking-wide text-(--text-primary) uppercase">Checkout</span>
            <span className="text-sm text-(--text-secondary) tabular-nums">{checkOut ? shortDateFormatter.format(checkOut) : "Adicionar data"}</span>
          </button>
        </div>

        <div {...panelProps} data-align="end" role="dialog" aria-label="Selecionar datas da estadia" className="field-popover w-full p-4 md:w-160 md:p-5">
          <div aria-live="polite">
            <p className="text-base font-bold text-(--text-primary)">
              {nights ? `${nights} ${nights === 1 ? "noite" : "noites"}` : checkIn ? "Selecione o checkout" : "Selecione o check-in"}
            </p>
            <p className="text-sm text-(--text-secondary)">
              {checkIn && checkOut ? `${longDateFormatter.format(checkIn)} – ${longDateFormatter.format(checkOut)}` : "Adicione as datas da viagem"}
            </p>
          </div>

          {isOpen ? (
            <div className="mt-3 grid gap-6 md:grid-cols-2">
              {[visibleMonth, addMonths(visibleMonth, 1)].map((month, index) => (
                <div key={index} className={index === 1 ? "hidden md:block" : undefined}>
                  <div className="mb-1 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      aria-label="Mês anterior"
                      disabled={visibleMonth <= startOfMonth(today)}
                      onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}
                      className={`${navigationButtonClassName} ${index === 1 ? "invisible" : ""}`}
                    >
                      <LuChevronLeft aria-hidden="true" size={18} />
                    </button>
                    <p className="text-sm font-bold text-(--text-primary) first-letter:uppercase">{monthFormatter.format(month)}</p>
                    <button
                      type="button"
                      aria-label="Próximo mês"
                      disabled={lastMonth !== undefined && visibleMonth >= lastMonth}
                      onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
                      className={`${navigationButtonClassName} ${index === 0 ? "md:invisible" : ""}`}
                    >
                      <LuChevronRight aria-hidden="true" size={18} />
                    </button>
                  </div>
                  <MonthGrid key={month.getTime()} month={month} isDisabled={isDayDisabled} checkIn={checkIn} rangeEnd={rangeEnd} onSelect={selectDay} onHover={setHovered} />
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-(--border) pt-3">
            <button
              type="button"
              onClick={clearDates}
              disabled={!checkIn}
              className="rounded-xl px-3 py-2 text-sm font-bold text-(--text-primary) underline-offset-2 outline-hidden transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:no-underline"
            >
              Limpar datas
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => close(true)}
                className="rounded-xl bg-(--primary) px-4 py-2 text-sm font-bold text-(--on-primary) outline-hidden transition-colors hover:bg-(--primary-hover) focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:ring-offset-2"
              >
                Salvar
              </button>
              <button type="button" aria-label="Fechar calendário" onClick={() => close(true)} className={navigationButtonClassName}>
                <LuX aria-hidden="true" size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-(--border) px-3 py-2.5">
        <div>
          <p className="text-[11px] font-bold tracking-wide text-(--text-primary) uppercase">Hóspedes</p>
          <p className="text-sm text-(--text-secondary)" aria-live="polite">
            {guests} {guests === 1 ? "hóspede" : "hóspedes"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Remover hóspede" disabled={guests <= 1} onClick={() => setGuests(guests - 1)} className={stepperButtonClassName}>
            <LuMinus aria-hidden="true" size={16} />
          </button>
          <button type="button" aria-label="Adicionar hóspede" disabled={guests >= capacity} onClick={() => setGuests(guests + 1)} className={stepperButtonClassName}>
            <LuPlus aria-hidden="true" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
