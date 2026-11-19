"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LuCalendarSearch, LuChevronRight } from "react-icons/lu";
import { DatePicker } from "@/components/date-picker";
import { FieldError } from "@/components/field-error";

type Mode = "day" | "period";
type Period = { checkIn: string; checkOut: string };

const modes: { id: Mode; label: string }[] = [
  { id: "day", label: "Por diária" },
  { id: "period", label: "Por período" },
];

const errorId = "consulta-erro";

function nextDay(iso: string) {
  return new Date(Date.parse(`${iso}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
}

export function AvailabilityCheck({ today, windowEnd, period, preview }: { today: string; windowEnd: string; period: Period | null; preview: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const consultedPeriod = period && period.checkOut !== period.checkIn ? period : undefined;
  const [mode, setMode] = useState<Mode>(consultedPeriod ? "period" : "day");
  const [checkIn, setCheckIn] = useState(period?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(consultedPeriod?.checkOut ?? "");
  const [error, setError] = useState<string>();

  const isValid = (iso: string) => /^\d{4}-\d{2}-\d{2}$/.test(iso) && iso >= today && iso <= windowEnd;
  const checkOutMin = isValid(checkIn) && checkIn < windowEnd ? nextDay(checkIn) : today;

  function validate() {
    if (!checkIn) return mode === "day" ? "Escolha a data." : "Escolha a data de entrada.";
    if (!isValid(checkIn)) return "Escolha uma data dentro do calendário.";
    if (mode === "day") return undefined;
    if (!checkOut) return "Escolha a data de saída.";
    if (!isValid(checkOut)) return "Escolha uma data de saída dentro do calendário.";
    if (checkOut <= checkIn) return "A saída deve ser depois da entrada.";
    return undefined;
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = validate();
    setError(message);
    if (message) return;
    const params = new URLSearchParams();
    if (preview) params.set("previa", "1");
    params.set("entrada", checkIn);
    if (mode === "period") params.set("saida", checkOut);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function changeMode(next: Mode) {
    setMode(next);
    setError(undefined);
  }

  return (
    <section aria-labelledby="consulta-titulo" className="mt-3 rounded-xl border border-(--border-accent) bg-(--surface) px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h3 id="consulta-titulo" className="flex items-center gap-2 text-[15px] font-bold text-(--text-primary) sm:text-base">
          <LuCalendarSearch aria-hidden="true" className="size-5 shrink-0 text-(--primary-text)" />
          Consultar disponibilidade
        </h3>
        <div role="group" aria-label="Tipo de consulta" className="inline-flex w-full rounded-lg border border-(--border) bg-(--background) p-0.5 sm:w-auto">
          {modes.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              onClick={() => changeMode(id)}
              className="min-h-8 flex-1 rounded-md px-3.5 text-xs font-bold whitespace-nowrap text-(--text-secondary) transition-colors outline-hidden hover:text-(--text-primary) focus-visible:ring-2 focus-visible:ring-(--focus-ring) aria-pressed:bg-(--primary) aria-pressed:text-(--on-primary) sm:flex-none sm:text-[13px]"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <form noValidate onSubmit={submit} className="mt-2.5 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className={mode === "period" ? "grid grid-cols-2 gap-2" : undefined}>
          <div>
            <label htmlFor="consulta-entrada" className="sr-only">
              {mode === "day" ? "Data" : "Entrada"}
            </label>
            <DatePicker
              id="consulta-entrada"
              value={checkIn}
              onChange={setCheckIn}
              min={today}
              max={windowEnd}
              dialogLabel={mode === "day" ? "Escolha a data" : "Escolha a data de entrada"}
              startView="days"
              placeholder={mode === "day" ? "Escolha a data" : "Entrada"}
              compact
              invalid={Boolean(error) && !isValid(checkIn)}
              describedBy={error ? errorId : undefined}
            />
          </div>
          {mode === "period" ? (
            <div>
              <label htmlFor="consulta-saida" className="sr-only">
                Saída
              </label>
              <DatePicker
                id="consulta-saida"
                value={checkOut}
                onChange={setCheckOut}
                min={checkOutMin}
                max={windowEnd}
                dialogLabel="Escolha a data de saída"
                startView="days"
                placeholder="Saída"
                compact
                align="end"
                invalid={Boolean(error) && isValid(checkIn) && !(isValid(checkOut) && checkOut > checkIn)}
                describedBy={error ? errorId : undefined}
              />
            </div>
          ) : null}
        </div>
        <button
          type="submit"
          className="inline-flex min-h-10.5 items-center justify-center gap-1.5 rounded-xl bg-(--primary) px-4 text-sm font-bold text-(--on-primary) transition-colors hover:bg-(--primary-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
        >
          Ver quartos disponíveis
          <LuChevronRight aria-hidden="true" size={18} />
        </button>
      </form>
      <FieldError id={errorId} message={error} />
    </section>
  );
}
