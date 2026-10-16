"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type Ref } from "react";
import { LuCalendarDays, LuChevronDown, LuChevronLeft, LuChevronRight, LuInfo } from "react-icons/lu";
import { useFieldPopover } from "@/components/use-field-popover";

type View = "days" | "months" | "years";
type Month = { year: number; month: number };

const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const weekdays = [
  { short: "D", name: "domingo" },
  { short: "S", name: "segunda-feira" },
  { short: "T", name: "terça-feira" },
  { short: "Q", name: "quarta-feira" },
  { short: "Q", name: "quinta-feira" },
  { short: "S", name: "sexta-feira" },
  { short: "S", name: "sábado" },
];

const navigationButtonClassName =
  "flex size-9 shrink-0 items-center justify-center rounded-xl text-(--text-secondary) outline-hidden transition-colors hover:bg-(--text-primary)/8 hover:text-(--text-primary) focus-visible:ring-2 focus-visible:ring-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-(--text-secondary)";
const headingButtonClassName =
  "group/heading inline-flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm font-bold capitalize outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-(--focus-ring)";
const monthHeadingClassName = `${headingButtonClassName} text-(--text-primary) hover:bg-(--text-primary)/8`;
const yearHeadingClassName = `${headingButtonClassName} text-(--primary-text) tabular-nums hover:bg-(--primary-soft)`;
const headingChevronClassName = "opacity-60 transition-opacity group-hover/heading:opacity-100";
const gridButtonClassName =
  "rounded-lg text-sm font-semibold text-(--on-primary) outline-hidden transition-colors hover:bg-(--text-primary)/8 focus-visible:ring-2 focus-visible:ring-(--focus-ring) disabled:cursor-not-allowed disabled:text-(--text-secondary) disabled:opacity-35 disabled:hover:bg-transparent data-[selected=true]:bg-(--primary) data-[selected=true]:text-(--on-primary) data-[selected=true]:hover:bg-(--primary-hover)";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toIso(year: number, month: number, day: number) {
  return `${String(year).padStart(4, "0")}-${pad(month + 1)}-${pad(day)}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function parseIso(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const [year, month, day] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
  if (month > 11 || day < 1 || day > daysInMonth(year, month)) return undefined;
  return { year, month, day };
}

function maskDate(text: string) {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join("/");
}

function toDisplay(value: string) {
  const date = parseIso(value);
  return date ? `${pad(date.day)}/${pad(date.month + 1)}/${String(date.year).padStart(4, "0")}` : value;
}

function fromDisplay(text: string) {
  const masked = maskDate(text);
  const [day, month, year] = masked.split("/");
  const iso = year?.length === 4 ? `${year}-${month}-${day}` : "";
  return parseIso(iso) ? iso : masked;
}

export function DatePicker({
  id,
  value,
  onChange,
  onBlur,
  min,
  max,
  dialogLabel,
  hint,
  disabled = false,
  invalid = false,
  describedBy,
  ref,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  min: string;
  max: string;
  dialogLabel: string;
  hint?: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  ref?: Ref<HTMLInputElement>;
}) {
  const { anchorRef, panelRef, isOpen, open, close, rootProps, panelProps } = useFieldPopover<HTMLButtonElement>();
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = parseIso(value);
  const minDate = parseIso(min);
  const maxDate = parseIso(max);
  const [view, setView] = useState<View>("days");
  const [cursor, setCursor] = useState<Month>({ year: maxDate?.year ?? 2000, month: maxDate?.month ?? 0 });
  const [focusedIso, setFocusedIso] = useState("");

  const isSelectable = (iso: string) => iso >= min && iso <= max;
  const dayCount = daysInMonth(cursor.year, cursor.month);
  const days = Array.from({ length: dayCount }, (_, index) => toIso(cursor.year, cursor.month, index + 1));
  const leadingBlanks = new Date(cursor.year, cursor.month, 1).getDay();
  const tabbableIso =
    [focusedIso, value].find((iso) => days.includes(iso) && isSelectable(iso)) ?? days.find(isSelectable) ?? "";
  const years = minDate && maxDate ? Array.from({ length: maxDate.year - minDate.year + 1 }, (_, index) => maxDate.year - index) : [];
  const canGoBack = toIso(cursor.year, cursor.month, 1) > min;
  const canGoForward = toIso(cursor.year, cursor.month, dayCount) < max;

  useEffect(() => {
    if (!isOpen) return;
    const target = panelRef.current?.querySelector<HTMLElement>('[data-autofocus="true"]');
    if (document.activeElement !== inputRef.current) target?.focus({ preventScroll: true });
    if (view === "years") target?.scrollIntoView({ block: "center" });
  }, [isOpen, view, focusedIso, panelRef]);

  function openCalendar() {
    setView(selected ? "days" : "years");
    if (selected) setCursor({ year: selected.year, month: selected.month });
    setFocusedIso(selected ? value : "");
    open();
  }

  function moveMonth(offset: number) {
    const next = new Date(cursor.year, cursor.month + offset, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
  }

  function clampMonth(year: number, month: number): Month {
    const first = toIso(year, month, 1);
    if (maxDate && first > max) return { year: maxDate.year, month: maxDate.month };
    if (minDate && toIso(year, month, daysInMonth(year, month)) < min) return { year: minDate.year, month: minDate.month };
    return { year, month };
  }

  function handleDayKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = parseIso(tabbableIso);
    if (!current) return;
    const offsets: Record<string, [number, number]> = {
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
      ArrowUp: [0, -7],
      ArrowDown: [0, 7],
      PageUp: [-1, 0],
      PageDown: [1, 0],
    };
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    const [monthOffset, dayOffset] = offset;
    const targetMonth = new Date(current.year, current.month + monthOffset, 1);
    const day = Math.min(current.day, daysInMonth(targetMonth.getFullYear(), targetMonth.getMonth()));
    const target = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day + dayOffset);
    const iso = toIso(target.getFullYear(), target.getMonth(), target.getDate());
    const clamped = iso < min ? min : iso > max ? max : iso;
    const next = parseIso(clamped);
    if (!next) return;
    setCursor({ year: next.year, month: next.month });
    setFocusedIso(clamped);
  }

  function select(iso: string) {
    onChange(iso);
    close(true);
  }

  return (
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
      <div
        data-open={isOpen}
        data-invalid={invalid}
        data-disabled={disabled}
        className="group flex items-center rounded-xl border border-(--border-strong) bg-(--background) transition-colors hover:border-(--text-secondary) focus-within:border-(--primary) focus-within:ring-2 focus-within:ring-(--focus-ring) data-[disabled=true]:cursor-not-allowed data-[disabled=true]:border-(--border) data-[disabled=true]:bg-(--surface) data-[invalid=true]:border-(--error) data-[invalid=true]:focus-within:ring-(--error) data-[open=true]:border-(--primary)"
      >
        <button
          ref={anchorRef}
          type="button"
          disabled={disabled}
          aria-label={isOpen ? "Fechar calendário" : "Abrir calendário"}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={() => (isOpen ? close() : openCalendar())}
          className="ml-1.5 flex size-9 shrink-0 items-center justify-center rounded-xl text-(--primary-text) outline-hidden transition-colors hover:bg-(--primary-soft) hover:text-(--primary-text) focus-visible:bg-(--primary-soft) focus-visible:text-(--primary-text) aria-expanded:bg-(--primary-soft) aria-expanded:text-(--primary-text) disabled:cursor-not-allowed disabled:text-(--text-secondary) disabled:opacity-60 disabled:hover:bg-transparent"
        >
          <LuCalendarDays aria-hidden="true" size={18} />
        </button>
        <input
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="DD/MM/AAAA"
          maxLength={10}
          disabled={disabled}
          value={toDisplay(value)}
          aria-invalid={invalid ? "true" : undefined}
          aria-describedby={describedBy}
          onChange={(event) => {
            const next = fromDisplay(event.target.value);
            const typed = parseIso(next);
            if (typed && isSelectable(next)) {
              setCursor({ year: typed.year, month: typed.month });
              setView("days");
            }
            onChange(next);
          }}
          onClick={() => {
            if (!isOpen) openCalendar();
          }}
          onBlur={onBlur}
          className="min-w-0 flex-1 rounded-r-xl bg-transparent py-3 pr-4 pl-0.5 text-(--text-primary) tabular-nums caret-(--primary) outline-hidden placeholder:text-(--text-secondary) disabled:cursor-not-allowed disabled:text-(--text-secondary)"
        />
      </div>

      <div {...panelProps} role="dialog" aria-label={dialogLabel} className="field-popover w-full p-3 sm:w-80">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={view === "months" ? "Ano anterior" : "Mês anterior"}
            disabled={view === "years" || !canGoBack}
            onClick={() => (view === "months" ? setCursor(clampMonth(cursor.year - 1, cursor.month)) : moveMonth(-1))}
            className={navigationButtonClassName}
          >
            <LuChevronLeft aria-hidden="true" size={18} />
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5" aria-live="polite">
            {view === "days" ? (
              <button type="button" onClick={() => setView("months")} className={monthHeadingClassName}>
                {monthNames[cursor.month]}
                <LuChevronDown aria-hidden="true" size={14} className={headingChevronClassName} />
              </button>
            ) : null}
            {view === "years" ? (
              <span className="px-2 py-1.5 text-sm font-bold text-(--primary-text)">Selecione o ano</span>
            ) : (
              <button type="button" onClick={() => setView("years")} className={yearHeadingClassName}>
                {cursor.year}
                <LuChevronDown aria-hidden="true" size={14} className={headingChevronClassName} />
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label={view === "months" ? "Próximo ano" : "Próximo mês"}
            disabled={view === "years" || !canGoForward}
            onClick={() => (view === "months" ? setCursor(clampMonth(cursor.year + 1, cursor.month)) : moveMonth(1))}
            className={navigationButtonClassName}
          >
            <LuChevronRight aria-hidden="true" size={18} />
          </button>
        </div>

        {view === "days" ? (
          <div key={`${cursor.year}-${cursor.month}`} className="calendar-view mt-2" onKeyDown={handleDayKeyDown}>
            <div className="grid grid-cols-7" aria-hidden="true">
              {weekdays.map((weekday) => (
                <span key={weekday.name} className="flex h-8 items-center justify-center text-xs font-bold text-(--text-secondary)">
                  {weekday.short}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5">
              {Array.from({ length: leadingBlanks }, (_, index) => (
                <span key={index} />
              ))}
              {days.map((iso, index) => (
                <button
                  key={iso}
                  type="button"
                  disabled={!isSelectable(iso)}
                  tabIndex={iso === tabbableIso ? 0 : -1}
                  data-autofocus={iso === tabbableIso}
                  data-selected={iso === value}
                  aria-pressed={iso === value}
                  aria-label={`${index + 1} de ${monthNames[cursor.month]} de ${cursor.year}`}
                  onClick={() => select(iso)}
                  className={`${gridButtonClassName} mx-auto flex size-10 items-center justify-center rounded-full tabular-nums data-[selected=true]:rounded-full`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {view === "months" ? (
          <div key={cursor.year} className="calendar-view mt-2 grid grid-cols-3 gap-1.5">
            {monthNames.map((name, month) => (
              <button
                key={name}
                type="button"
                disabled={toIso(cursor.year, month, 1) > max || toIso(cursor.year, month, daysInMonth(cursor.year, month)) < min}
                data-autofocus={month === cursor.month}
                data-selected={selected?.year === cursor.year && selected.month === month}
                onClick={() => {
                  setCursor({ year: cursor.year, month });
                  setView("days");
                }}
                className={`${gridButtonClassName} h-12 capitalize`}
              >
                {name.slice(0, 3)}
              </button>
            ))}
          </div>
        ) : null}

        {view === "years" ? (
          <div className="calendar-view field-scroll mt-2 grid max-h-64 grid-cols-4 gap-1.5 overflow-y-auto pr-1">
            {years.map((year) => (
              <button
                key={year}
                type="button"
                data-autofocus={year === cursor.year}
                data-selected={selected?.year === year}
                onClick={() => {
                  setCursor(clampMonth(year, cursor.month));
                  setView("months");
                }}
                className={`${gridButtonClassName} h-11 tabular-nums`}
              >
                {year}
              </button>
            ))}
          </div>
        ) : null}

        {hint || value ? (
          <div className="mt-3 flex min-h-9 items-center justify-between gap-3 border-t border-(--border) pt-3">
            {hint ? (
              <p className="flex min-w-0 items-center gap-2 rounded-lg bg-(--primary-soft) px-2.5 py-1.5 text-xs leading-snug font-semibold text-(--text-primary)">
                <LuInfo aria-hidden="true" size={14} className="shrink-0 text-(--primary-text)" />
                {hint}
              </p>
            ) : (
              <span />
            )}
            {value ? (
              <button
                type="button"
                onClick={() => select("")}
                className="shrink-0 rounded-xl px-2.5 py-1.5 text-xs font-bold text-(--text-secondary) outline-hidden transition-colors hover:bg-(--text-primary)/8 hover:text-(--text-primary) focus-visible:ring-2 focus-visible:ring-(--focus-ring)"
              >
                Limpar
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
