"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type Ref } from "react";
import { LuLoaderCircle, LuMapPin, LuX } from "react-icons/lu";
import { HighlightedLabel } from "@/components/combobox";
import { IconInput } from "@/components/icon-input";
import { useFieldPopover } from "@/components/use-field-popover";
import { sendApiRequest } from "@/lib/api";
import { citySuggestionsSchema, toLocationValue, type CityLocation } from "@/lib/home-search";

const minimumQueryLength = 2;
const suggestionDelayMs = 250;

type Suggestions = { term: string; cities: CityLocation[] | null };

function useCitySuggestions(term: string) {
  const [result, setResult] = useState<Suggestions>();
  const enabled = term.length >= minimumQueryLength;

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const timer = setTimeout(() => {
      sendApiRequest(`/locations/cities?${new URLSearchParams({ q: term }).toString()}`, { method: "GET" })
        .then((body) => citySuggestionsSchema.parse(body))
        .then(
          (cities) => active && setResult({ term, cities }),
          () => active && setResult({ term, cities: null }),
        );
    }, suggestionDelayMs);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [enabled, term]);

  const current = result?.term === term || !enabled ? result : undefined;
  return {
    shownTerm: current?.term ?? term,
    cities: current?.cities ?? [],
    loading: enabled && !current,
    failed: current?.cities === null,
  };
}

function cityLabel({ city, state }: CityLocation) {
  return `${city}, ${state}`;
}

export function CitySearchInput({
  id,
  onChange,
  onBlur,
  placeholder,
  invalid,
  describedBy,
  defaultValue,
  required = true,
  compact = false,
  onClear,
  ref,
}: {
  id: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder: string;
  invalid?: boolean;
  describedBy?: string;
  defaultValue?: CityLocation;
  required?: boolean;
  compact?: boolean;
  onClear?: () => void;
  ref?: Ref<HTMLInputElement>;
}) {
  const { anchorRef, isOpen, open, close, rootProps, panelProps } = useFieldPopover<HTMLInputElement>();
  const listRef = useRef<HTMLUListElement>(null);
  const [text, setText] = useState(defaultValue ? cityLabel(defaultValue) : "");
  const [selectedText, setSelectedText] = useState(defaultValue ? cityLabel(defaultValue) : undefined);
  const [activeIndex, setActiveIndex] = useState(0);
  const term = selectedText === text ? "" : text.trim();
  const { shownTerm, cities, loading, failed } = useCitySuggestions(term);
  const listId = `${id}-sugestoes`;
  const showPanel = isOpen && term.length >= minimumQueryLength;
  const activeCity = showPanel ? cities[activeIndex] : undefined;

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, cities]);

  function select(location: CityLocation) {
    const label = cityLabel(location);
    setText(label);
    setSelectedText(label);
    onChange(toLocationValue(location));
    close();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) open();
      setActiveIndex(Math.min(activeIndex + 1, Math.max(0, cities.length - 1)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(Math.max(activeIndex - 1, 0));
    } else if (event.key === "Enter" && activeCity) {
      event.preventDefault();
      select(activeCity);
    } else if (event.key === "Escape" && showPanel) {
      event.preventDefault();
      close();
    }
  }

  const status = loading
    ? "Buscando cidades..."
    : failed
      ? "Não foi possível buscar as cidades. Tente digitar de novo."
      : cities.length === 0
        ? "Nenhuma cidade encontrada."
        : undefined;

  return (
    <div {...rootProps} className="relative">
      <IconInput
        ref={(node) => {
          anchorRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        id={id}
        icon={LuMapPin}
        compact={compact}
        trailingSpace={Boolean(onClear)}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-activedescendant={activeCity ? `${id}-opcao-${activeIndex}` : undefined}
        aria-required={required ? "true" : undefined}
        aria-invalid={invalid ? "true" : undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        placeholder={placeholder}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setActiveIndex(0);
          if (selectedText !== undefined) {
            setSelectedText(undefined);
            onChange("");
          }
          open();
        }}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
      />
      {loading ? (
        <LuLoaderCircle
          aria-hidden="true"
          size={18}
          className={`pointer-events-none absolute top-1/2 ${onClear ? "right-11" : "right-4"} -translate-y-1/2 animate-spin text-(--text-secondary) motion-reduce:animate-none`}
        />
      ) : null}
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Limpar cidade"
          className="absolute top-1/2 right-1.5 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-(--text-secondary) transition-colors hover:bg-(--text-primary)/5 hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-(--focus-ring)"
        >
          <LuX aria-hidden="true" size={16} />
        </button>
      ) : null}

      <div {...panelProps} data-state={showPanel ? "open" : "closed"} className="field-popover w-full overflow-hidden">
        <ul ref={listRef} id={listId} role="listbox" aria-label="Cidades sugeridas" className="field-scroll max-h-72 overflow-y-auto p-1.5">
          {status ? null : cities.map((location, index) => (
            <li
              key={toLocationValue(location)}
              id={`${id}-opcao-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              data-active={index === activeIndex}
              onPointerMove={() => setActiveIndex(index)}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => select(location)}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm text-(--text-primary) data-[active=true]:bg-(--text-primary)/8 sm:min-h-10"
            >
              <span className="min-w-0 flex-1 truncate">
                <HighlightedLabel label={location.city} query={shownTerm} />
              </span>
              <span className="shrink-0 rounded-md bg-(--text-primary)/5 px-1.5 py-0.5 text-xs leading-4 font-bold tracking-wider text-(--text-secondary) ring-1 ring-(--border) ring-inset">
                {location.state}
              </span>
            </li>
          ))}
        </ul>
        {status ? (
          <p role="status" className="px-4 py-6 text-center text-sm text-(--text-secondary)">
            {status}
          </p>
        ) : null}
      </div>
    </div>
  );
}
