"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { LuCheck, LuSlidersHorizontal, LuX } from "react-icons/lu";
import { CitySearchInput } from "@/components/city-search-input";
import { propertyTypeIcons } from "@/components/property-type-tag";
import { useFieldPopover } from "@/components/use-field-popover";
import { fromLocationValue } from "@/lib/home-search";
import { genderIdentityLabels, propertyTypeLabels, type GenderIdentity, type PropertyType } from "@/lib/properties";
import { activeFilterCount, filtersSearch, formatPrice, priceRangeMax, priceRangeStep, type RoomFilters } from "@/lib/room-filters";

const keyboardCommitDelayMs = 400;
const activeTriggerClassName = "border-(--primary) bg-(--primary-soft) text-(--primary-text)";
const idleTriggerClassName = "border-(--border) text-(--text-primary) hover:border-(--text-secondary)";
const collapsedActiveClassName = "max-xl:border-(--primary) max-xl:bg-(--primary-soft) max-xl:text-(--primary-text)";
const inlineActiveClassName = "xl:border-(--primary) xl:bg-(--primary-soft) xl:text-(--primary-text)";

const labelTextClassName = "text-[13px] leading-5 font-semibold text-(--text-primary)";
const labelClassName = `mb-1.5 block ${labelTextClassName}`;
const focusClassName = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)";
const chipClassName =
  "group inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-(--border) bg-(--background) px-3.5 text-sm font-semibold text-(--text-primary) transition-colors hover:border-(--text-secondary) has-focus-visible:ring-2 has-focus-visible:ring-(--focus-ring) has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-(--surface) ";

const typeChipClassNames: Record<PropertyType, { chip: string; icon: string }> = {
  HOUSE: {
    chip: "has-checked:border-(--terracotta)/60 has-checked:bg-(--terracotta-soft) has-checked:text-(--terracotta)",
    icon: "text-(--terracotta)",
  },
  APARTMENT: {
    chip: "has-checked:border-(--champagne)/60 has-checked:bg-(--champagne-soft) has-checked:text-(--champagne)",
    icon: "text-(--champagne)",
  },
  MOTEL: {
    chip: "has-checked:border-(--lavender)/60 has-checked:bg-(--lavender-soft) has-checked:text-(--lavender)",
    icon: "text-(--lavender)",
  },
};

const propertyTypes = Object.keys(propertyTypeLabels) as PropertyType[];
const audiences = Object.keys(genderIdentityLabels) as GenderIdentity[];
const clearedRefinements: Partial<RoomFilters> = { types: [], maxPrice: undefined, audience: undefined };

type Apply = (next: Partial<RoomFilters>) => void;

