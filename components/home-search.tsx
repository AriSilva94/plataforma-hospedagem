"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { LuHouse, LuSearch } from "react-icons/lu";
import { CitySearchInput } from "@/components/city-search-input";
import { DatePicker } from "@/components/date-picker";
import { FieldError } from "@/components/field-error";
import { fromLocationValue, homeSearchSchema, type HomeSearchValues } from "@/lib/home-search";

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function bookingWindow() {
  const today = new Date();
  const limit = new Date(
    today.getFullYear() + 1,
    today.getMonth(),
    today.getDate(),
  );
  return { min: isoDate(today), max: isoDate(limit) };
}

const actionFocus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)";
const labelClassName =
  "mb-1.5 block text-[13px] leading-5 font-semibold text-(--text-primary)";
const cityErrorId = "busca-cidade-erro";

export function HomeSearch() {
  const router = useRouter();
  const [dateRange] = useState(bookingWindow);
  const { control, handleSubmit, formState } = useForm<HomeSearchValues>({
    resolver: zodResolver(homeSearchSchema),
    defaultValues: { location: "", checkIn: "" },
    reValidateMode: "onChange",
  });
  const cityError = formState.errors.location?.message;

  function search({ location, checkIn }: HomeSearchValues) {
    const { city, state } = fromLocationValue(location);
    const params = new URLSearchParams({ cidade: city, uf: state });
    if (checkIn) params.set("entrada", checkIn);
    router.push(`/anuncios?${params.toString()}`);
  }

  return (
    <section
      aria-labelledby="busca-titulo"
      className="rounded-[1.75rem] border border-(--border) bg-(--surface) p-4 md:p-5"
    >
      <h2 id="busca-titulo" className="sr-only">
        Buscar quartos
      </h2>
      <form
        noValidate
        onSubmit={handleSubmit(search)}
        className="grid gap-2.5 md:grid-cols-2 md:gap-x-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_auto_auto] xl:items-start"
      >
        <div>
          <label htmlFor="busca-cidade" className={labelClassName}>
            Para onde você vai?
            <span aria-hidden="true" className="text-(--error)">
              {" "}*
            </span>
          </label>
          <Controller
            control={control}
            name="location"
            render={({ field }) => (
              <CitySearchInput
                ref={field.ref}
                id="busca-cidade"
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Digite uma cidade"
                invalid={Boolean(cityError)}
                describedBy={cityError ? cityErrorId : undefined}
              />
            )}
          />
          <FieldError id={cityErrorId} message={cityError} />
        </div>
        <div>
          <label htmlFor="busca-entrada" className={labelClassName}>
            Quando precisa do quarto?
          </label>
          <Controller
            control={control}
            name="checkIn"
            render={({ field }) => (
              <DatePicker
                id="busca-entrada"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                min={dateRange.min}
                max={dateRange.max}
                dialogLabel="Escolha a data de entrada"
                startView="days"
              />
            )}
          />
        </div>
        <button
          type="submit"
          className={`inline-flex min-h-12.5 items-center justify-center gap-2 rounded-xl bg-(--primary) px-6 text-sm font-bold text-(--on-primary) transition-colors hover:bg-(--primary-hover) xl:mt-6.5 ${actionFocus}`}
        >
          <LuSearch aria-hidden="true" size={18} />
          Ver quartos disponíveis
        </button>
        <Link
          href="/cadastro"
          className={`relative hidden min-h-12.5 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-(--text-secondary) transition-colors hover:bg-(--surface-raised) hover:text-(--text-primary) md:inline-flex xl:mt-6.5 xl:ml-2 xl:before:absolute xl:before:inset-y-2.5 xl:before:-left-3 xl:before:w-px xl:before:bg-(--border) ${actionFocus}`}
        >
          <LuHouse aria-hidden="true" size={17} />
          Anunciar espaço
        </Link>
      </form>
    </section>
  );
}