function AudienceField({ idPrefix, audience, apply }: { idPrefix: string; audience?: GenderIdentity; apply: Apply }) {
  const options: { value?: GenderIdentity; label: string }[] = [{ label: "Todos" }, ...audiences.map((value) => ({ value, label: genderIdentityLabels[value] }))];

  return (
    <fieldset>
      <legend className={labelClassName}>Quarto aceita</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(({ value, label }) => (
          <label
            key={label}
            className={`${chipClassName} has-checked:border-(--primary) has-checked:bg-(--primary-soft) has-checked:text-(--primary-text)`}
          >
            <input
              type="radio"
              name={`${idPrefix}-publico`}
              checked={audience === value}
              onChange={() => apply({ audience: value })}
              className="sr-only"
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function TypeField({ types, apply, inline = false }: { types: PropertyType[]; apply: Apply; inline?: boolean }) {
  function toggle(type: PropertyType) {
    const next = types.includes(type) ? types.filter((item) => item !== type) : [...types, type];
    apply({ types: next });
  }

  return (
    <fieldset>
      <legend className={labelClassName}>Tipo de imóvel</legend>
      <div className={inline ? "flex items-center gap-2" : "flex flex-wrap gap-2"}>
        {propertyTypes.map((type) => {
          const Icon = propertyTypeIcons[type];
          const { chip, icon } = typeChipClassNames[type];
          return (
            <label key={type} className={`${chipClassName} ${chip}`}>
              <input type="checkbox" checked={types.includes(type)} onChange={() => toggle(type)} className="sr-only" />
              <Icon aria-hidden="true" size={16} className={icon} />
              {propertyTypeLabels[type]}
              <LuCheck aria-hidden="true" size={14} strokeWidth={3} className="-mr-0.5 hidden group-has-checked:block" />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function PriceField({ idPrefix, maxPrice, onCommit }: { idPrefix: string; maxPrice?: number; onCommit: (max: number | undefined) => void }) {
  const committed = Math.min(maxPrice ?? priceRangeMax, priceRangeMax);
  const [value, setValue] = useState(committed);
  const [syncedFrom, setSyncedFrom] = useState(committed);
  const keyboardTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputId = `${idPrefix}-diaria`;

  if (syncedFrom !== committed) {
    setSyncedFrom(committed);
    setValue(committed);
  }

  useEffect(() => () => clearTimeout(keyboardTimer.current), []);

  function commit() {
    clearTimeout(keyboardTimer.current);
    if (value === committed) return;
    onCommit(value < priceRangeMax ? value : undefined);
  }

  function commitAfterKeys() {
    clearTimeout(keyboardTimer.current);
    keyboardTimer.current = setTimeout(commit, keyboardCommitDelayMs);
  }

  const valueText = value >= priceRangeMax ? "Qualquer valor" : `Até ${formatPrice(value)}`;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className={labelTextClassName}>
          Diária
        </label>
        <span aria-hidden="true" className="text-[13px] leading-5 font-semibold text-(--text-secondary) tabular-nums">
          {valueText}
        </span>
      </div>
      <div className="price-range">
        <div aria-hidden="true" className="price-range-track">
          <progress value={value} max={priceRangeMax} className="price-range-upper" />
        </div>
        <input
          id={inputId}
          type="range"
          min={priceRangeStep}
          max={priceRangeMax}
          step={priceRangeStep}
          value={value}
          aria-valuetext={valueText}
          onChange={(event) => setValue(Number(event.target.value))}
          onPointerUp={commit}
          onKeyUp={commitAfterKeys}
        />
      </div>
    </div>
  );
}

function CountBadge({ count, className = "inline-flex" }: { count: number; className?: string }) {
  if (count === 0) return null;
  return (
    <span className={`size-5 items-center justify-center rounded-full bg-(--primary) text-xs font-bold text-(--on-primary) ${className}`}>
      {count}
      <span className="sr-only">{count === 1 ? " ativo" : " ativos"}</span>
    </span>
  );
}

function MoreFilters({ view, apply }: { view: RoomFilters; apply: Apply }) {
  const { anchorRef, isOpen, open, close, rootProps, panelProps } = useFieldPopover<HTMLButtonElement>();
  const audienceCount = view.audience ? 1 : 0;
  const collapsedCount = audienceCount + (view.types.length > 0 ? 1 : 0);

  return (
    <div
      {...rootProps}
      onKeyDown={(event) => {
        if (event.key === "Escape" && isOpen) {
          event.preventDefault();
          close(true);
        }
      }}
      className="relative hidden shrink-0 md:block"
    >
      <button
        ref={anchorRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls="filtros-mais-painel"
        onClick={() => (isOpen ? close() : open())}
        className={`inline-flex min-h-11 min-w-40 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${isOpen ? activeTriggerClassName : idleTriggerClassName} ${collapsedCount > 0 ? collapsedActiveClassName : ""} ${audienceCount > 0 ? inlineActiveClassName : ""} ${focusClassName}`}
      >
        <LuSlidersHorizontal aria-hidden="true" size={18} />
        <span className="xl:hidden">Filtros</span>
        <span className="hidden xl:inline">Mais filtros</span>
        <CountBadge count={collapsedCount} className="inline-flex xl:hidden" />
        <CountBadge count={audienceCount} className="hidden xl:inline-flex" />
      </button>
      <div {...panelProps} data-side="bottom" id="filtros-mais-painel" role="group" aria-label="Mais filtros" data-align="end" className="field-popover field-scroll max-h-[calc(100dvh-11rem)] w-92 overflow-y-auto p-4">
        <div className="flex flex-col gap-5">
          <div className="xl:hidden">
            <TypeField types={view.types} apply={apply} />
          </div>
          <AudienceField idPrefix="mais" audience={view.audience} apply={apply} />
        </div>
      </div>
    </div>
  );
}

export function ListingFilters({ filters, total }: { filters: RoomFilters; total?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [view, setView] = useOptimistic(filters);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const sheetRef = useRef<HTMLDialogElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const { location } = view;
  const refinementCount = activeFilterCount(view);
  const hasFilters = Boolean(location) || refinementCount > 0;

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    if (sheetOpen && !sheet.open) sheet.showModal();
    if (!sheetOpen && sheet.open) sheet.close();
    document.body.classList.toggle("scroll-locked", sheetOpen);
    return () => document.body.classList.remove("scroll-locked");
  }, [sheetOpen]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const section = sectionRef.current;
    if (!sentinel || !section) return;
    const stickyTop = parseFloat(getComputedStyle(section).top) || 0;
    const observer = new IntersectionObserver(([entry]) => setStuck(entry ? !entry.isIntersecting : false), {
      rootMargin: `-${stickyTop + 1}px 0px 0px 0px`,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const apply: Apply = (next) => {
    const merged = { ...view, ...next };
    const query = filtersSearch(searchParams.toString(), merged);
    startTransition(() => {
      setView(merged);
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  const commitPrice = (max: number | undefined) => apply({ maxPrice: max });

  const resultsLabel = isPending
    ? "Atualizando…"
    : total === undefined
      ? "Ver quartos"
      : total === 0
        ? "Nenhum quarto encontrado"
        : `Ver ${total} ${total === 1 ? "quarto" : "quartos"}`;

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="mt-6 h-px" />
      <section
        ref={sectionRef}
        aria-labelledby="filtros-titulo"
        data-stuck={stuck}
        data-filters-pending={isPending}
        className="sticky top-19.25 z-15 -mt-px rounded-2xl border border-(--border) bg-(--surface) p-3 transition-shadow data-[stuck=true]:shadow-[0_0.75rem_1.5rem_-0.75rem_color-mix(in_srgb,var(--shadow)_45%,transparent)] md:top-21.25 md:p-4"
      >
        <h2 id="filtros-titulo" className="sr-only">
          Filtros
        </h2>

        <div className="flex items-end gap-2 md:gap-3">
          <div className="min-w-0 flex-1">
            <label htmlFor="filtro-cidade" className={labelClassName}>
              Cidade
            </label>
            <CitySearchInput
              key={location ? `${location.city}|${location.state}` : ""}
              id="filtro-cidade"
              defaultValue={location}
              required={false}
              placeholder="Digite uma cidade"
              compact
              onChange={(value) => {
                if (!value) return;
                const next = fromLocationValue(value);
                apply({ location: next });
              }}
              onClear={location ? () => apply({ location: undefined }) : undefined}
            />
          </div>

          <div className="hidden min-w-0 flex-1 md:block">
            <PriceField idPrefix="filtro" maxPrice={view.maxPrice} onCommit={commitPrice} />
          </div>

          <div className="hidden shrink-0 xl:block">
            <TypeField types={view.types} apply={apply} inline />
          </div>

          <MoreFilters view={view} apply={apply} />

          <button
            type="button"
            disabled={!hasFilters}
            onClick={() => apply({ location: undefined, ...clearedRefinements })}
            aria-label="Limpar filtros"
            className={`hidden min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-sm font-semibold text-(--text-secondary) transition-colors hover:bg-(--text-primary)/5 hover:text-(--text-primary) md:inline-flex ${hasFilters ? "" : "invisible"} ${focusClassName}`}
          >
            <LuX aria-hidden="true" size={16} />
            Limpar
          </button>

          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setSheetOpen(true)}
            className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition-colors sm:px-4 md:hidden ${refinementCount > 0 ? activeTriggerClassName : idleTriggerClassName} ${focusClassName}`}
          >
            <LuSlidersHorizontal aria-hidden="true" size={18} />
            <span className="sr-only sm:not-sr-only">Filtros</span>
            <CountBadge count={refinementCount} />
          </button>
        </div>

        <dialog
          ref={sheetRef}
          aria-labelledby="filtros-painel-titulo"
          onClose={() => setSheetOpen(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget) setSheetOpen(false);
          }}
          className="filter-sheet inset-x-0 top-auto bottom-0 m-0 w-full max-w-full rounded-t-3xl border border-b-0 border-(--border) bg-(--surface) p-0 text-(--text-primary) md:hidden"
        >
          {sheetOpen ? (
            <div className="flex max-h-[85dvh] flex-col">
              <div className="flex items-center justify-between gap-3 border-b border-(--border) px-5 py-3">
                <h2 id="filtros-painel-titulo" className="text-lg font-bold">
                  Filtros
                </h2>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label="Fechar filtros"
                  className={`-mr-2 inline-flex size-11 items-center justify-center rounded-xl text-(--text-secondary) hover:bg-(--text-primary)/5 hover:text-(--text-primary) ${focusClassName}`}
                >
                  <LuX aria-hidden="true" size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-7 overflow-y-auto px-5 py-6">
                <PriceField idPrefix="painel" maxPrice={view.maxPrice} onCommit={commitPrice} />
                <TypeField types={view.types} apply={apply} />
                <AudienceField idPrefix="painel" audience={view.audience} apply={apply} />
              </div>
              <div className="flex items-center gap-3 border-t border-(--border) px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                {refinementCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => apply(clearedRefinements)}
                    className={`min-h-12 rounded-xl px-3 text-sm font-semibold text-(--text-secondary) underline underline-offset-2 hover:text-(--text-primary) ${focusClassName}`}
                  >
                    Limpar
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-live="polite"
                  className={`ml-auto inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-(--primary) px-5 text-sm font-bold text-(--on-primary) transition-colors hover:bg-(--primary-hover) ${focusClassName}`}
                >
                  {resultsLabel}
                </button>
              </div>
            </div>
          ) : null}
        </dialog>
      </section>
    </>
  );
}
